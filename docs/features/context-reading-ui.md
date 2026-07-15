# Блок «Для понимания» (UI)

## Цель

Публичный список рекомендованных книг с whyText и дисклеймером.

## Акторы

Гость, user.

## User flow

1. Открыть книгу с PUBLISHED ContextReading
2. Увидеть список по importanceRank
3. Прочитать дисклеймер об автосборке

## Данные

ContextReading status=PUBLISHED; recommended Work.

## API / jobs

Публичный read API без sourceUrl/snippet/model.

## Края и ошибки

Нет published — секция не рендерится. Источники скрыты.

## Критерии приёмки

- [ ] Блок только при наличии данных
- [ ] whyText на русском
- [ ] Дисклеймер виден
- [ ] Нет URL источников

## Ссылки

[llm-context-reading](../tech/llm-context-reading.md)
