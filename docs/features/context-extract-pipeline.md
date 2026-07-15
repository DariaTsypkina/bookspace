# Пайплайн extract ContextReading

## Цель

Whitelist-источники → LLM extract → matching → автопубликация.

## Акторы

Система; admin запускает/смотрит результат.

## User flow

1. Запуск extract для Work с needsContext=YES
2. Fetch whitelist
3. LLM JSON кандидаты
4. Match → PUBLISHED или queue/DRAFT

## Данные

ContextReading + admin metadata; MatchQueue.

## API / jobs

BullMQ `context.extract.publish`; OpenAI via LlmProvider.

## Края и ошибки

disclaimer_ok false / 0 matched — не публиковать пустой блок; REJECTED не перетирать без force.

## Критерии приёмки

- [ ] Автопубликация создаёт PUBLISHED записи
- [ ] Unmatched уходит в очередь
- [ ] Snippet короткий, полный текст эссе не хранится

## Ссылки

[llm-context-reading](../tech/llm-context-reading.md), [import-pipeline](../tech/import-pipeline.md)
