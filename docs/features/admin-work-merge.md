# Merge дублей Work

## Цель

Необратимое объединение дублей с confirm и audit.

## Акторы

Admin.

## User flow

1. Найти кандидатов
2. Side-by-side сравнение
3. Confirm необратимости
4. Merge в canonical

## Данные

Work.mergedIntoId, status MERGED; перенос FK; AuditLog WORK_MERGE.

## API / jobs

Admin merge endpoint (транзакция).

## Края и ошибки

Нет un-merge в MVP.

## Критерии приёмки

- [ ] После merge UserBook на canonical
- [ ] ExternalId объединены
- [ ] Audit записан
- [ ] UI предупреждает о необратимости

## Ссылки

[admin](../tech/admin.md), [import-pipeline](../tech/import-pipeline.md)
