# Очередь не сматченного

## Цель

Разбор MatchQueue: привязать Work, создать DRAFT, dismiss.

## Акторы

Admin.

## User flow

1. Открыть `/admin/match-queue`
2. Выбрать OPEN item
3. Resolve или dismiss

## Данные

MatchQueue kinds RANKING_ENTRY|CONTEXT_CANDIDATE|IMPORT_ROW.

## API / jobs

Admin resolve API; дотягивание зависимых связей.

## Края и ошибки

Dismiss не удаляет историю без необходимости — статус DISMISSED.

## Критерии приёмки

- [ ] Привязка Work резолвит item
- [ ] Создание DRAFT возможно
- [ ] После resolve зависимые пайплайны можно дотянуть

## Ссылки

[import-pipeline](../tech/import-pipeline.md)
