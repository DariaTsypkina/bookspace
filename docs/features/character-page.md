# Карточка персонажа

## Цель

Книги появления и связи с другими персонажами (за spoiler gate).

## Акторы

Гость, user.

## User flow

1. Открыть `/characters/[slug]`
2. Пройти spoiler gate при необходимости
3. Увидеть appearances и CharacterRelation

## Данные

Character, CharacterAppearance, CharacterRelation, Work.

## API / jobs

GET character by slug.

## Края и ошибки

Спойлерный контент только после gate. Связи книг — не здесь.

## Критерии приёмки

- [ ] Страница персонажа доступна гостю
- [ ] Связи персонажей видны после spoiler-согласия
- [ ] Список книг появления корректен

## Ссылки

[spoiler-gate](spoiler-gate.md), [screens](../tech/screens.md)
