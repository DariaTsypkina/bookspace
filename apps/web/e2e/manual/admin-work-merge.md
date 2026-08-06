# Admin Work Merge — ручной чеклист

Фича: `bd-i5b.3` · `docs/features/admin-work-merge.md`

## Предусловия

- Локально подняты Postgres + Redis, `api` и `web`
- Seed admin: `admin@bookspace.local` / `Admin123!`
- Миграция `Work.mergedIntoId` применена

## Шаги

1. Войти как admin → `/admin/catalog` → ссылка «Объединить дубли»
2. Убедиться, что виден красный баннер «Операция необратима…»
3. Создать два DRAFT на `/admin/catalog` (или выбрать существующие)
4. На `/admin/catalog/merge` выбрать канон и дубликат — side-by-side (title, status, ExternalId)
5. Нажать «Объединить…» → появляется «Подтвердить необратимое объединение» (не `window.confirm`)
6. Подтвердить → сообщение успеха; дубликат исчезает из списков активных / статус MERGED
7. Проверить, что UserBook / ExternalId дубликата на каноне (через БД или UI каталога)
8. Non-admin / guest: `/admin/catalog/merge` → редирект на `/login`

## Ожидание

- Нет un-merge
- Audit `WORK_MERGE` в `AuditLog`
