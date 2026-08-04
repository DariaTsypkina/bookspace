# Схема БД (MVP)

Источник домена: [mvp-spec §6](../product/mvp-spec.md). ORM: Prisma. СУБД: PostgreSQL. Стек: [stack-and-architecture](stack-and-architecture.md).

## Общие правила

- PK: `uuid` (`gen_random_uuid()`).
- Timestamps: `createdAt` / `updatedAt` на основных сущностях (в SQL — `created_at` / `updated_at`).
- **Soft-delete:** `deletedAt` на каталоге и `User`; публичные запросы: `deletedAt IS NULL`.
- Слаги: `slug` unique там, где есть публичный URL.
- Названия MVP: пара **`titleRu` / `titleOrig`** (и аналоги `nameRu` / `nameOrig` у Author и др.). Таблица переводов — post-MVP (отдельный ADR); API отдаёт display-title для локали `ru`.
- **`Work.status`:** `DRAFT` | `PUBLISHED` | `MERGED`. Пользователю видны только `PUBLISHED`.
- Аудит admin: таблица `AuditLog`.

## ER (логический)

```mermaid
erDiagram
  User ||--o{ UserBook : owns
  User ||--o{ Note : writes
  User ||--o{ Shelf : owns
  User ||--o{ ReadingGoal : sets
  Work ||--o{ Edition : has
  Work ||--o{ UserBook : onShelf
  Work ||--o{ WorkRelation : from
  Work ||--o{ WorkRelation : to
  Work ||--o{ ContextReading : subject
  Work ||--o{ ContextReading : recommended
  Work }o--o{ Author : writtenBy
  Work }o--o{ Series : belongsTo
  Work ||--o{ CharacterAppearance : features
  Work }o--o{ Place : setIn
  Place }o--o| World : partOf
  Character ||--o{ CharacterAppearance : appears
  Character ||--o{ CharacterRelation : related
  Work ||--o{ ExternalId : mapped
  Author ||--o{ ExternalId : mapped
  Ranking ||--o{ RankingEntry : contains
  Collection ||--o{ CollectionEntry : contains
  ExternalRankingSource ||--o{ ExternalRankingEntry : has
  Work ||--o{ AggregatedScore : scored
```

## Каталог

### `Work`

| Поле | Тип | Notes |
|------|-----|--------|
| id | uuid PK | |
| slug | string unique | |
| titleRu | string | канон для UI |
| titleOrig | string? | matching / поиск |
| subtitleRu | string? | |
| descriptionRu | string? | |
| yearFirst | int? | |
| status | enum | `DRAFT` \| `PUBLISHED` \| `MERGED` |
| needsContext | enum | `UNKNOWN` \| `YES` \| `NO` |
| mergedIntoId | uuid? FK Work | при merge |
| adminEditedAt | datetime? | импорт не затирает titleRu/descriptionRu если set |
| deletedAt | datetime? | |

Индексы: FTS (russian) по `titleRu`, `titleOrig`, `descriptionRu`; btree `(status, deletedAt)`.

### `Edition`

`workId`, `language` (ISO 639-1), `title?`, `translator?`, `publisher?`, `year?`, `isbn13?` unique, `isbn10?`.

### `Author`, `Series`, `Character`, `World`, `Place`

Паттерн: `slug`, `nameRu`, `nameOrig?`, `descriptionRu?`, `status` (DRAFT/PUBLISHED), `deletedAt`.

- `Place.worldId` → World (nullable).
- M2M: `WorkAuthor` (`role`, `position`), `WorkSeries` (`positionInSeries`), `WorkPlace`.

### `WorkRelation`

`fromWorkId`, `toWorkId`, `type` (`SEQUEL` \| `PREQUEL` \| `RELATED` \| `ADAPTATION`), `readingOrder` int?; unique `(fromWorkId, toWorkId, type)`.

### `CharacterAppearance` / `CharacterRelation`

Появление в книгах; связи персонажей (`type` + pair unique).

### `ExternalId`

`entityType` (`WORK` \| `AUTHOR` \| `EDITION`), `entityId`, `source` (`openlibrary`, `isbn`, `wikidata`, …), `externalKey`; unique `(source, externalKey)`.

## ContextReading

