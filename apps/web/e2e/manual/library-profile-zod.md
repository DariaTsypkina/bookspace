# Ручная проверка: Library/Profile Zod + RHF (bd-0t0.8)

## Предусловия

- Postgres + API (`:8000`) + Web (`:3000`) запущены локально
- `E2E_THROTTLE_BYPASS=true` при необходимости
- Предпочтительно `http://localhost` (не `127.0.0.1`) для cookie

## Сценарии library

### Guest

- [ ] `/library` — заголовок «Моя библиотека», текст про полки, форма «Добавить в библиотеку»
- [ ] Submit с `workId` без сессии → статус «Войдите, чтобы добавить книгу…»
- [ ] Нет legacy-класса `library-stub` на `<main>`

### Authenticated

- [ ] Регистрация → вход → `/library`
- [ ] Ввести `work-1` → «Добавить в библиотеку» → «Добавлено в библиотеку (заглушка)»
- [ ] API напрямую: `POST /me/library/items` с `workId` из 129 символов → 400 `VALIDATION_FAILED`, path `workId`

## Сценарии profile

- [ ] `/u/demo-reader` — stub профиля со slug
- [ ] `/u/%20%20%20` (или невалидный slug) → «Профиль не найден.»
- [ ] Нет legacy-класса `profile-stub`

### Mobile

- [ ] Те же сценарии на узком viewport (~390px)

## Примечание

Shelves/tags CRUD в runtime ещё нет (нет Prisma/API) — вне среза. Миграция Wave 2 здесь: shared Zod AddLibraryItem + ProfileSlug, me-library Zod DTO, RHF form на `/library`, BFF `/api/me`.
