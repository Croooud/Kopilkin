import { api } from 'sdk';

// Ответ на /start в чате с ботом: кнопка, которая открывает копилку.
export default async function (message) {
  if (!message || !message.text || !message.text.startsWith('/start')) return;
  const me = await api.getMe();
  await api.sendMessage({
    chat_id: message.chat.id,
    text: 'Привет! Я Копилкин 🐷\n\nПомогаю копить вдвоём: общая цель, этапы, вклад каждого и ИИ, который отговаривает от импульсивных покупок.\n\nЕсли партнёр уже завёл копилку, откройте его ссылку-приглашение. Если нет — начните сами:',
    reply_markup: { inline_keyboard: [[{ text: '🐷 Открыть копилку', url: `https://t.me/${me.username}?startapp` }]] },
  });
}
