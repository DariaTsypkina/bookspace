# Публичный профиль

## Цель

Гость видит коллекцию user: полки, статусы, оценки, публичные заметки; опционально цель.

## Акторы

Гость, другие users; владелец.

## User flow

1. Открыть `/u/[userSlug]`
2. Смотреть полки/статусы
3. Открыть `/u/.../books/[workSlug]`
4. Видеть прогресс цели если разрешено

## Данные

User.slug, UserBook, shelves, public notes; ReadingGoal если showOnProfile.

## API / jobs

Public GET profile endpoints.

## Края и ошибки

PRIVATE notes скрыты. Цель скрыта без разрешения. 404 на удалённого user.

## Критерии приёмки

- [x] Профиль доступен без входа
- [x] Приватные заметки не видны
- [x] Страница книги в контексте пользователя работает
- [x] Цель видна только с тумблера

## Ссылки

[reading-goal](reading-goal.md), [notes-and-quotes](notes-and-quotes.md)
