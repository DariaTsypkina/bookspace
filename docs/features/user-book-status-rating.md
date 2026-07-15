# Статус и оценка книги

## Цель

User ставит WANT|READING|READ|ABANDONED и оценку 1–10.

## Акторы

User (владелец).

## User flow

1. С страницы книги или библиотеки выбрать статус
2. Опционально поставить рейтинг

## Данные

UserBook unique (userId, workId); rating 1–10; finishedAt при READ.

## API / jobs

Authenticated PATCH/POST user-books.

## Края и ошибки

Оценка вне диапазона — 400. Чужой user — 403.

## Критерии приёмки

- [ ] Статус сохраняется
- [ ] Рейтинг 1–10
- [ ] Публично видно на профиле

## Ссылки

[database-schema](../tech/database-schema.md), [public-profile](public-profile.md)
