# Auth: Google OAuth

## Цель

Вход/регистрация через Google.

## Акторы

Гость → user.

## User flow

1. Нажать «Войти через Google»
2. Согласие у провайдера
3. Вернуться с сессией

## Данные

OAuth account link + User; политика склейки по email.

## API / jobs

Nest Google strategy / OAuth routes.

## Края и ошибки

Cancel → `/auth/error` с RU текстом.

## Критерии приёмки

- [ ] Успешный Google login создаёт/логинит user
- [ ] Повторный вход узнаёт тот же account

## Ссылки

[auth-session](auth-session.md)
