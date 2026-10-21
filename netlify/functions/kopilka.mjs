// Копилкин — сервер. Один endpoint POST /api/kopilka { action, ... }.
// Кто открыл приложение, проверяем по подписи Telegram (заголовок X-Telegram-Init-Data + BOT_TOKEN).
// Данные — в Netlify Blobs: одна копилка = один JSON-документ, запись с проверкой etag,
// чтобы одновременные действия двух партнёров не затирали друг друга.
import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

export const config = { path: "/api/kopilka" };

const TYPES = ["deposit", "saved", "expense"];
const KINDS = ["ai", "habit", "budget"];
const ID_RE = /^[a-z0-9]{6,40}$/;
const CODE_RE = /^[a-z0-9]{6,40}$/;
const MAX_JSON = 60000;
const MAX_LOG = 5000;
const AUTH_MAX_AGE = 30 * 86400; // секунд: initData живёт, пока открыто приложение

class ApiError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}

const store = () => getStore({ name: "kopilkin", consistency: "strong" });
const coupleKey = (id) => `couples/${id}`;
const memberKey = (uid) => `members/${uid}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Проверка Telegram initData (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app) ── */
export function verifyInitData(initData, botToken, now = Math.floor(Date.now() / 1000)) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const check = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calc = crypto.createHmac("sha256", secret).update(check).digest("hex");
  if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
  const authDate = Number(params.get("auth_date"));
  if (!authDate || now - authDate > AUTH_MAX_AGE) return null;
  let user = null;
  try { user = JSON.parse(params.get("user") || "null"); } catch (e) { return null; }
  if (!user || !user.id) return null;
  return { user, start_param: params.get("start_param") || "" };
}

let botUsername = process.env.BOT_USERNAME || null;
async function botName() {
  if (botUsername) return botUsername;
  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getMe`);
    const j = await r.json();
    if (j.ok) botUsername = j.result.username;
  } catch (e) { /* не критично: ссылку-приглашение просто не покажем */ }
  return botUsername;
}

/* ── Хранилище ── */
async function getCouple(id) {
  return store().get(coupleKey(id), { type: "json" });
}

// Изменить копилку: читаем с etag, меняем, пишем «только если никто не успел раньше», иначе повторяем.
async function mutate(id, fn) {
  const s = store();
  for (let attempt = 0; attempt < 8; attempt++) {
    const cur = await s.getWithMetadata(coupleKey(id), { type: "json" });
    if (!cur || !cur.data) throw new ApiError("NO_COUPLE", 404);
    const next = fn(structuredClone(cur.data));
    if (next === undefined) return cur.data;
    next.version = (cur.data.version || 0) + 1;
    next.updatedAt = Date.now();
    const res = cur.etag
      ? await s.setJSON(coupleKey(id), next, { onlyIfMatch: cur.etag })
      : (await s.setJSON(coupleKey(id), next), { modified: true });
    if (res.modified !== false) return next;
    await sleep(40 + Math.random() * 120);
  }
  throw new ApiError("BUSY", 409);
}

async function snapshot(doc, uid) {
  const log = [...(doc.log || [])].sort((a, b) => b.ts - a.ts);
  return {
    couple: { id: doc.id, config: doc.config, challenge: doc.challenge || null, version: doc.version },
    members: doc.members || {},
    log,
    me: String(uid),
    bot: await botName(),
  };
}

