// Копилкин — весь сервер в одном endpoint. Приложение вызывает его как
// Telegram.WebApp.Serverless.call('kopilka', { action: 'state', ... }).
// Telegram сам проверяет init data, поэтому ctx.initData.user — настоящий пользователь.
import { db, api, EndpointError } from 'sdk';
import { eq, desc, sql } from 'sdk/db';
import { couples, members, entries } from '../schema.js';

const TYPES = ['deposit', 'saved', 'expense'];
const KINDS = ['ai', 'habit', 'budget'];
const ID_RE = /^[a-z0-9]{6,40}$/;
const MAX_JSON = 60000;

let botUsername = null;
async function botName() {
  if (botUsername) return botUsername;
  try { botUsername = (await api.getMe()).username; } catch (e) { /* не критично */ }
  return botUsername;
}

function userId(ctx) {
  const id = ctx && ctx.initData && ctx.initData.user && ctx.initData.user.id;
  if (!id) throw new EndpointError('NO_USER');
  return id;
}

async function memberOf(uid) {
  return db.select().from(members).where(eq(members.userId, uid)).get();
}

async function coupleById(id) {
  return db.select().from(couples).where(eq(couples.id, id)).get();
}

async function requireCouple(ctx) {
  const uid = userId(ctx);
  const m = await memberOf(uid);
  if (!m) throw new EndpointError('NO_COUPLE');
  const c = await coupleById(m.coupleId);
  if (!c) throw new EndpointError('NO_COUPLE');
  return { uid, member: m, couple: c };
}

async function bump(coupleId) {
  await db.run(sql`UPDATE couples SET version = version + 1 WHERE id = ${coupleId}`);
}

async function snapshot(coupleId, uid) {
  const c = await coupleById(coupleId);
  if (!c) return { none: true, me: String(uid), bot: await botName() };
  const ms = await db.select().from(members).where(eq(members.coupleId, coupleId)).all();
  const rows = await db.select().from(entries).where(eq(entries.coupleId, coupleId)).orderBy(desc(entries.ts)).all();
  const map = {};
  ms.forEach((m) => { map[String(m.userId)] = m.partnerId; });
  return {
    couple: { id: c.id, config: c.config, challenge: c.challenge, version: c.version },
    members: map,
    log: rows.map((r) => ({ ...r.body, id: r.id, ts: r.ts })),
    me: String(uid),
    bot: await botName(),
  };
}

function newCode() {
  const abc = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 10; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const money = (v) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n <= 0 || n > 100000000) throw new EndpointError('BAD_AMOUNT');
  return n;
};

function checkSize(obj) {
  if (JSON.stringify(obj || null).length > MAX_JSON) throw new EndpointError('TOO_BIG');
  return obj;
}

function validConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') throw new EndpointError('BAD_CONFIG');
  checkSize(cfg);
  const ps = cfg.partners;
  if (!Array.isArray(ps) || ps.length !== 2 || ps.some((p) => !p || typeof p.id !== 'string' || !str(p.name, 40).trim())) throw new EndpointError('BAD_CONFIG');
  const g = cfg.goal;
  if (!g || !str(g.title, 60).trim() || !Array.isArray(g.stages) || !g.stages.length || g.stages.length > 20) throw new EndpointError('BAD_CONFIG');
  g.stages.forEach((s) => money(s.amount));
  if (!Array.isArray(cfg.habits) || cfg.habits.length > 40) throw new EndpointError('BAD_CONFIG');
  return cfg;
}

// Берём из записи только известные поля — в базу не попадёт ничего лишнего.
function cleanEntry(e, partnerIds, uid) {
  if (!e || typeof e !== 'object') throw new EndpointError('BAD_ENTRY');
  if (!ID_RE.test(String(e.id))) throw new EndpointError('BAD_ENTRY');
  if (!TYPES.includes(e.type)) throw new EndpointError('BAD_ENTRY');
  const body = {
    type: e.type,
    title: str(e.title, 80),
    amount: money(e.amount),
    by: String(uid),
  };
  if (partnerIds.includes(e.who)) body.who = e.who;
  if (e.type === 'saved' && KINDS.includes(e.kind)) body.kind = e.kind;
  if (e.type === 'expense') body.impulse = !!e.impulse;
  if (typeof e.habitId === 'string') body.habitId = e.habitId.slice(0, 40);
  const now = Date.now();
  const ts = Number(e.ts);
  return { id: String(e.id), ts: Number.isFinite(ts) && Math.abs(ts - now) < 86400000 ? ts : now, body };
}

