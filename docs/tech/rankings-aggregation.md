# Агрегация рейтингов

Связано: [mvp-spec §7.3](../product/mvp-spec.md), [database-schema](database-schema.md), [import-pipeline](import-pipeline.md).

## Цель

Собрать публичные `Ranking` из многих `ExternalRankingSource`: импорт → matching на RU `Work` → score → автопубликация. Источники позиций пользователю в MVP не показываем.

## Решения этапа

- **Пользовательские оценки в «объективный» рейтинг MVP не входят** — только внешние списки.
- **Формула:** позиция во внешнем топе → очки; у источника есть `weight` (старт 1.0, правка в админке).

## Объекты

1. ExternalRankingSource — список + weight  
2. ExternalRankingEntry — сырая позиция  
3. AggregatedScore — скор книги в теме (`themeKey`)  
4. Ranking / RankingEntry — то, что видит пользователь  

## Стартовые источники (примеры)

Адаптеры подключаются по мере доступности; отсутствующий источник не ломает остальные.

| key | Примечание |
|-----|------------|
| `the-greatest-books` | агрегатор / списки |
| `modern-library-100` | Modern Library |
| `le-monde-100-century` | Le Monde |
| `guardian-100` | The Guardian |
| `amazon-editors` | только если легально доступен импорт |

Мнения исследователей/писателей — отдельные source с меньшим weight, если есть структурированный список.

## Импорт `rankings.import.source`

1. Adapter → список позиций.  
2. Normalize → match Work (как в import-pipeline).  
3. `matchStatus = MATCHED | UNMATCHED | IGNORED`.  
4. UNMATCHED → MatchQueue kind `RANKING_ENTRY`.

## Формула MVP

Для MATCHED книг в теме:

\[
score(work) = \sum_{s} w_s \cdot points(position_{s,work})
\]

- \(w_s\) = `ExternalRankingSource.weight` (default 1.0)
- при известной позиции: \(points(pos) = \max(0,\ P_{max} - pos + 1)\), \(P_{max}\) по умолчанию 100 (clamp по длине списка)
- unordered mention: фиксированные `mentionPoints` (напр. 10) × \(w_s\)

`AggregatedScore.details` jsonb хранит вклады по источникам (admin only).

## Автопубликация `rankings.aggregate.publish`

1. Выбрать `themeKey` и целевой Ranking (создать DRAFT если нет).  
2. Пересчитать AggregatedScore.  
3. Top-N → RankingEntry.rank (tie-break: mentionCount, затем titleRu).  
4. RU title/description рейтинга — шаблон или LLM; оригинал источника остаётся в admin.  
5. `PUBLISHED`, `isAuto=true`, AuditLog `RANKING_PUBLISH`.

Admin может править entries, unpublish; при `isLocked` автоpublish не перетирает ручные ranks (scores в фоне обновлять можно).

## Язык

UI: только `titleRu` / `descriptionRu` и `Work.titleRu`. Сырьё — admin.

## Наблюдаемость

`fetchedAt`, matched/unmatched counts; пересчёт идемпотентен при стабильном tie-break.
