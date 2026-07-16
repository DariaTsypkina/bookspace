# Книжная вселенная (Bookspace)

Русскоязычный веб + PWA для читателя: коллекция и прогресс, связи между книгами, рейтинги и подборки, блок «Для понимания».

## Для агентов

См. [AGENTS.md](AGENTS.md) и `.cursor/rules/`.

## Документация

- [Оглавление](docs/README.md)
- [Продуктовая спецификация MVP](docs/product/mvp-spec.md)
- [Чеклист документации и agent-setup](чеклист_документация_и_agent-setup.md)

## Локальный старт

1. `docker compose up -d`
2. `pnpm install`
3. `cp apps/api/.env.example apps/api/.env` (только local; в prod не копировать example как есть — см. [agent-dev-flow](docs/tech/agent-dev-flow.md))
4. `pnpm --filter api prisma:migrate`
5. `pnpm --filter api prisma:seed`
6. `pnpm dev`

Локальные URL:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- Web health: `http://localhost:3000/api/health`
- API health: `http://localhost:8000/health`

## Статус

Документация по чеклисту (этапы 0–9) закрыта. Реализация кода — следующий трек.