async function state (input, ctx) {
  const uid = userId(ctx);
  const m = await memberOf(uid);
  if (m) {
    const c = await coupleById(m.coupleId);
    if (c) {
      if (input && input.since && Number(input.since) === c.version) return { unchanged: true, version: c.version };
      return snapshot(c.id, uid);
    }
  }
  const code = String((input && input.code) || (ctx.initData && ctx.initData.start_param) || '').toLowerCase();
  if (/^[a-z0-9]{6,40}$/.test(code)) {
    const c = await coupleById(code);
    if (c && c.config) {
      const ms = await db.select().from(members).where(eq(members.coupleId, c.id)).all();
      return { invite: { code: c.id, config: c.config, taken: ms.map((x) => x.partnerId) }, me: String(uid), bot: await botName() };
    }
  }
  return { none: true, me: String(uid), bot: await botName() };
}

async function setup (input, ctx) {
  const uid = userId(ctx);
  if (await memberOf(uid)) throw new EndpointError('ALREADY_IN_COUPLE');
  const config = validConfig(input && input.config);
  const challenge = checkSize((input && input.challenge) || null);
  let code = newCode();
  while (await coupleById(code)) code = newCode();
  const now = Date.now();
  await db.insert(couples).values({ id: code, config, challenge, version: 1, createdAt: now }).run();
  await db.insert(members).values({ userId: uid, coupleId: code, partnerId: config.partners[0].id, joinedAt: now }).run();
  const ids = config.partners.map((p) => p.id);
  const log = Array.isArray(input.log) ? input.log.slice(0, 10) : [];
  for (const e of log) {
    const row = cleanEntry(e, ids, uid);
    await db.insert(entries).values({ id: row.id, coupleId: code, ts: row.ts, body: row.body }).run();
  }
  return snapshot(code, uid);
}

async function join (input, ctx) {
  const uid = userId(ctx);
  const code = String((input && input.code) || '').toLowerCase();
  const existing = await memberOf(uid);
  if (existing) {
    if (existing.coupleId === code) return snapshot(code, uid);
    throw new EndpointError('ALREADY_IN_COUPLE');
  }
  const c = await coupleById(code);
  if (!c || !c.config) throw new EndpointError('NO_INVITE');
  const partnerId = input && input.partnerId;
  if (!c.config.partners.some((p) => p.id === partnerId)) throw new EndpointError('BAD_PARTNER');
  const taken = await db.select().from(members).where(eq(members.coupleId, code)).all();
  if (taken.some((m) => m.partnerId === partnerId)) throw new EndpointError('PARTNER_TAKEN');
  await db.insert(members).values({ userId: uid, coupleId: code, partnerId, joinedAt: Date.now() }).run();
  await bump(code);
  return snapshot(code, uid);
}

async function addEntry (input, ctx) {
  const { uid, couple } = await requireCouple(ctx);
  const ids = (couple.config && couple.config.partners || []).map((p) => p.id);
  const row = cleanEntry(input && input.entry, ids, uid);
  // повторная отправка той же записи ничего не задвоит
  const dup = await db.select().from(entries).where(eq(entries.id, row.id)).get();
  if (!dup) await db.insert(entries).values({ id: row.id, coupleId: couple.id, ts: row.ts, body: row.body }).run();
  await bump(couple.id);
  return { version: couple.version + 1 };
}

async function saveConfig (input, ctx) {
  const { couple } = await requireCouple(ctx);
  const config = validConfig(input && input.config);
  await db.update(couples).set({ config }).where(eq(couples.id, couple.id)).run();
  await bump(couple.id);
  return { version: couple.version + 1 };
}

async function setChallenge (input, ctx) {
  const { couple } = await requireCouple(ctx);
  const challenge = checkSize((input && input.challenge) || null);
  await db.update(couples).set({ challenge }).where(eq(couples.id, couple.id)).run();
  await bump(couple.id);
  return { version: couple.version + 1 };
}

async function patchChallenge (input, ctx) {
  const { couple } = await requireCouple(ctx);
  const cur = couple.challenge;
  if (!cur) throw new EndpointError('NO_CHALLENGE');
  const patch = (input && input.patch) || {};
  const next = { ...cur, days: { ...(cur.days || {}) } };
  if (patch.days && typeof patch.days === 'object') {
    for (const [k, v] of Object.entries(patch.days)) if (/^[0-6]$/.test(k)) next.days[k] = !!v;
  }
  if (typeof patch.reward === 'string') next.reward = patch.reward.slice(0, 60);
  await db.update(couples).set({ challenge: next }).where(eq(couples.id, couple.id)).run();
  await bump(couple.id);
  return { version: couple.version + 1 };
}

async function reset (input, ctx) {
  const { uid, couple } = await requireCouple(ctx);
  await db.delete(entries).where(eq(entries.coupleId, couple.id)).run();
  await db.delete(members).where(eq(members.coupleId, couple.id)).run();
  await db.delete(couples).where(eq(couples.id, couple.id)).run();
  return { none: true, me: String(uid) };
}

const ACTIONS = { state, setup, join, addEntry, saveConfig, setChallenge, patchChallenge, reset };

export default async function (input, ctx) {
  const action = input && input.action;
  if (!Object.prototype.hasOwnProperty.call(ACTIONS, action)) throw new EndpointError('UNKNOWN_ACTION');
  return ACTIONS[action](input, ctx);
}
