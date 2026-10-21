// Необязательный вебхук бота: отвечает на /start кнопкой «Открыть копилку».
// Подключение — см. README («Ответ на /start»).
export const config = { path: "/api/telegram" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("ok");
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) return new Response("forbidden", { status: 403 });
  let update;
  try { update = await req.json(); } catch (e) { return new Response("ok"); }
  const msg = update && update.message;
  if (!msg || typeof msg.text !== "string" || !msg.text.startsWith("/start")) return new Response("ok");
  const token = process.env.BOT_TOKEN;
  const api = (method, body) =>
    fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
  const me = await api("getMe", {});
  await api("sendMessage", {
    chat_id: msg.chat.id,
    text: "Привет! Я Копилкин 🐷\n\nПомогаю копить вдвоём: общая цель, этапы, вклад каждого и Огонёк, который помогает остановиться перед импульсивной покупкой.\n\nЕсли партнёр уже завёл копилку, откройте его ссылку-приглашение. Если нет — начните сами:",
    reply_markup: { inline_keyboard: [[{ text: "🐷 Открыть копилку", url: `https://t.me/${me.result.username}?startapp` }]] },
  });
  return new Response("ok");
}
