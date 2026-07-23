# Ручной чеклист: PWA установка (bd-6b7.1)

## Prefight

- [ ] `api` + `web` запущены (HTTPS или localhost; Chrome требует secure context для install, localhost ок)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Android Chrome — установка

- [ ] Открыть сайт → меню Chrome → «Установить приложение» / Install app (или баннер)
- [ ] После установки на домашнем экране есть иконка «Книжная»
- [ ] Тап по иконке открывает shell (standalone): видна навигация Главная · Поиск · Рейтинги · Подборки · Профиль, URL-бар браузера скрыт/минимален
- [ ] `start_url` — корень `/` (Главная)

## iOS Safari — Add to Home Screen (ограничение)

Safari **не** поддерживает `beforeinstallprompt`. Установка только вручную:

- [ ] Safari → Поделиться → «На экран „Домой“» / Add to Home Screen
- [ ] Иконка появляется; открытие запускает сайт в standalone-подобном режиме
- [ ] Ожидаемо: нет системного Install prompt как в Chrome

## Manifest / иконки

- [ ] `/manifest.webmanifest` открывается, поля `name`, `short_name`, `display=standalone`, `start_url=/`, icons 192 и 512
- [ ] Иконки `/icons/icon-192.png` и `/icons/icon-512.png` отдаются как PNG

## Автопроверка

```bash
pnpm --filter web test -- lib/pwa/manifest.test.ts lib/pwa/install-prompt.test.ts app/pwa-metadata.test.ts
pnpm --filter web exec playwright test e2e/smoke/pwa-install.spec.ts --project=chromium-desktop --project=chromium-mobile
```
