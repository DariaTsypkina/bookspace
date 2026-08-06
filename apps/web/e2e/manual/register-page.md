# Ручной чеклист: Регистрация `/register` (bd-wus.6 / S3)

## Prefight

- [ ] `api` + `web` запущены (Docker Postgres/Redis при необходимости)
- [ ] Открыть сайт в обычном браузере (не только Playwright)

## Сценарии

- [ ] `/register` показывает заголовок «Регистрация» (h1)
- [ ] Нет legacy-класса `auth-page` на `<main>`
- [ ] Поля Email / Пароль и кнопка «Зарегистрироваться» доступны
- [ ] У поля «Пароль» есть кнопка глаза: по умолчанию скрыт; клик показывает символы и меняет aria на «Скрыть пароль»; повтор скрывает (bd-957.5)
- [ ] Нет кнопок/ссылок «Войти через Google» / «Войти через Яндекс» (bd-957.9; BFF OAuth жив, только UI скрыт)
- [ ] «Войти» ведёт на `/login`
- [ ] Слабый пароль показывает ошибку (role=alert), URL остаётся `/register`
- [ ] Успешная регистрация редиректит на `/login`
- [ ] Дубликат email показывает ошибку (role=alert)
- [ ] Визуал «читальня» (фон/текст без purple/Material)
- [ ] RU-копирайт без регрессии

## Автопроверка

```bash
pnpm --filter web test -- app/register/register-page.test.ts components/ui/password-input.test.ts
pnpm --filter web exec playwright test e2e/smoke/register-page.spec.ts e2e/smoke/password-visibility.spec.ts --project=chromium-desktop --project=chromium-mobile
```
