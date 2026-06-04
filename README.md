# Atamura Group — Калькулятор ежемесячного платежа

Калькулятор платежа по квартире для отдела продаж Atamura Group. Менеджер считает платёж
в Битрикс24 и отправляет расчёт клиенту (ссылкой, PDF или текстом в WhatsApp). Опционально
размещается на сайте как лид-магнит.

React 19 + Vite + TypeScript (strict). Деплой — Vercel, домен `calc.atamura.kz`.
Битрикс24-портал — `amanat.bitrix24.kz`.

## Маршруты

| URL | Назначение |
|-----|------------|
| `/` | Лендинг-калькулятор с лид-формой (сайт, опционально) |
| `/embed` | Версия для `<iframe>` на страницах ЖК; автоподстановка `?price=&zhk=&program=`, адаптивная высота |
| `/client` | Read-only расчёт для клиента по ссылке (`?price=&dp=&rate=&term=&program=`), **без персональных данных** |
| `/bitrix`, `/bitrix-deal` | Калькулятор для менеджера: пункт меню Битрикс24 и вкладка в карточке сделки |
| `/admin` | Редактор программ и ставок (без правки кода) |

## Разработка

```bash
npm install
npm run dev         # http://localhost:5173
npm test            # Vitest (87 тестов)
npm run typecheck   # tsc --strict
npm run build       # dist/
```

## Деплой на Vercel

1. Импортировать репозиторий в Vercel (framework preset — **Vite**, output — `dist`).
2. Привязать домен `calc.atamura.kz`.
3. Задать переменные окружения (см. `.env.example`):

| Переменная | Где | Назначение |
|------------|-----|------------|
| `BITRIX_WEBHOOK_URL` | server | Входящий вебхук Битрикс24 (scope `crm`) для `crm.lead.add` |
| `BITRIX_SOURCE_ID` | server | Источник лида в CRM (по умолчанию `WEB`) |
| `ALLOWED_ORIGIN` | server | `https://calc.atamura.kz` (CORS) |
| `EDGE_CONFIG` | server (авто) | Read-строка Edge Config (создаётся при привязке стора) |
| `EDGE_CONFIG_ID`, `EDGE_CONFIG_WRITE_TOKEN` | server | Запись программ из `/admin` через Vercel API |
| `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET` | server | Доступ к `/admin` |

4. Привязать Edge Config к проекту и засеять программы:

```bash
EDGE_CONFIG_ID=ecfg_... EDGE_CONFIG_WRITE_TOKEN=... npm run seed:edge
```

Без Edge Config калькулятор работает на встроенном `src/data/programs.seed.json`.

## Размещение в Битрикс24

**Пункт в левом меню** — добавить пользовательский пункт меню со ссылкой `https://calc.atamura.kz/bitrix`.

**Вкладка в карточке сделки** — создать в `amanat.bitrix24.kz` локальное приложение (тип «серверное»,
HTTPS, scope `crm`):

- Путь обработчика (App URL): `https://calc.atamura.kz/bitrix-deal`
- Путь установки: `https://calc.atamura.kz/bitrix-install.html` (регистрирует placement `CRM_DEAL_DETAIL_TAB` и вызывает `installFinish`)

В сделке вкладка «Калькулятор Atamura» подтянет стоимость из поля сделки (`crm.deal.get`),
а кнопка «Сохранить в сделку» запишет расчёт в таймлайн (`crm.timeline.comment.add`).

## Встраивание на страницу ЖК (сайт)

```html
<iframe id="atamura-calc"
        src="https://calc.atamura.kz/embed?price=25000000&zhk=atmosfera&program=rassrochka"
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
рекомендованного ПВ и описаний. Сохранение пишет в Edge Config — изменения видны сразу, без
переустановки. Источник актуальных ставок — `docs/ipoteka-programs-2026-06.xlsx`.

## Аналитика

События `lead_submitted` и `calc_done` отправляются в GTM/GA4 (`dataLayer`/`gtag`) и
Яндекс.Метрику (если задан `window.ATAMURA_YM_ID`). Без подключённого счётчика — no-op.

## Проверка перед запуском (требует живого окружения)

- `/api/lead` — нужен реальный `BITRIX_WEBHOOK_URL`; проверить создание лида через `vercel dev` + `curl`.
- Вкладка в сделке — Битрикс24 требует публичный HTTPS, тестировать на preview/prod, не на localhost.
- Логика расчёта, нормализация телефона, валидация, прокси и Edge Config покрыты unit-тестами.
