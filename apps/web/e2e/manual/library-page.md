# Ручной чеклист: Библиотека `/library` (bd-wus.15 / S12)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] Guest: `/library` показывает «Моя библиотека» и «Коллекция и полки скоро появятся.»
- [ ] Нет legacy-класса `library-stub` на `<main>`
- [ ] Guest: пункт «Профиль» в меню ведёт на `/login` (не на `/library`)
- [ ] User: после входа «Профиль» → `/library`, `aria-current=page`
- [ ] Визуал «читальня» (фон/текст без purple/Material)
- [ ] RU-копирайт без регрессии

## Автопроверка

```bash
pnpm --filter web test -- app/library/library-page.test.ts
PLAYWRIGHT_CHROME_CHANNEL=0 pnpm --filter web exec playwright test e2e/smoke/library-page.spec.ts --project=chromium-desktop --project=chromium-mobile
```
