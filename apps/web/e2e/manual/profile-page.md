# Ручной чеклист: Публичный профиль `/u/[slug]` (bd-wus.14 / S11)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/u/demo-reader` показывает заголовок «Профиль» (h1)
- [ ] Нет legacy-класса `profile-stub` на `<main>`
- [ ] Виден slug и текст «скоро появится»
- [ ] Кнопка «Выйти» видна (гость: клик → `/login`)
- [ ] Авторизованный: `/login` и `/register` редиректят на `/u/<slug>` без форм
- [ ] После «Выйти» → `/login`, повторный `/login` не уводит в профиль
- [ ] Визуал «читальня» (фон/текст без purple/Material)
- [ ] RU-копирайт без регрессии

## Автопроверка

```bash
pnpm --filter web test -- app/u/\[slug\]/profile-page.test.ts
pnpm --filter web exec playwright test e2e/smoke/profile-page.spec.ts e2e/smoke/auth-redirect-profile.spec.ts e2e/smoke/auth-pages.spec.ts --project=chromium-desktop --project=chromium-mobile
```
