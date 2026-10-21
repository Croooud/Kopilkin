# Копилкин

Общая копилка для пары в Telegram: цель и этапы, вклад каждого, челленджи и ИИ-помощник Огонёк,
который помогает остановиться перед импульсивной покупкой. Бот: [@kopilkin_together_bot](https://t.me/kopilkin_together_bot).

Хостинг — Netlify: фронт отдаётся из `dist/`, сервер — Netlify Functions (`/api/kopilka`),
данные — Netlify Blobs (встроенное хранилище, отдельная база не нужна).

## Деплой

1. **Netlify → Add new site → Import an existing project → GitHub → `Croooud/kopilkin`.**
   Настройки сборки подтянутся из `netlify.toml` (команда `npm run build`, папка `dist`).
2. **Site configuration → Environment variables → Add a variable:**
   - `BOT_TOKEN` — токен бота из @BotFather (обязательно; им сервер проверяет, что запрос пришёл из Telegram).
   - `BOT_USERNAME` — `kopilkin_together_bot` (необязательно, ускоряет ответ).
   После добавления переменных: **Deploys → Trigger deploy**.
3. **@BotFather → бот → Mini Apps → Main App:** вставить адрес сайта, например `https://kopilkin.netlify.app`.
   При желании там же — Menu Button с тем же адресом.
4. Открыть `https://t.me/kopilkin_together_bot?startapp`, пройти настройку и нажать «Отправить приглашение».

Дальше каждый push в `main` выкладывается автоматически.

### Ответ на /start (необязательно)

Чтобы бот отвечал на /start кнопкой «Открыть копилку», один раз откройте в браузере
(подставьте свой токен, адрес сайта и любую длинную строку вместо `SECRET`):

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<сайт>.netlify.app/api/telegram&secret_token=SECRET
```

и добавьте в Netlify переменную `WEBHOOK_SECRET=SECRET`.

## Структура

```
src/App.jsx                    интерфейс (React, Tailwind, lucide-react) — один компонент
web/index.html                 шаблон страницы: Telegram SDK, React, Tailwind и иконки из CDN
scripts/build.mjs              src/App.jsx → dist/index.html (npm run build)
dist/index.html                собранное приложение
netlify/functions/kopilka.mjs  сервер: POST /api/kopilka { action } — state, setup, join, addEntry,
                               saveConfig, setChallenge, patchChallenge, reset
netlify/functions/telegram.mjs вебхук бота для /start (необязательный)
netlify.toml                   настройки сборки и функций
assets/                        Персик, Шалфей и Огонёк (256 px целиком и 128 px «лицо»)
```

## Как устроено

- Каждый запрос несёт `Telegram.WebApp.initData`; сервер проверяет его подпись по `BOT_TOKEN`
  (алгоритм из документации Telegram) и только так узнаёт пользователя. Без подписи — 401.
- Одна копилка — один JSON-документ в Blobs (`couples/<код>`), плюс `members/<telegram id>`.
  Запись идёт с проверкой etag и повтором, поэтому одновременные действия двух партнёров не теряются.
- Создатель копилки становится первым партнёром. Ссылка-приглашение
  `t.me/kopilkin_together_bot?startapp=КОД` открывает экран «Кто из вас вы?». Занятое имя второй раз не выбрать.
- Пока приложение открыто, телефоны раз в 4 секунды спрашивают сервер, не изменилось ли что-то (`version`).
  Действия партнёра приходят уведомлением.
- «Начать заново» в настройках удаляет копилку у обоих.
- Вне Telegram (просто в браузере) приложение работает локально, без синхронизации.

## Оформление «Тёплая керамика»

Токены — в начале `src/App.jsx` (`TW_CONFIG`): фон `#FFF8EE`, карточки `#FFFCF7`, текст и основные
кнопки `#294734`, подписи `#5E675C`, шалфей `#A8B99A`, персик `#EDAC85`, мёд `#D9AA55`,
границы `#E6DDCF`, ошибка `#A83D36`. Аватарки встроены в код как WebP.
