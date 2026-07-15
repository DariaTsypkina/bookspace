# Карточка серии

## Цель

Серия книг и переход к порядку чтения.

## Акторы

Гость, user.

## User flow

1. Открыть `/series/[slug]`
2. Увидеть список works серии
3. Перейти к порядку чтения / книге

## Данные

Series, WorkSeries, Work PUBLISHED.

## API / jobs

GET series by slug.

## Края и ошибки

Детальный reading-order может быть отдельным блоком/маршрутом — см. reading-order.

## Критерии приёмки

- [ ] Серия доступна без входа
- [ ] Книги серии отображаются с positionInSeries если задан

## Ссылки

[reading-order](reading-order.md), [screens](../tech/screens.md)
