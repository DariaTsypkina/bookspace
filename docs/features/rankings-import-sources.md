# Импорт внешних рейтингов

## Цель

Загрузка ExternalRankingSource entries и matching на Work.

## Акторы

Admin / система.

## User flow

1. Выбрать источник
2. Запустить import job
3. MATCHED привязаны; UNMATCHED в очереди

## Данные

ExternalRankingSource, ExternalRankingEntry, MatchQueue.

## API / jobs

BullMQ `rankings.import.source`.

## Края и ошибки

Одна unmatched строка не роняет батч. User ratings не участвуют.

## Критерии приёмки

- [ ] Импорт пишет entries
- [ ] Matching статусы корректны
- [ ] Unmatched в MatchQueue

## Ссылки

[rankings-aggregation](../tech/rankings-aggregation.md), [admin-rankings](admin-rankings.md)
