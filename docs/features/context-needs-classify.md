# Классификация needsContext

## Цель

Определить, нужен ли книге блок context.

## Акторы

Система (job), admin (приоритет YES/NO).

## User flow

1. Admin или job выставляет/классифицирует needsContext
2. UNKNOWN при низкой уверенности

## Данные

Work.needsContext: UNKNOWN|YES|NO.

## API / jobs

BullMQ `context.classify.need`; admin patch needsContext.

## Края и ошибки

Админский YES/NO не перезаписывается моделью.

## Критерии приёмки

- [ ] Admin NO сохраняется после classify job
- [ ] Низкая confidence → UNKNOWN
- [ ] YES разрешает extract

## Ссылки

[llm-context-reading](../tech/llm-context-reading.md), [admin-context](admin-context.md)
