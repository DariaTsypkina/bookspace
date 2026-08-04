# Связи произведений

## Цель

Показать sequel/prequel/related/adaptation на карточке книги.

## Акторы

Гость, user.

## User flow

1. На `/books/[slug]` открыть блок связей
2. Пройти spoiler gate
3. Перейти к связанной книге

## Данные

WorkRelation types SEQUEL|PREQUEL|RELATED|ADAPTATION.

## API / jobs

Отдаётся в GET work (include relations) или отдельный endpoint.

## Края и ошибки

Нет связей — блок скрыт. User не редактирует.

## Критерии приёмки

- [x] Типы связей отображаются различимо
- [x] Контент за spoiler gate
- [x] Ссылки ведут на PUBLISHED works

## Ссылки

[spoiler-gate](spoiler-gate.md), [database-schema](../tech/database-schema.md)
