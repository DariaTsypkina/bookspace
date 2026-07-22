# Ручной чеклист: строка меню (bd-6b7.4 IA + bd-wus.3 Tailwind)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] На `/` видны три пункта: Главная · Поиск · Профиль (с иконками Lucide)
- [ ] Нет пунктов Рейтинги, Подборки, Админ
- [ ] Узкий viewport: меню снизу; широкий: горизонтальная полоса сверху
- [ ] Нет legacy-класса `app-nav` на `<nav>`
- [ ] Гость: Профиль → `/login`
- [ ] После входа: Профиль → `/library` (заглушка «Моя библиотека»)
- [ ] Активный пункт визуально выделен на `/`, `/search`, `/library` / `/login`
- [ ] `/admin/context` открывается прямым URL, но в меню его нет

## Автопроверка

```bash
pnpm --filter web test -- lib/app-nav.test.ts components/app-nav.test.ts
pnpm --filter web exec playwright test e2e/smoke/app-nav.spec.ts --project=chromium-desktop --project=chromium-mobile
```
