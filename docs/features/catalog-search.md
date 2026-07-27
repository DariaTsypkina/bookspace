# Поиск по каталогу

## Цель

Найти произведения и связанные сущности по текстовому запросу.

## Акторы

Гость, user.

## User flow

1. Открыть `/search`
2. Ввести запрос
3. Увидеть результаты с типом сущности
4. Перейти на карточку

## Данные

FTS по Work/Author/Series/Character/World/Place (PUBLISHED, не soft-deleted).

## API / jobs

Search API или server fetch к Nest; индексация при upsert каталога.

## Края и ошибки

Пустой q — подсказки, не полный дамп. DRAFT/MERGED скрыты.

## Критерии приёмки

- [ ] Поиск находит по titleRu и titleOrig при наличии в индексе
- [ ] Префикс запроса находит полные совпадения (пример: `роул` → «Роулинг»)
- [ ] В выдаче есть типы сущностей
- [ ] Неопубликованное не показывается
- [ ] Пустой q — подсказки, не полный дамп

## Ссылки

[screens](../tech/screens.md), [database-schema](../tech/database-schema.md), [import-pipeline](../tech/import-pipeline.md)
