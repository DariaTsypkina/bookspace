# Админка (MVP)

Доступ: только `User.role = ADMIN`. UI: Next `/admin/*`. API: Nest admin routes с обязательной server-side проверкой роли.  
Связано: [screens](screens.md), [database-schema](database-schema.md).

## Решения этапа

- **ContextReading:** автопубликация как в продуктовой спеке; в админке — очередь **недавних auto-published** для выборочной правки (не обязательный статус «на модерации» до показа пользователю).
- **Merge Works:** **необратимый** в MVP; UI confirm + `AuditLog` `WORK_MERGE`.

## Модули

### 1. Дашборд `/admin`

- Счётчики: `MatchQueue` OPEN, свежие ContextReading (auto-published за N дней), failed BullMQ jobs.
- Быстрые действия: импорт каталога, агрегация рейтингов, LLM context batch.

### 2. Каталог CRUD

- Works / Editions / Authors / Series / Characters / Worlds / Places.
- Создание DRAFT → публикация PUBLISHED.
- Ручная привязка ExternalId.
- Поле `needsContext`: UNKNOWN / YES / NO.

### 3. Дедупликация и merge

1. Кандидаты: ISBN / ExternalId; иначе fuzzy (title + author + year).
2. UI side-by-side «возможные дубликаты».
3. Выбор canonical Work → остальные `MERGED` + `mergedIntoId`; перенос FK (UserBook, RankingEntry, ContextReading, relations); объединение ExternalId.
4. Confirm с явным предупреждением о **необратимости**; `AuditLog`.

### 4. Импорт каталога `/admin/import`

- Источник: Open Library query / ISBN list / JSON upload.
- Старт BullMQ `catalog.import.batch`; прогресс job id; отчёт created/updated/queued/failed.
- Детали — [import-pipeline](import-pipeline.md) (этап 5).

### 5. Рейтинги и внешние источники

- CRUD Ranking (RU title/description, theme, publish/unpublish, lock).
- Правка RankingEntry.
- ExternalRankingSource: weight, URL, last fetch.
- Импорт → matching → «Агрегировать и опубликовать».
- Просмотр `AggregatedScore.details` (admin only).

### 6. Подборки

- CRUD Collection + entries + optional `blurbRu`.
- Импорт/LLM-наполнение с правкой после автопубликации.

### 7. ContextReading `/admin/context`

- Список по subject Work; фильтры status, needsContext.
- Очередь **недавних auto-published** для выборочного review.
- Admin-поля: sourceUrl, snippet, model, runId (не в public API).
- Edit whyText / importanceRank; unpublish / reject.
- Запуск classify / extract (одна книга или пачка).

### 8. Match queue `/admin/match-queue`

- OPEN items: kind, raw payload, предложенные Works.
- Действия: привязать Work, создать DRAFT Work, dismiss.
- После resolve — дотянуть зависимые ranking/context связи.

### 9. Audit `/admin/audit`

- Фильтры action / actor / entity / дата. Read-only.

## API-конвенции

- Prefикс `/admin/...` на Nest; запрет опираться только на hide UI.
- Job triggers идемпотентны (`idempotencyKey` от клиента).
- Все мутации merge / context / ranking publish|unpublish / collection update → AuditLog где указано в схеме.

## Не в MVP admin

- Биллинг (допустим простой toggle `isPremium`).
- Обратный un-merge.
- Полноценный WYSIWYG / маркетинговый CMS.
- Обязательный pre-moderation gate для ContextReading.
