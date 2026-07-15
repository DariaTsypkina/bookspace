# Админка ContextReading

## Цель

Очередь недавних auto-published, правка, unpublish/reject, запуск jobs.

## Акторы

Admin.

## User flow

1. Открыть `/admin/context`
2. Просмотреть свежие auto-published
3. Править why/rank или снять с публикации
4. Запустить classify/extract

## Данные

ContextReading admin fields; AuditLog.

## API / jobs

Admin API + BullMQ triggers.

## Края и ошибки

Не pre-moderation gate; public не видит source*.

## Критерии приёмки

- [ ] Очередь свежих записей доступна
- [ ] Unpublish убирает блок у пользователя
- [ ] Audit на ключевые правки

## Ссылки

[admin](../tech/admin.md), [llm-context-reading](../tech/llm-context-reading.md)
