# Админ-дашборд

## Цель

Сводка очередей и быстрый запуск jobs.

## Акторы

Admin.

## User flow

1. Открыть `/admin`
2. Увидеть счётчики MatchQueue / context / failed jobs
3. Запустить быстрые действия

## Данные

Агрегаты по очередям + статус BullMQ.

## API / jobs

Admin summary API.

## Края и ошибки

Non-admin — 403/redirect.

## Критерии приёмки

- [ ] Дашборд доступен только admin
- [ ] Счётчики отражают OPEN очереди

## Ссылки

[admin](../tech/admin.md)
