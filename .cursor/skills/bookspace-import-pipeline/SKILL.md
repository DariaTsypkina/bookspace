---
name: bookspace-import-pipeline
description: >-
  Импорт каталога Bookspace (Open Library, Wikidata, ISBN upload, matching,
  MatchQueue). Use when working on catalog import or dedup.
---

# Импорт каталога

Прочитай: `docs/tech/import-pipeline.md`, `docs/tech/database-schema.md`, `docs/tech/admin.md`.

Чеклист: нормализация → ExternalId/ISBN → fuzzy пороги → queue/DRAFT → идемпотентность BullMQ → не затирать adminEdited titles → отчёт job.