| Поле | Notes |
|------|--------|
| subjectWorkId / recommendedWorkId | FK Work |
| importanceRank | int, меньше = важнее |
| whyText | RU, кратко |
| status | `DRAFT` \| `PUBLISHED` \| `REJECTED` |
| sourceUrl, sourceSnippet, llmModel, llmRunId | только admin API |
| publishedAt | |

Partial unique: одна активная связь subject→recommended (кроме rejected).

## Рейтинги и подборки

- **Ranking:** `slug`, `titleRu`, `descriptionRu`, `theme`, `status`, `isAuto`, `isLocked?`, `publishedAt`.
- **RankingEntry:** `rankingId`, `workId`, `rank`; unique per ranking+work и ranking+rank.
- **Collection** / **CollectionEntry:** тематический список; `position?`, `blurbRu?`.
- **ExternalRankingSource:** `key` unique, `titleOrig`, `titleRu`, `url`, `language`, `weight` default 1, `fetchedAt`.
- **ExternalRankingEntry:** raw title/author/year/isbn, `workId?`, `matchStatus` (`MATCHED` \| `UNMATCHED` \| `IGNORED`), `rawPayload` json.
- **AggregatedScore:** `workId` + `themeKey`, `score`, `mentionCount`, `details` json; unique `(workId, themeKey)`.

## Пользователи и кабинет

### `User`

`email` unique, `passwordHash?`, `name`, `slug` unique, `role` (`USER` \| `ADMIN`), `isPremium` default false, `imageUrl?`, `deletedAt`.

Сессии/OAuth — таблицы Nest auth (sessions, accounts) по выбранной библиотеке; в схеме Prisma заложить вместе с User.

### `UserBook`

`userId`, `workId`, `editionId?`, `status` (`WANT` \| `READING` \| `READ` \| `ABANDONED`), `rating` 1–10?, `finishedAt` date?; unique `(userId, workId)`.

### `Note`

`type` (`NOTE` \| `QUOTE`), `body`, `visibility` (`PUBLIC` \| `PRIVATE`), `pageRef?`.

### `Shelf` / `ShelfItem`, теги на UserBook

Пользовательские полки; видны в публичной коллекции.

`Tag` (`userId`, `name`; unique `(userId, name)`) + `UserBookTag` (`userBookId`, `tagId`); теги публичны как коллекция (не `Note.visibility`).

### `reading_goals`

`userId`, `year` int, `targetCount` int; unique `(userId, year)`.  
`showOnProfile` boolean default false — прогресс цели на публичном профиле только если true.  
Прогресс: count `user_books` where status=`READ` и `finishedAt` в году (если `finishedAt` null — fallback даты перехода в READ).

## Очереди и аудит

### `MatchQueue`

`kind` (`RANKING_ENTRY` \| `CONTEXT_CANDIDATE` \| `IMPORT_ROW`), `payload` json, `status` (`OPEN` \| `RESOLVED` \| `DISMISSED`), `resolvedWorkId?`.

### `AuditLog`

`actorUserId`, `action`, `entityType`, `entityId`, `before`/`after` json?, `createdAt`.  
Обязательные actions: `WORK_MERGE`, `CONTEXT_UPDATE`, `CONTEXT_UNPUBLISH`, `RANKING_PUBLISH`, `RANKING_UNPUBLISH`, `COLLECTION_UPDATE`.

## Права на уровне запросов

| Данные | Guest | Owner | Admin |
|--------|-------|-------|-------|
| PUBLISHED catalog | R | R | RW |
| DRAFT / MERGED internals | — | — | RW |
| UserBook / shelves / ratings | R профиля | RW | R |
| notes PUBLIC | R на профиле | RW | R |
| notes PRIVATE | — | RW | — |
| source_*, llm_*, MatchQueue | — | — | RW |

## Миграции и seed

- Только Prisma Migrate.
- Seed: admin user + небольшой fixture-каталог для dev.
- Draft Prisma schema в коде — на этапе реализации; этот документ — канон до кода.

## Post-MVP (не делать сейчас)

- Таблица `work_titles` (locale) — миграция с бэкфиллом из `titleRu`/`titleOrig`.
- Смешение пользовательских оценок в «объективный» AggregatedScore.
