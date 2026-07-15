# Карточка автора

## Цель

Страница автора и список связанных произведений.

## Акторы

Гость, user.

## User flow

1. Открыть `/authors/[slug]`
2. Увидеть имя и описание
3. Перейти к книгам автора

## Данные

Author, WorkAuthor, Work PUBLISHED.

## API / jobs

GET author by slug.

## Края и ошибки

404; пустой список книг — корректный empty state.

## Критерии приёмки

- [ ] SEO-страница автора открывается без входа
- [ ] Книги автора кликабельны

## Ссылки

[screens](../tech/screens.md), [database-schema](../tech/database-schema.md)
