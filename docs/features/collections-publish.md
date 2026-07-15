# Публикация подборки

## Цель

Собрать CollectionEntry и автоопубликовать (с правкой в админке).

## Акторы

Система / admin.

## User flow

1. Собрать entries из matched кандидатов или ручного набора
2. Проставить RU title/description
3. PUBLISHED

## Данные

Collection, CollectionEntry; AuditLog.

## API / jobs

BullMQ publish job + admin CRUD.

## Края и ошибки

User не создаёт app-level подборки.

## Критерии приёмки

- [ ] Автопубликация создаёт видимую подборку
- [ ] Admin может править состав после

## Ссылки

[admin-collections](admin-collections.md), [collections-list-and-page](collections-list-and-page.md)