/* ── Проверки входных данных ── */
const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");
const money = (v) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n <= 0 || n > 100000000) throw new ApiError("BAD_AMOUNT");
  return n;
};
const checkSize = (obj) => {
  if (JSON.stringify(obj ?? null).length > MAX_JSON) throw new ApiError("TOO_BIG");
  return obj ?? null;
};
function validConfig(cfg) {
  if (!cfg || typeof cfg !== "object") throw new ApiError("BAD_CONFIG");
  checkSize(cfg);
  const ps = cfg.partners;
  if (!Array.isArray(ps) || ps.length !== 2 || ps.some((p) => !p || typeof p.id !== "string" || !str(p.name, 40).trim())) throw new ApiError("BAD_CONFIG");
  const g = cfg.goal;
  if (!g || !str(g.title, 60).trim() || !Array.isArray(g.stages) || !g.stages.length || g.stages.length > 20) throw new ApiError("BAD_CONFIG");
  g.stages.forEach((s) => money(s.amount));
  if (!Array.isArray(cfg.habits) || cfg.habits.length > 40) throw new ApiError("BAD_CONFIG");
  return cfg;
}
function cleanEntry(e, partnerIds, uid) {
  if (!e || typeof e !== "object" || !ID_RE.test(String(e.id)) || !TYPES.includes(e.type)) throw new ApiError("BAD_ENTRY");
  const now = Date.now();
  const ts = Number(e.ts);
  const out = {
    id: String(e.id),
    ts: Number.isFinite(ts) && Math.abs(ts - now) < 86400000 ? ts : now,
    type: e.type,
    title: str(e.title, 80),
    amount: money(e.amount),
    by: String(uid),
  };
  if (partnerIds.includes(e.who)) out.who = e.who;
  if (e.type === "saved" && KINDS.includes(e.kind)) out.kind = e.kind;
  if (e.type === "expense") out.impulse = !!e.impulse;
  if (typeof e.habitId === "string") out.habitId = e.habitId.slice(0, 40);
  return out;
}
function newCode() {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  return [...bytes].map((b) => abc[b % abc.length]).join("");
}

async function myCoupleId(uid) {
  const m = await store().get(memberKey(uid), { type: "json" });
  return m ? m.coupleId : null;
}
async function requireCouple(uid) {
  const id = await myCoupleId(uid);
  if (!id) throw new ApiError("NO_COUPLE", 404);
  return id;
}

