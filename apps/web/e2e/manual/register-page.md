# Ручной чеклист: Регистрация `/register` (bd-wus.6 / S3)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/register` показывает заголовок «Регистрация» (h1)
- [ ] Нет legacy-класса `auth-page` на `<main>`
- [ ] Поля Email / Пароль и кнопка «Зарегистрироваться» доступны
- [ ] Ссылки «Войти через Google» / «Войти через Яндекс» ведут на `/api/auth/*`
- [ ] «Войти» ведёт на `/login`
- [ ] Слабый пароль показывает ошибку (role=alert), URL остаётся `/register`
- [ ] Успешная регистрация редиректит на `/login`
- [ ] Дубликат email показывает ошибку (role=alert)
- [ ] Визуал «читальня» (фон/текст без purple/Material)
- [ ] RU-копирайт без регрессии

## Автопроверка

```bash
pnpm --filter web test -- app/register/register-page.test.ts
pnpm --filter web exec playwright test e2e/smoke/register-page.spec.ts --project=chromium-desktop --project=chromium-mobile
```
