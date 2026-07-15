# Агрегация и автопубликация рейтингов

## Цель

Считать AggregatedScore и опубликовать Ranking top-N.

## Акторы

Система; admin запускает/lock/unpublish.

## User flow

1. Запустить aggregate.publish
2. Пересчёт scores
3. Публикация RankingEntry
4. RU title/description рейтинга

## Данные

AggregatedScore, Ranking, RankingEntry; ADR 0002.

## API / jobs

BullMQ `rankings.aggregate.publish`; AuditLog.

## Края и ошибки

isLocked не перетирает ручные ranks. Без user ratings.

## Критерии приёмки

- [ ] Top-N опубликован
- [ ] Details вкладов доступны admin
- [ ] Повторный прогон стабилен

## Ссылки

[rankings-aggregation](../tech/rankings-aggregation.md), [adr/0002](../adr/0002-rankings-aggregation.md)
