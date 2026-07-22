# Ручной чеклист: Auth error `/auth/error` (bd-wus.7 / S4)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/auth/error?reason=access_denied&provider=google` показывает «Ошибка входа» (h1)
- [ ] Нет legacy-класса `auth-page` на `<main>`
- [ ] Alert: «Вход через Google отменён»
- [ ] «Вернуться ко входу» ведёт на `/login`
- [ ] `/auth/error?reason=access_denied&provider=yandex` → «Вход через Яндекс отменён»
- [ ] Отмена OAuth (`/api/auth/google/callback?error=access_denied`) редиректит на `/auth/error` с RU-текстом
- [ ] Визуал «читальня» (фон/текст без purple/Material)
- [ ] RU-копирайт без регрессии

## Автопроверка

```bash
pnpm --filter web test -- app/auth/error/auth-error-page.test.ts
pnpm --filter web exec playwright test e2e/smoke/auth-error-page.spec.ts e2e/smoke/auth-oauth-google.spec.ts e2e/smoke/auth-oauth-yandex.spec.ts --project=chromium-desktop --project=chromium-mobile
```
