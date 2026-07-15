# Публичные рейтинги (UI)

## Цель

Список топов и страница позиций.

## Акторы

Гость, user.

## User flow

1. `/rankings`
2. Открыть `/rankings/[slug]`
3. Увидеть позиции с titleRu книг

## Данные

Ranking PUBLISHED, RankingEntry, Work.

## API / jobs

Public GET rankings.

## Края и ошибки

Источники агрегации не показываются. DRAFT скрыт.

## Критерии приёмки

- [ ] Гость видит топы без входа
- [ ] Названия книг русские
- [ ] Порядок по rank

## Ссылки

[rankings-aggregation](../tech/rankings-aggregation.md)
