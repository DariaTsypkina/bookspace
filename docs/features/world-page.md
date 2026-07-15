# Карточка мира

## Цель

Описание мира и связанные локации/книги.

## Акторы

Гость, user.

## User flow

1. Открыть `/worlds/[slug]`
2. Увидеть места мира и связанные works при наличии

## Данные

World, Place, WorkPlace, Work.

## API / jobs

GET world by slug.

## Края и ошибки

404; мир без мест — empty state.

## Критерии приёмки

- [ ] Страница мира открывается без входа
- [ ] Локации мира доступны по ссылкам

## Ссылки

[screens](../tech/screens.md), [place-page](place-page.md)
