# Auth: Яндекс OAuth

## Цель

Вход/регистрация через Яндекс.

## Акторы

Гость → user.

## User flow

1. Нажать «Войти через Яндекс»
2. Согласие
3. Сессия в приложении

## Данные

OAuth account + User.

## API / jobs

Nest Yandex strategy.

## Края и ошибки

Ошибки OAuth — понятный RU экран.

## Критерии приёмки

- [ ] Яндекс login работает end-to-end
- [ ] Account связывается стабильно

## Ссылки

[auth-session](auth-session.md)
