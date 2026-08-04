# Порядок чтения

## Цель

Явный рекомендуемый порядок чтения серии/вселенной.

## Акторы

Гость, user.

## User flow

1. Открыть серию или блок порядка на книге
2. Пройти spoiler gate
3. Увидеть упорядоченный список

## Данные

WorkSeries.positionInSeries и/или WorkRelation.readingOrder.

## API / jobs

GET series/reading-order или поле в series/work payload.

## Края и ошибки

Циклы графа не должны ломать UI; неоднозначность — стабильный tie-break.

## Критерии приёмки

- [x] Порядок отображается последовательно
- [x] За spoiler gate
- [x] Отличается от простой кучи related

## Ссылки

[series-page](series-page.md), [work-relations](work-relations.md)
