# Карточка локации

## Цель

Место действия; опциональная связь с миром; книги.

## Акторы

Гость, user.

## User flow

1. Открыть `/places/[slug]`
2. Увидеть world (если есть) и books

## Данные

Place, World?, WorkPlace, Work.

## API / jobs

GET place by slug.

## Края и ошибки

Spoiler gate при показе чувствительных связей — по необходимости через общий компонент.

## Критерии приёмки

- [ ] Локация связана с миром при наличии worldId
- [ ] Книги места перечисляются

## Ссылки

[world-page](world-page.md), [spoiler-gate](spoiler-gate.md)
