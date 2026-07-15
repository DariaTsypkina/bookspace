# Импорт источников для подборок

## Цель

Импорт/разбор кураторских материалов в сырые кандидаты книг для подборки.

## Акторы

Admin / система.

## User flow

1. Запустить импорт источника для темы подборки
2. Matching на Work
3. Unmatched → queue

## Данные

Служебные записи импорта (по аналогии с external ranking raw) + MatchQueue; точная модель — при реализации сверить schema ADR при необходимости.

## API / jobs

BullMQ job коллекций (import).

## Края и ошибки

Не ломать батч из-за одной строки. Язык сырья — admin.

## Критерии приёмки

- [ ] Кандидаты импортируются
- [ ] Matching работает
- [ ] Очередь unmatched наполняется

## Ссылки

[admin-collections](admin-collections.md), [import-pipeline](../tech/import-pipeline.md)
