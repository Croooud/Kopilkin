# Копилкин

Общая копилка для пары в Telegram: цель и этапы, вклад каждого, челленджи и ИИ-помощник Огонёк,
который помогает остановиться перед импульсивной покупкой. Бот: [@kopilkin_together_bot](https://t.me/kopilkin_together_bot).

Работает на [Telegram Serverless](https://core.telegram.org/bots/serverless): Telegram сам хостит
приложение, хранит данные в базе бота и проверяет, кто открыл Mini App. Отдельный сервер не нужен.

## Деплой

Каждый push в `main` запускает GitHub Actions (`.github/workflows/deploy.yml`): сборка
`dist/index.html` → `tgcloud push` → `tgcloud migrate --safe`.

Один раз:

1. @BotFather → бот → **Serverless** → включить → **CLI Access** → скопировать токен
   (вида `app<id>:<secret>`, это не токен бота).
2. GitHub → репозиторий → **Settings → Secrets and variables → Actions → New repository secret**:
   имя `TGCLOUD_TOKEN`, значение — токен из шага 1.
3. **Actions → Deploy to Telegram → Run workflow** (или любой push в `main`).
   В логе будет адрес приложения `https://app<id>.tgcloud.ai/`.
4. @BotFather → бот → **Mini Apps** → Main App → вставить этот адрес.
5. Открыть `https://t.me/kopilkin_together_bot?startapp`, пройти настройку и отправить партнёру приглашение.

Приложение и сервер должны жить на одном адресе `app<id>.tgcloud.ai`: приложение обращается к серверу
через `Telegram.WebApp.Serverless.call`, а Telegram отвечает на эти вызовы по `/api/` того же хоста.
Поэтому выкладывать `dist/` на Vercel, Netlify или GitHub Pages отдельно не нужно — бэкенд там не заработает.

Локально, если нужно: `npm install`, `npx tgcloud login`, `npm run deploy`.

## Структура

```
src/App.jsx                    интерфейс (React, Tailwind, lucide-react) — один компонент
web/index.html                 шаблон страницы: Telegram SDK, React, Tailwind и иконки из CDN
scripts/build.mjs              src/App.jsx → dist/index.html (npm run build)
dist/index.html                собранное приложение (коммитится, чтобы деплой был без сюрпризов)
tgcloud/schema.js              таблицы: couples, members, entries
tgcloud/endpoints/kopilka.js   весь сервер в одном endpoint: state, setup, join, addEntry,
                               saveConfig, setChallenge, patchChallenge, reset (поле action)
tgcloud/handlers/message.js    ответ на /start с кнопкой «Открыть копилку»
tgcloud.jsonc                  настройки Serverless: приложение берётся из dist/
assets/                        Персик, Шалфей и Огонёк (256 px целиком и 128 px «лицо»)
```

## Как устроено

- Создатель копилки становится первым партнёром. Ссылка-приглашение
  `t.me/kopilkin_together_bot?startapp=КОД` открывает экран «Кто из вас вы?».
- Один Telegram-аккаунт — одна копилка. Без кода чужой человек видит только пустую настройку.
- Пока приложение открыто, телефоны раз в 4 секунды спрашивают сервер, не изменилось ли что-то
  (`version` в таблице `couples`). Действия партнёра приходят уведомлением.
- «Начать заново» в настройках удаляет копилку у обоих.
- Вне Telegram (просто в браузере) приложение работает локально, без синхронизации.

## Оформление «Тёплая керамика»

Токены — в начале `src/App.jsx` (`TW_CONFIG`): фон `#FFF8EE`, карточки `#FFFCF7`, текст и основные
кнопки `#294734`, подписи `#5E675C`, шалфей `#A8B99A`, персик `#EDAC85`, мёд `#D9AA55`,
границы `#E6DDCF`, ошибка `#A83D36`. Аватарки встроены в код как WebP.
