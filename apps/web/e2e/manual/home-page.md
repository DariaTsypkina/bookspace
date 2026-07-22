# Ручной чеклист: Главная `/` (bd-wus.4 / S1)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/` показывает заголовок «Главная» (h1)
- [ ] Нет legacy-класса `home-page` на `<main>`
- [ ] Заголовок по центру (mobile и desktop)
- [ ] Визуал «читальня» (фон/цвет текста без purple/Material)
- [ ] Меню «Основное меню» на месте; пункт Главная активен
- [ ] RU-копирайт без регрессии (нет английских лейблов на экране)

## Автопроверка

```bash
pnpm --filter web test -- app/home-page.test.ts
pnpm --filter web exec playwright test e2e/smoke/home-page.spec.ts --project=chromium-desktop --project=chromium-mobile
```
