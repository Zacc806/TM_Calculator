# Atamura Group — Калькулятор ежемесячного платежа

Калькулятор платежа по квартире для отдела продаж Atamura Group. Менеджер считает платёж
в Битрикс24 / на странице и отправляет клиенту (ссылкой, PDF или текстом в WhatsApp).

React 19 + Vite + TypeScript (strict) + Hono. Светлая/тёмная тема, RU/KZ, 16 ипотечных
программ с полными условиями. Живой деплой — **self-host VDS** `93.115.14.193` (Hoster.KZ),
домен в планах `calc.atamura.kz`. Битрикс24-портал — `amanat.bitrix24.kz`.

## Возможности

- Расчёт: аннуитет / беспроцентная рассрочка, целые тенге, согласованные итоги.
- 16 программ (рассрочка + 14 из таблицы + «свой вариант»), номинальные ставки.
- Кнопка «Условия программы» → модалка с условиями / требованиями / банком / проектами.
- Тема (☀️/🌙, follows prefers-color-scheme), язык RU / ҚАЗ — в шапке, запоминаются.
- Печать / PDF / копирование для WhatsApp / «Ссылка клиенту» (без ПДн в URL).
- Адаптив + тач-эргономика (мобайл/десктоп), скруглённый современный UI.

## Маршруты

| URL | Назначение |
|-----|------------|
| `/` | Лендинг-калькулятор |
| `/embed` | Версия для `<iframe>` на страницах ЖК; автоподстановка `?price=&zhk=&program=`, адаптивная высота |
| `/client` | Read-only расчёт для клиента по ссылке (`?price=&dp=&rate=&term=&program=`), **без персональных данных** |
| `/bitrix`, `/bitrix-deal` | Калькулятор для менеджера: пункт меню Битрикс24 и вкладка в карточке сделки |
| `/admin` | Редактор программ, ставок и условий (без правки кода) |

## Разработка

```bash
npm install
npm run dev          # Vite, http://localhost:5173
npm run dev:server   # Hono API на :3000 (tsx watch)
npm test             # Vitest (102 теста)
npm run typecheck
npm run build:all    # SPA (dist/) + сервер (dist-server/server.mjs)
```

## Деплой (self-host, VDS)

Сервер: Hono отдаёт SPA + `/api/*`, конфиг программ — JSON-файл на диске, под systemd,
за Caddy (reverse-proxy + авто-HTTPS).

```bash
npm run build:all
# залить dist/ -> /root/tm-calculator/web, dist-server/server.mjs -> /root/tm-calculator/server.mjs
systemctl restart tm-calculator
```

`/root/tm-calculator/.env` (см. `deploy/.env.server.example`):

| Переменная | Назначение |
|------------|------------|
| `PORT`, `STATIC_ROOT`, `PROGRAMS_FILE` | порт, статика, файл конфигурации программ |
| `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET` | доступ к `/admin` |
| `BITRIX_WEBHOOK_URL`, `BITRIX_SOURCE_ID` | лид-форма сайта (опционально; менеджерам не нужно) |
| `ALLOWED_ORIGIN` | CORS |

Артефакты: `deploy/tm-calculator.service` (systemd), `deploy/Caddyfile`.

HTTPS: уже работает на интерим-домене **https://93-115-14-193.sslip.io** (валидный
Let's Encrypt, без настройки DNS — sslip.io авто-резолвится в IP). Для постоянного домена
добавить A-запись `calc.atamura.kz → 93.115.14.193` и добавить блок
`calc.atamura.kz { reverse_proxy localhost:3000 }` в `/etc/caddy/Caddyfile` + `caddy reload`.

> Альтернатива: каталог `api/*.ts` — serverless-функции для деплоя на Vercel (Edge Config
> вместо файлового стора). Для текущего VDS не используется.

## Размещение в Битрикс24

- **Левое меню** — пункт со ссылкой на `/bitrix` (вне фрейма открывается как обычный калькулятор).
- **Вкладка в сделке** — локальное приложение (server, HTTPS, scope `crm`):
  App URL `/bitrix-deal`, install path `/bitrix-install.html` (регистрирует `CRM_DEAL_DETAIL_TAB`).
  Внутри сделки: цена подтягивается из `crm.deal.get`, «Сохранить в сделку» → `crm.timeline.comment.add`.
  Требует публичный HTTPS.

## Встраивание на страницу ЖК

```html
<iframe id="atamura-calc" src="https://calc.atamura.kz/embed?price=25000000&zhk=atmosfera"
        style="width:100%;border:0" scrolling="no" title="Калькулятор платежа"></iframe>
<script>
  window.addEventListener("message", function (e) {
    if (e.origin !== "https://calc.atamura.kz") return;
    if (e.data && e.data.type === "atamura-calc:height") {
      document.getElementById("atamura-calc").style.height = e.data.height + "px";
    }
  });
</script>
```

Рабочий пример — `public/embed-demo.html`.

## Управление программами

`/admin` → вход по `ADMIN_PASSWORD` → правка названий, ставок (номинальных, не ГЭСВ), сроков,
рекомендованного ПВ, описаний и полных условий / требований / банка / проектов. Сохранение
пишет в `PROGRAMS_FILE` — изменения видны сразу, без передеплоя. Источник актуальных данных —
`docs/ipoteka-programs-2026-06.xlsx`.

## Аналитика

События `lead_submitted` и `calc_done` → GTM/GA4 (`dataLayer`/`gtag`) и Яндекс.Метрика
(если задан `window.ATAMURA_YM_ID`). Без счётчика — no-op.
