# Админ UI рейтингов

## Цель

Управление Ranking, источниками, запуском import/aggregate, lock/unpublish.

## Акторы

Admin.

## User flow

1. CRUD Ranking
2. Импорт источника
3. Агрегировать и опубликовать
4. Смотреть details скоров

## Данные

Ranking*, ExternalRanking*, AggregatedScore.

## API / jobs

Admin API + job triggers.

## Края и ошибки

Public не видит sources.

## Критерии приёмки

- [ ] Admin публикует/снимает рейтинг
- [ ] Запуск import/aggregate из UI
- [ ] Lock защищает ручные ranks

## Ссылки

[rankings-aggregate-publish](rankings-aggregate-publish.md), [admin](../tech/admin.md)
