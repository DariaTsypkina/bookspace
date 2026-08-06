# Ручной чеклист: админ UI импорта каталога (bd-i5b.4)

## Подготовка

- API + web локально; Postgres + Redis (или `JOBS_SYNC=true` для sync-пути).
- Войти как `admin@bookspace.local` / `Admin123!`.

## Сценарии

1. `/admin` → «Импорт каталога» → `/admin/import`.
2. Источник «Список ISBN»: вставить 1–2 ISBN → «Запустить».
3. Видны job id и отчёт created/updated/queued/drafts/failed.
4. Ссылка «Открыть MatchQueue» ведёт на `/admin/match-queue` (страница может быть 404 до bd-i5b.7).
5. Источник Open Library / Wikidata: ввести query → stub-адаптер создаёт DRAFT с ExternalId.
6. JSON upload: массив без id → queued + ссылки `?id=` при наличии matchQueueIds.
7. USER / guest: `/admin/import` → редирект (guest→login, user→home).

## Не в scope

- Live HTTP Open Library / Wikidata adapters.
- Полный fuzzy matching / LLM-подсказки.
