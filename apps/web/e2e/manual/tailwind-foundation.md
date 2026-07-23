# Ручной чеклист: Tailwind foundation (bd-wus.1)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/` и `/login` выглядят как до миграции (фон «читальня» `#f7f5f0`, serif body, меню на месте)
- [ ] Нет «голого» сброса браузерных стилей (Preflight выключен)
- [ ] В DevTools у `:root` есть `--background`, `--foreground`, `--muted`, `--border`, `--surface`, `--accent`
- [ ] Утилита `bg-background` / `text-foreground` резолвится в те же цвета (можно временно повесить класс в DevTools)

## Автопроверка

```bash
pnpm --filter web test -- lib/design-tokens.test.ts tailwind.config.test.ts
pnpm --filter web build
pnpm --filter web exec playwright test e2e/smoke/tailwind-foundation.spec.ts e2e/smoke/auth-pages.spec.ts e2e/smoke/app-nav.spec.ts --project=chromium-desktop --project=chromium-mobile
```
