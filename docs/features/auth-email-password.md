# Auth: email и пароль

## Цель

Регистрация и вход по email/password через Nest.

## Акторы

Гость → user.

## User flow

1. `/register` с email/password
2. `/login`
3. Получить сессию

## Данные

User.email, passwordHash; validation пароля.

## API / jobs

Nest auth endpoints; hash на сервере.

## Края и ошибки

Слабый пароль — ошибка. Дубликат email — конфликт.

## Критерии приёмки

- [x] Регистрация создаёт USER
- [x] Вход выдаёт сессию
- [x] Пароль не отдаётся в API

## Ссылки

[auth-session](auth-session.md), [stack](../tech/stack-and-architecture.md)
