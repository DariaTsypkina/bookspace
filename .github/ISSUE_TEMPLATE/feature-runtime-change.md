---
name: Feature (runtime change)
about: Feature issue с обязательным main subagent и handoff-полями
title: 'feat: bd-<id> <краткий заголовок>'
labels: ['feature']
assignees: []
---

## Контекст

<!-- Описание фичи и бизнес-цель -->

## Feature -> Main Subagent (обязательно)

- `bd-id`: <!-- bd-123 -->
- `main subagent`: <!-- id/название -->
- `child subagents` (опционально): <!-- через запятую -->

## Критерии готовности

- [ ] Runtime-изменения закрыты тестами по `docs/tech/agent-dev-flow.md`
- [ ] Для UI есть smoke/e2e/ручной чеклист (если применимо)

## Handoff completeness (обязательно)

### Tests / checks run

- [ ] `...`
- [ ] `...`

### Results

- `...`: PASS/FAIL, краткий комментарий

### Changed files

- `path/to/file`
