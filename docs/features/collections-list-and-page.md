# Публичные подборки (UI)

## Цель

Тематические списки без обязательного жёсткого ранга «кто лучше».

## Акторы

Гость, user.

## User flow

1. `/collections`
2. Открыть `/collections/[slug]`

## Данные

Collection PUBLISHED, CollectionEntry, optional blurbRu.

## API / jobs

Public GET collections.

## Края и ошибки

Пустую подборку предпочтительно не публиковать.

## Критерии приёмки

- [ ] Гость открывает подборку без входа
- [ ] UI title/description на русском

## Ссылки

[mvp-spec](../product/mvp-spec.md)
