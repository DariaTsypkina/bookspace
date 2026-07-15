# Заметки и цитаты

## Цель

NOTE и QUOTE с выбором видимости PUBLIC/PRIVATE.

## Акторы

Владелец — CRUD; гость на профиле — только PUBLIC.

## User flow

1. Создать заметку/цитату к книге
2. Выбрать видимость
3. Увидеть на профиле только публичные

## Данные

Note: type NOTE|QUOTE, visibility PUBLIC|PRIVATE.

## API / jobs

Owner CRUD; public list filter visibility=PUBLIC.

## Края и ошибки

Смена PRIVATE→PUBLIC сразу на профиле. Admin UI не читает PRIVATE в MVP.

## Критерии приёмки

- [ ] NOTE и QUOTE поддерживаются
- [ ] PRIVATE не видна гостю
- [ ] PUBLIC видна на профиле

## Ссылки

[public-profile](public-profile.md), [mvp-spec](../product/mvp-spec.md)
