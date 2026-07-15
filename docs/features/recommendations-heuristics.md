# Эвристики рекомендаций

## Цель

Правила подбора похожих книг для guest и user без ML-платформы.

## Акторы

Система.

## User flow

1. На запрос рекомендаций собрать сигналы
2. Отранжировать кандидатов
3. Исключить/понизить уже прочитанное у user

## Данные

WorkRelation, series/authors/world, AggregatedScore/rankings; UserBook для auth.

## API / jobs

Чистая функция/сервис в Nest; без отдельной job-платформы в MVP.

## Края и ошибки

≠ ContextReading. Не использовать PRIVATE notes.

## Критерии приёмки

- [ ] Guest опирается на каталог/популярность
- [ ] User учитывает полку/оценки
- [ ] Нет зависимости от LLM context pipeline

## Ссылки

[mvp-spec §7.3](../product/mvp-spec.md), [rankings-aggregation](../tech/rankings-aggregation.md)
