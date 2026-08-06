# Ручной чеклист: shadcn baseline (bd-wus.2)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/` и `/login` выглядят как до F2 (фон «читальня» `#f7f5f0`, serif body, меню на месте)
- [ ] Нет purple/Material-default shadcn theme на публичных страницах
- [ ] В DevTools у `:root` те же токены F1: `--background`, `--foreground`, `--muted`, `--border`, `--surface`, `--accent`
- [ ] В коде есть `components/ui` (Button/Input/Label/Card) и `lib/utils.ts` (`cn`)

## Автопроверка

```bash
pnpm --filter web test -- lib/utils.test.ts components/ui/button.test.ts
pnpm --filter web build
pnpm --filter web exec playwright test e2e/smoke/shadcn-baseline.spec.ts e2e/smoke/tailwind-foundation.spec.ts --project=chromium-desktop --project=chromium-mobile
```
