# ADR 0005: HTTP-клиент axios (web + api)

- **Статус:** accepted
- **Дата:** 2026-07-29
- **Accepted:** 2026-07-29 (человек)

## Контекст

Исходящие HTTP-вызовы в приложении сейчас на native `fetch`:

- `apps/web`: `lib/*` (auth, catalog, admin-context), client forms;
- `apps/api`: OAuth-клиенты Google/Yandex;
- отдельно: Next BFF-proxy (`app/api/**/route.ts`) и Service Worker (`public/sw.js`).

Однотипный разбор JSON/ошибок и cookies дублируется (например `parseApiError` в auth). Нужен единый DX для app HTTP без смены транспорта BFF/SW.

Согласовано с человеком (2026-07-29):

- scope: **web + api** outbound;
- миграция **полная в одном эпике** (не on-touch forever);
- исключения: native `fetch` в **Service Worker** и **Next BFF-proxy**;
- два независимых контура (без `packages/http`): web — plain axios; api — axios через `@nestjs/axios`;
- web: interceptor → единый `ApiError`;
- api outbound: `HttpModule` / `HttpService`, ошибки локально в call-sites (без web-`ApiError`).

## Решение

1. **Зависимости** (после accept ADR / явного ok на установку):
   - `apps/web`: `axios`;
   - `apps/api`: `axios` + `@nestjs/axios` (обёртка Nest над axios; RxJS через `firstValueFrom` / `lastValueFrom` на call-sites).
2. **Web:** модуль `apps/web/lib/http.ts` — `axios.create` с `withCredentials`, timeout; response interceptor переводит не-2xx в `ApiError` (status + message из body, совместимо с текущим Nest-форматом). Все app HTTP из `lib/*` и client-компонентов — только через этот клиент.
3. **Api:** `HttpModule.register({ timeout, … })` (глобально или в модулях с outbound); клиенты инжектят `HttpService`. Без interceptor уровня web-`ApiError`. OAuth и будущий outbound мапят fail в доменные Nest-исключения сами (`UnauthorizedException` и т.п.). Прямой `axios.create` в api app-коде не плодим — конфигурация через `HttpModule`.
4. **Исключения (остаётся `fetch`):**
   - `apps/web/public/sw.js` (Cache API + `fetch(request)`);
   - `apps/web/app/api/**/route.ts` (proxy `Request` ↔ upstream ↔ `Response`).
5. **Миграция:** foundation → все целевые call-sites → DoD без app-`fetch` вне исключений (см. план). Новый app HTTP сразу на согласованный стек.
6. **Не выбираем:** ky / ofetch как основной клиент; shared `packages/http`.

План: [migration-axios.md](../tech/migration-axios.md).

## Последствия

- Плюсы: единый клиент и ошибки на web; на api — DI, общий timeout/base config, удобный mock `HttpService` в Nest TestingModule; предсказуемые timeout.
- Минусы: +зависимости (`axios`, `@nestjs/axios`) и client bundle на web; два мира (`fetch` в SW/BFF vs axios в app); api call-sites с Observable → Promise (`firstValueFrom`); тесты OAuth/lib переводятся на mock axios / `HttpService`.
- Риски: Edge/RSC — axios только в поддерживаемых runtime (Node/server components и browser); не тащить axios в Service Worker.
- Смена клиента или отказ от axios / `@nestjs/axios` — новый ADR.
