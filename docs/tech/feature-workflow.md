# Feature workflow (оркестрация фич)

Связано: [agent-dev-flow](agent-dev-flow.md) (TDD + browser), [git-flow](../../.cursor/rules/git-flow-develop-master.mdc), [PROJECT-STATUS.md](../../PROJECT-STATUS.md).

Этот документ — **источник правды** по порядку шагов реализации крупной цели (эпик → план → задачи → код → ревью → finish).  
Cursor rule `.cursor/rules/feature-workflow.mdc` дублирует только DoD («скипать нельзя»).

**Запросы от человека** (доработки, найденные баги, уточнения фич) — отдельный канон: [human-intake-workflow](human-intake-workflow.md). Там: классификация по эпику/feature-doc, постановка в план, отдельная ветка от `develop`; при неясной привязке — уточнение у человека до кода.

TDD-детали (слои тестов, стенд, browser) — в [agent-dev-flow.md](agent-dev-flow.md). После `claim` выполнение идёт **вертикальный срез** из agent-dev-flow §5.

## Context Loading

Run `bd prime` to get complete workflow documentation in AI-optimized format.

`bd prime` is the single source of truth for operational commands and session workflow.

For detailed docs: see [AGENTS.md](../../AGENTS.md), this file, [agent-dev-flow.md](agent-dev-flow.md), or run `bd --help`.

## Гранулярность Beads

Валидация шаблонов и `bd lint`: [bd-conventions.md](bd-conventions.md) (`.beads/config.yaml`: `validation.on-create=warn`).

| Тип | Когда |
|-----|--------|
| **epic** | Крупная цель: Auth, Catalog, Library, Rankings… Контейнер intent + context. |
| **feature** / **task** | Дети эпика: одна реализуемая единица с runtime-изменениями (или docs-only task). |

Эпик **не** пишут в код напрямую. Работают только по детям (`bd ready` → claim).

Запросы от человека тоже становятся **детьми существующего эпика** (или запускают новый эпик, если цель крупная) — см. [human-intake-workflow](human-intake-workflow.md).

## Обязательный checklist (скипать нельзя)

Шаги **строго по порядку**. Пропуск шага = DoD не выполнен; нельзя считать фичу/эпик завершёнными и нельзя заявлять «готово» без evidence.

| # | Шаг | Действие |
|---|-----|----------|
| 1 | Epic | `bd create -t epic "Goal"` — контейнер intent + context |
| 2 | Brainstorm | **До кода:** skill `superpowers:brainstorming` (design before code) |
| 3 | Plan | Skill `superpowers:writing-plans` — план из задач на 2–5 мин каждая |
| 4 | Break down | `bd create` на каждую задачу + `bd dep add` / `--parent=<epic>` (parent-child, blocks) |
| 5 | Isolate | Skill `superpowers:using-git-worktrees` для нетривиальной работы |
| 6 | Implement | `bd ready` → pick → `bd update --claim` → TDD (RED → GREEN → REFACTOR) по [agent-dev-flow §5](agent-dev-flow.md) |
| 7 | Review | Skill `superpowers:requesting-code-review` |
| 8 | Fix review | Skill `superpowers:receiving-code-review` |
| 9 | Verify | Skill `superpowers:verification-before-completion` (evidence before claims) |
| 10 | Finish branch | Skill `superpowers:finishing-a-development-branch` |
| 11 | Close epic | Когда все дети закрыты: `bd close <epic-id> --reason="Done"` |

Параллельно с шагами 4–11: обновлять [PROJECT-STATUS.md](../../PROJECT-STATUS.md) (см. ниже).

### После claim → TDD (обёртка)

Шаг 6 **включает** вертикальный срез:

1. Red backend unit → green → commit  
2. Red API/integration → green → commit  
3. Если UI: red FE unit → green → commit  
4. Red Playwright smoke → green (+ exploratory browser)  
5. Red e2e web↔api → green → commit  
6. Manual checklist `apps/web/e2e/manual/<feature>.md`  
7. Gates push/PR из agent-dev-flow §7  

Политика **1 feature = 1 main subagent** и handoff (tests / results / files) — из agent-dev-flow §1.1.

### Worktree

- Для нетривиальной feature/fix: изолированный worktree (skill `using-git-worktrees`).  
- Ветка по-прежнему `feature/bd-<id>/<slug>` от `develop` ([git-flow](../../.cursor/rules/git-flow-develop-master.mdc)).  
- Docs-only / совсем мелкий hotfix по согласованию с владельцем можно без worktree — но шаги brainstorm/plan/review для runtime **не** отменяются.

## PROJECT-STATUS.md (обязательно)

Живой дашборд для владельца. Обновлять при **каждом** из событий:

1. **Задача взята** (`bd update --claim`) → в таблице: `⬜` → `🔄`  
2. **Задача завершена** (`bd close`) → `🔄` → `✅`, обновить счётчик фазы (`X / N задач`)  
3. **Фаза завершена** (все задачи ✅) → статус фазы `⬜`/`🔄` → `✅`; разблокированные фазы: `🔒` → `⬜`  
4. **Новая задача создана** → строка в таблице фазы с beads ID  
5. **Любое значимое действие** → строка в «Последние действия агента»

Формат «Последние действия» (новые строки **сверху**, историю не удалять):

```
| YYYY-MM-DD | Краткое описание что сделано |
```

## Definition of Done (агент)

Фича (дочерний issue) закрыта только если:

- [ ] Пройдены шаги checklist 2–10 для этой единицы работы (brainstorm/plan на уровне эпика; для follow-up task внутри уже спланированного эпика — не повторять epic/create, но TDD → review → verify → finish обязательны)
- [ ] Все обязательные тестовые слои green ([agent-dev-flow](agent-dev-flow.md))
- [ ] Handoff: tests / results / changed files
- [ ] `PROJECT-STATUS.md` обновлён
- [ ] Issue закрыт в bd после merge/принятия работы (по профилю: conservative — close после явного ok владельца)

Эпик закрыт только если:

- [ ] Все дети `✅` / closed  
- [ ] `bd close <epic-id> --reason="Done"`  
- [ ] Фаза в `PROJECT-STATUS.md` отмечена при необходимости  

**Запрещено:** пропускать brainstorm/plan до кода на новом эпике; писать prod-код без red-теста; заявлять «готово» без verification skill; закрывать эпик с открытыми детьми.
