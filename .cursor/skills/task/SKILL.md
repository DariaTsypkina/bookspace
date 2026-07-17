---
name: task
description: >-
  Use /task or /задача to submit a human request (bug, enhancement, feature tweak).
  Classify epic and feature-doc, add to Beads plan, separate branch from develop.
  Bookspace human intake workflow.
disable-model-invocation: true
---

# /task — запрос от человека (Bookspace)

Использовать **только** при явном вызове `/task` или `/задача`.

Канон: [docs/tech/human-intake-workflow.md](../../docs/tech/human-intake-workflow.md).

## Ввод

Текст **после** `/task` или `/задача` в том же сообщении — описание задачи от человека.

Если описания нет — один короткий вопрос:

> Опишите задачу: что нужно сделать, где в продукте (экран/URL), для бага — шаги воспроизведения и ожидаемое поведение.

Не начинать классификацию и код без описания.

## Что делать (по порядку)

1. **Прочитать контекст:** `PROJECT-STATUS.md`, `docs/features/README.md`, при необходимости `bd list --status=open`.
2. **Классифицировать:** эпик (`bd`-id), feature-doc, тип (`bug` / `feature` / `task`).
3. **Если привязка неочевидна — стоп.** Сообщить человеку:
   - как понял запрос;
   - 2–3 варианта (эпик + feature-doc);
   - уточняющие вопросы.  
   Не создавать issue и не открывать ветку до ответа.
4. **Постановка в план:**
   ```bash
   bd create "…" --type=bug|feature|task --parent=<epic-id> \
     --description="…" --labels=human-reported
   ```
   Обновить `PROJECT-STATUS.md` (строка в фазе + «Последние действия»).
5. **Отчёт человеку** (шаблон):

   ```markdown
   ## Задача принята
   - **Тип:** bug | доработка
   - **Эпик:** … (`bd-…`)
   - **Feature-doc:** docs/features/….
   - **Issue:** `bd-…` — заголовок
   - **Ветка (когда начнём):** fix/bd-…/… или feature/bd-…/…

   Начать реализацию сейчас? (отдельная ветка от develop)
   ```

6. **Реализация** — только после явного «да» от человека:
   - `git checkout develop` → `git checkout -b fix/…` или `feature/…`
   - `bd update <id> --claim`
   - TDD по [agent-dev-flow.md](../../docs/tech/agent-dev-flow.md)

## Крупная новая цель

Если запрос — новый эпик (модуль целиком, новая фаза) — не сворачивать в одну task. Сказать человеку, что нужен epic-workflow ([feature-workflow.md](../../docs/tech/feature-workflow.md)), и предложить следующий шаг.

## Запреты

- Не писать prod-код до `bd create` и (при согласии) claim.
- Не коммитить в `develop` / `master`.
- Не угадывать эпик молча.
