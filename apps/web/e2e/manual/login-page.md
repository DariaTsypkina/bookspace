# Ручной чеклист: Вход `/login` (bd-wus.5 / S2)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/login` показывает заголовок «Вход» (h1)
- [ ] Нет legacy-класса `auth-page` на `<main>`
- [ ] Поля Email / Пароль и кнопка «Войти» доступны
- [ ] Ссылки «Войти через Google» / «Войти через Яндекс» ведут на `/api/auth/*`
- [ ] «Зарегистрироваться» ведёт на `/register`
- [ ] Неверный пароль показывает ошибку (role=alert), URL остаётся `/login`
- [ ] Успешный вход редиректит с `/login` (поведение GuestOnly / session)
- [ ] Визуал «читальня» (фон/текст без purple/Material)
- [ ] RU-копирайт без регрессии

## Автопроверка

```bash
pnpm --filter web test -- app/login/login-page.test.ts
pnpm --filter web exec playwright test e2e/smoke/login-page.spec.ts --project=chromium-desktop --project=chromium-mobile
```
