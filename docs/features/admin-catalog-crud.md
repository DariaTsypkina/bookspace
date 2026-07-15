# Админ CRUD каталога

## Цель

Создание/редактирование Work и связанных сущностей, публикация DRAFT→PUBLISHED.

## Акторы

Admin.

## User flow

1. CRUD сущности
2. Привязать ExternalId
3. Выставить needsContext

## Данные

Все каталожные таблицы; soft-delete.

## API / jobs

Admin REST.

## Края и ошибки

Не затирать чужие user данные. MERGED — осторожно, только через merge flow.

## Критерии приёмки

- [ ] Admin создаёт и публикует Work
- [ ] ExternalId задаётся вручную
- [ ] Soft-delete скрывает из public

## Ссылки

[database-schema](../tech/database-schema.md)
