# Ручная проверка: Catalog pages Zod (bd-0t0.7)

## Предусловия

- Postgres + API (`:8000`) + Web (`:3000`) запущены локально
- Seed: `pnpm --filter api prisma:seed`
- `E2E_THROTTLE_BYPASS=true` при необходимости

## Сценарии guest (entity pages)

### Published work / author / character / world / place

- [ ] `/books/garri-potter-filosofskiy-kamen` — заголовок книги, автор, издания
- [ ] `/authors/dzhoan-rouyling` — имя автора и ссылки на книги
- [ ] `/characters/garri-potter` — имя персонажа и появления
- [ ] `/worlds/…` и `/places/…` из seed — имя и связанные сущности

### Draft / unknown → not found

- [ ] `/books/garri-potter-draft` — «Произведение не найдено»
- [ ] Несуществующий slug (`/authors/no-such-author-xyz`) — «Автор не найден»

### Mobile

- [ ] Те же published/not-found сценарии на узком viewport (~390px)

## Admin needs-context (API)

- [ ] Admin `PATCH /admin/works/:workId/needs-context` с `{"needsContext":"YES"}` → 200
- [ ] Тот же endpoint с `{"needsContext":"MAYBE"}` → 400, `code: VALIDATION_FAILED`, path `needsContext`

## Примечание

На entity pages нет пользовательских форм (read-only). Миграция Wave 2 здесь — shared Zod slug + needsContext DTO; UI-срез = smoke pages.
