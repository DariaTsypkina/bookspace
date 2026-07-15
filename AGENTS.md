# Агенты (Bookspace / Книжная вселенная)

Читай перед задачами в этом репозитории.

## Источники правды

1. Продукт: [docs/product/mvp-spec.md](docs/product/mvp-spec.md)
2. Техника: [docs/tech/](docs/tech/)
3. ADR: [docs/adr/](docs/adr/)
4. Фичи: [docs/features/](docs/features/) (этап 9)
5. Чеклист: [чеклист_документация_и_agent-setup.md](чеклист_документация_и_agent-setup.md)
6. Процесс разработки и тесты: [docs/tech/agent-dev-flow.md](docs/tech/agent-dev-flow.md)

При конфликте с кодом — обнови код под docs или предложи ADR.

## Стек (кратко)

- Frontend: Next.js + TypeScript (отдельное app)
- Backend: NestJS + TypeScript + Prisma + PostgreSQL (FTS)
- Jobs: BullMQ + Redis
- Auth на Nest; LLM: OpenAI через `LlmProvider`
- Детали: [docs/tech/stack-and-architecture.md](docs/tech/stack-and-architecture.md)

## Инварианты

- User не редактирует каталог / рейтинги / подборки приложения
- Коллекция публична; notes — PUBLIC/PRIVATE
- ContextReading источники только admin; блок только если есть PUBLISHED
- UI и display-названия — русский
- MVP без подписок/ленты, графа, таймлайна, биллинга

## Cursor

Rules: `.cursor/rules/`. Skills (project-only): `.cursor/skills/`.
