# Админ UI подборок

## Цель

CRUD подборок и запуск import/publish наполнения.

## Акторы

Admin.

## User flow

1. Создать/править Collection
2. Запустить import/publish
3. Править entries и blurbRu

## Данные

Collection*, audit.

## API / jobs

Admin API + jobs.

## Края и ошибки

User shelves ≠ app collections.

## Критерии приёмки

- [ ] Admin управляет составом
- [ ] Автонаполнение запускается из UI

## Ссылки

[collections-publish](collections-publish.md)
