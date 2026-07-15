# Журнал аудита

## Цель

Read-only просмотр admin-операций.

## Акторы

Admin.

## User flow

1. `/admin/audit`
2. Фильтры action/actor/entity/дата
3. Просмотр before/after

## Данные

AuditLog.

## API / jobs

Admin read API.

## Края и ошибки

Без редактирования логов в MVP.

## Критерии приёмки

- [ ] Merge и publish/unpublish видны в логе
- [ ] Фильтры работают

## Ссылки

[database-schema](../tech/database-schema.md)
