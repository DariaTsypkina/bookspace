# Ручной чеклист: Библиотека `/library` + Профиль (bd-cq7.6 / bd-wus.15)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии (desktop)

- [ ] Guest: `/library` показывает «Моя библиотека» и «Коллекция и полки скоро появятся.»
- [ ] Нет legacy-класса `library-stub` на `<main>`
- [ ] Guest: пункт «Профиль» в меню после settle ведёт на `/login` (форма «Вход» видна, не пусто)
- [ ] User: после входа «Профиль» → `/library`, `aria-current=page`, stub виден
- [ ] Визуал «читальня» (фон/текст без purple/Material)
- [ ] RU-копирайт без регрессии

## Сценарии (iOS Chrome — human regression bd-cq7.6)

- [ ] iPhone Chrome: войти → Tab-bar «Профиль» → `/library` с заголовком и текстом stub (не белый пустой экран)
- [ ] iPhone Chrome guest: «Профиль» → `/login` с формой (или краткое «Загрузка…», затем форма — не пусто)
- [ ] При медленной сети `/api/auth/me`: нет длительного белого экрана на `/login`

## Автопроверка

```bash
pnpm --filter web exec vitest run components/guest-only.test.ts lib/app-nav.test.ts components/app-nav.test.ts app/library/library-page.test.ts
PLAYWRIGHT_CHROME_CHANNEL=0 pnpm --filter web exec playwright test e2e/smoke/library-page.spec.ts e2e/smoke/app-nav.spec.ts --project=chromium-desktop --project=chromium-mobile
```
