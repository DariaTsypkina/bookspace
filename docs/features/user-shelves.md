# Пользовательские полки

## Цель

Создавать полки и класть на них книги из коллекции.

## Акторы

User (владелец); гости видят полки на профиле.

## User flow

1. Создать полку в `/library/shelves`
2. Добавить книги
3. Открыть полку по slug

## Данные

Shelf, ShelfItem.

## API / jobs

CRUD shelves (owner); public read на профиле.

## Края и ошибки

Пустая полка — empty state. Удаление полки не обязано удалять UserBook.

## Критерии приёмки

- [x] Владелец CRUD полок
- [x] Гость видит полки на публичном профиле

## Ссылки

[user-library-page](user-library-page.md), [public-profile](public-profile.md)
