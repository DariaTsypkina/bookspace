# Админ UI импорта каталога

## Цель

Запуск и мониторинг import jobs (OL/Wikidata/upload).

## Акторы

Admin.

## User flow

1. `/admin/import` выбрать источник
2. Старт job
3. Смотреть отчёт created/updated/queued/drafts/failed

## Данные

Job metadata; логика — import-pipeline.

## API / jobs

Trigger BullMQ `catalog.import.batch` + status.

## Края и ошибки

UI не дублирует matching-правила — только orchestration.

## Критерии приёмки

- [ ] Job запускается из UI
- [ ] Отчёт доступен
- [ ] Ссылки на MatchQueue работают

## Ссылки

[import-pipeline](../tech/import-pipeline.md)
