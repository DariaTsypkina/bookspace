# Ручной чеклист: корневой layout shell (bd-wus.18)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] На `/` нет legacy-классов `app-shell` / `app-content` в DOM shell
- [ ] Узкий viewport: контент не перекрывается fixed bottom-nav (есть отступ снизу)
- [ ] Широкий viewport (md+): лишнего padding-bottom у content нет
- [ ] AppNav: мобильный низ / десктоп верх без регрессии IA (Главная · Поиск · Профиль)
- [ ] Главная и Поиск открываются из меню как раньше

## Автопроверка

```bash
pnpm --filter web exec vitest run app/layout-shell.test.ts
pnpm --filter web exec playwright test e2e/smoke/app-nav.spec.ts e2e/smoke/home-page.spec.ts --project=chromium-desktop --project=chromium-mobile
```
