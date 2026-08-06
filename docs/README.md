# Документация Книжной вселенной

## Конвенции (этап 0)

- **Язык:** русский.
- **Корень:** папка `docs/`.
- **Продукт («что»):** [product/mvp-spec.md](product/mvp-spec.md) — источник правды по scope MVP.
- **Техника («как»):** `tech/` — появляется на этапах 1–7 чеклиста.
- **Функции:** `features/` — feature-docs на этапе 9.
- **ADR:** `adr/` — короткие записи архитектурных решений (стек, формулы, смена пайплайна). Шаблон — [adr/README.md](adr/README.md).

При конфликте продукта и кода побеждает продуктовая спека, пока ADR явно не зафиксирует иное техрешение.

## Оглавление

### Продукт

- [Спецификация MVP](product/mvp-spec.md)

### Техника

- [Стек и архитектура](tech/stack-and-architecture.md)
- [Схема БД](tech/database-schema.md)
- [Экраны](tech/screens.md)
- [Админка](tech/admin.md)
- [Пайплайн импорта](tech/import-pipeline.md)
- [Агрегация рейтингов](tech/rankings-aggregation.md)
- [LLM / ContextReading](tech/llm-context-reading.md)
- [Процесс разработки для агентов (TDD + browser)](tech/agent-dev-flow.md)
- [Feature workflow (эпик → plan → review → finish)](tech/feature-workflow.md)
- [Запросы от человека (доработки, баги)](tech/human-intake-workflow.md)
- [Миграция Tailwind + shadcn](tech/migration-tailwind-shadcn.md)
- [Миграция RHF + Zod](tech/migration-rhf-zod.md)
- [Миграция axios](tech/migration-axios.md)
- [Beads conventions (validation / lint)](../.cursor/rules/bd-conventions.mdc)
- [PROJECT-STATUS (дашборд)](../PROJECT-STATUS.md)

### Функции

- [Карта feature-docs](features/README.md) — 45 файлов в `docs/features/`


### ADR

- [Как писать ADR](adr/README.md)
- [0001 — Стек MVP](adr/0001-stack-mvp.md)
- [0002 — Агрегация рейтингов](adr/0002-rankings-aggregation.md)
- [0003 — Tailwind + shadcn](adr/0003-tailwind-shadcn.md) (**accepted**)
- [0004 — RHF + Zod full contour](adr/0004-rhf-zod-full-contour.md) (**accepted**)
- [0005 — HTTP-клиент axios](adr/0005-axios-http-client.md) (**accepted**)