/* ── Действия ── */
const actions = {
  async state(input, auth) {
    const uid = auth.user.id;
    const cid = await myCoupleId(uid);
    if (cid) {
      const doc = await getCouple(cid);
      if (doc) {
        if (input.since && Number(input.since) === doc.version) return { unchanged: true, version: doc.version };
        return snapshot(doc, uid);
      }
      await store().delete(memberKey(uid)); // копилку удалили — освобождаем человека
    }
    const code = String(input.code || auth.start_param || "").toLowerCase();
    if (CODE_RE.test(code)) {
      const doc = await getCouple(code);
      if (doc && doc.config) {
        return { invite: { code: doc.id, config: doc.config, taken: Object.values(doc.members || {}) }, me: String(uid), bot: await botName() };
      }
    }
    return { none: true, me: String(uid), bot: await botName() };
  },

  async setup(input, auth) {
    const uid = auth.user.id;
    if (await myCoupleId(uid)) throw new ApiError("ALREADY_IN_COUPLE", 409);
    const config = validConfig(input.config);
    const challenge = checkSize(input.challenge);
    const ids = config.partners.map((p) => p.id);
    const log = (Array.isArray(input.log) ? input.log.slice(0, 10) : []).map((e) => cleanEntry(e, ids, uid));
    const s = store();
    let code, doc;
    for (let i = 0; i < 5; i++) {
      code = newCode();
      doc = { id: code, config, challenge, members: { [String(uid)]: ids[0] }, log, version: 1, createdAt: Date.now(), updatedAt: Date.now() };
      const r = await s.setJSON(coupleKey(code), doc, { onlyIfNew: true });
      if (r.modified !== false) break;
      if (i === 4) throw new ApiError("BUSY", 409);
    }
    const m = await s.setJSON(memberKey(uid), { coupleId: code, partnerId: ids[0], joinedAt: Date.now() }, { onlyIfNew: true });
    if (m.modified === false) { await s.delete(coupleKey(code)); throw new ApiError("ALREADY_IN_COUPLE", 409); }
    return snapshot(doc, uid);
  },

  async join(input, auth) {
    const uid = auth.user.id;
    const code = String(input.code || "").toLowerCase();
    const existing = await myCoupleId(uid);
    if (existing) {
      if (existing === code) { const doc = await getCouple(code); if (doc) return snapshot(doc, uid); }
      throw new ApiError("ALREADY_IN_COUPLE", 409);
    }
    if (!CODE_RE.test(code)) throw new ApiError("NO_INVITE", 404);
    const s = store();
    const claim = await s.setJSON(memberKey(uid), { coupleId: code, partnerId: input.partnerId, joinedAt: Date.now() }, { onlyIfNew: true });
    if (claim.modified === false) throw new ApiError("ALREADY_IN_COUPLE", 409);
    try {
      const doc = await mutate(code, (d) => {
        if (!d.config.partners.some((p) => p.id === input.partnerId)) throw new ApiError("BAD_PARTNER");
        if (Object.values(d.members || {}).includes(input.partnerId)) throw new ApiError("PARTNER_TAKEN", 409);
        d.members = { ...(d.members || {}), [String(uid)]: input.partnerId };
        return d;
      });
      return snapshot(doc, uid);
    } catch (e) {
      await s.delete(memberKey(uid));
      throw e.code === "NO_COUPLE" ? new ApiError("NO_INVITE", 404) : e;
    }
  },

  async addEntry(input, auth) {
    const uid = auth.user.id;
    const cid = await requireCouple(uid);
    const doc = await mutate(cid, (d) => {
      const entry = cleanEntry(input.entry, d.config.partners.map((p) => p.id), uid);
      d.log = d.log || [];
      if (d.log.some((e) => e.id === entry.id)) return undefined; // повторная отправка ничего не задвоит
      d.log.push(entry);
      if (d.log.length > MAX_LOG) throw new ApiError("LOG_FULL", 413);
      return d;
    });
    return snapshot(doc, uid);
  },

  async saveConfig(input, auth) {
    const uid = auth.user.id;
    const config = validConfig(input.config);
    const doc = await mutate(await requireCouple(uid), (d) => { d.config = config; return d; });
    return snapshot(doc, uid);
  },

  async setChallenge(input, auth) {
    const uid = auth.user.id;
    const challenge = checkSize(input.challenge);
    const doc = await mutate(await requireCouple(uid), (d) => { d.challenge = challenge; return d; });
    return snapshot(doc, uid);
  },

  // Отметка дня или награда: дни сливаются по ключам, так что двое могут отмечать одновременно
  async patchChallenge(input, auth) {
    const uid = auth.user.id;
    const patch = input.patch || {};
    const doc = await mutate(await requireCouple(uid), (d) => {
      if (!d.challenge) throw new ApiError("NO_CHALLENGE");
      const next = { ...d.challenge, days: { ...(d.challenge.days || {}) } };
      if (patch.days && typeof patch.days === "object") {
        for (const [k, v] of Object.entries(patch.days)) if (/^[0-6]$/.test(k)) next.days[k] = !!v;
      }
      if (typeof patch.reward === "string") next.reward = patch.reward.slice(0, 60);
      d.challenge = next;
      return d;
    });
    return snapshot(doc, uid);
  },

  // «Начать заново»: удаляет копилку у обоих
  async reset(input, auth) {
    const uid = auth.user.id;
    const cid = await requireCouple(uid);
    const s = store();
    const doc = await getCouple(cid);
    await s.delete(coupleKey(cid));
    for (const id of Object.keys((doc && doc.members) || { [String(uid)]: 1 })) await s.delete(memberKey(id));
    return { none: true, me: String(uid), bot: await botName() };
  },
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  if (!process.env.BOT_TOKEN) return json({ error: "NO_BOT_TOKEN" }, 500);
  const auth = verifyInitData(req.headers.get("x-telegram-init-data"), process.env.BOT_TOKEN);
  if (!auth) return json({ error: "UNAUTHORIZED" }, 401);
  let input;
  try { input = await req.json(); } catch (e) { return json({ error: "BAD_JSON" }, 400); }
  if (!input || typeof input !== "object") return json({ error: "BAD_JSON" }, 400);
  const fn = Object.prototype.hasOwnProperty.call(actions, input.action) ? actions[input.action] : null;
  if (!fn) return json({ error: "UNKNOWN_ACTION" }, 400);
  try {
    return json(await fn(input, auth));
  } catch (e) {
    if (e instanceof ApiError) return json({ error: e.code }, e.status);
    console.error(e);
    return json({ error: "INTERNAL" }, 500);
  }
}
