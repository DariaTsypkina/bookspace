# Ручной чеклист: App shell и tab-bar (bd-6b7.3)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] На `/` видны пять пунктов: Главная · Поиск · Рейтинги · Подборки · Профиль (с иконками Lucide)
- [ ] Нет пункта «Админ» / ссылок на `/admin` в меню
- [ ] Узкий viewport: меню снизу; широкий: горизонтальная полоса сверху
- [ ] Нет legacy-класса `app-nav` на `<nav>`
- [ ] Гость: Профиль → `/login`
- [ ] После входа: Профиль → `/library` (заглушка «Моя библиотека»)
- [ ] `/rankings` и `/collections` открываются из меню (заглушки без фейковых данных)
- [ ] Активный пункт визуально выделен на `/`, `/search`, `/rankings`, `/collections`, `/library` / `/login`
- [ ] `/admin/context` открывается прямым URL; в меню его нет; ни один таб не подсвечен

## Автопроверка

```bash
pnpm --filter web test -- lib/app-nav.test.ts components/app-nav.test.ts
pnpm --filter web exec playwright test e2e/smoke/app-nav.spec.ts --project=chromium-desktop --project=chromium-mobile
```
