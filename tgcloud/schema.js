import { table, integer, text, json } from 'sdk/db';

// Одна пара = одна копилка. id — это и код приглашения.
export const couples = table('couples', {
  id: text('id').primaryKey(),
  config: json('config'),        // имена, цель, этапы, привычки, бюджет
  challenge: json('challenge'),  // челлендж недели
  version: integer('version').notNull().default(1), // растёт при каждом изменении — по нему телефоны понимают, что пора обновиться
  createdAt: integer('created_at').notNull(),
});

// Кто из Telegram-пользователей каким партнёром является. Один человек — одна копилка.
export const members = table('members', {
  userId: integer('user_id').primaryKey(),
  coupleId: text('couple_id').notNull(),
  partnerId: text('partner_id').notNull(),
  joinedAt: integer('joined_at').notNull(),
});

// Пополнения, спасённые деньги и траты.
export const entries = table('entries', {
  id: text('id').primaryKey(),
  coupleId: text('couple_id').notNull(),
  ts: integer('ts').notNull(),
  body: json('body').notNull(),
});
