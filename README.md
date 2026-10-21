# Копилкин

Общая копилка для пары в Telegram: цель и этапы, вклад каждого, челленджи и ИИ-помощник Огонёк,
который помогает остановиться перед импульсивной покупкой. Бот: [@kopilkin_together_bot](https://t.me/kopilkin_together_bot).

Хостинг — Netlify: фронт отдаётся из `dist/`, сервер — Netlify Functions (`/api/kopilka`),
данные — Netlify Blobs (встроенное хранилище, отдельная база не нужна).

## Деплой на GitHub Pages

Приложение собирается и выкладывается из этого репозитория (`.github/workflows/pages.yml`).

1. **Settings → Pages → Build and deployment → Source: GitHub Actions** (один раз).
2. **Actions → GitHub Pages → Run workflow** (или любой push в `main`). Адрес: `https://croooud.github.io/kopilkin/`.
3. @BotFather → бот → **Mini Apps → Main App** → вставить этот адрес.
4. Открыть `https://t.me/kopilkin_together_bot?startapp`.

GitHub Pages отдаёт только страницу — сервера у него нет. Поэтому на Pages копилка хранится
в каждом телефоне отдельно (localStorage внутри Telegram).

### Общая копилка на двоих

Для общих данных нужен сервер — он уже написан: `netlify/functions/kopilka.mjs` (Netlify Functions + Blobs).
Его можно развернуть из этого же репозитория на Netlify (переменная `BOT_TOKEN`, настройки в `netlify.toml`),
а затем вписать адрес в `web/index.html`:

```html
<meta name="kopilkin-api" content="https://<сайт>.netlify.app/api/kopilka">
```

После push приложение на GitHub Pages начнёт ходить в этот сервер, и у пары появится одна общая копилка
(CORS для этого уже разрешён). Если сайт целиком живёт на Netlify, мета-тег можно оставить пустым.

### Ответ на /start (необязательно, только вместе с сервером)

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<сайт>.netlify.app/api/telegram&secret_token=SECRET
```

и переменная `WEBHOOK_SECRET=SECRET` в Netlify.

## Структура

```
src/App.jsx                    интерфейс (React, Tailwind, lucide-react) — один компонент
web/index.html                 шаблон страницы: Telegram SDK, React, Tailwind, иконки; адрес сервера в meta kopilkin-api
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
- Без сервера (GitHub Pages) или вне Telegram приложение работает локально, без синхронизации.

## Оформление «Тёплая керамика»

Токены — в начале `src/App.jsx` (`TW_CONFIG`): фон `#FFF8EE`, карточки `#FFFCF7`, текст и основные
кнопки `#294734`, подписи `#5E675C`, шалфей `#A8B99A`, персик `#EDAC85`, мёд `#D9AA55`,
границы `#E6DDCF`, ошибка `#A83D36`. Аватарки встроены в код как WebP.
