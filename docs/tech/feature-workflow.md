# Feature workflow (оркестрация фич)

Связано: [agent-dev-flow](agent-dev-flow.md) (TDD + browser), [git-flow](../../.cursor/rules/git-flow-develop-master.mdc), [PROJECT-STATUS.md](../../PROJECT-STATUS.md).

Этот документ — **источник правды** по порядку шагов реализации крупной цели (эпик → план → задачи → код → ревью → close → сборочная → `develop`).  
Cursor rule `.cursor/rules/feature-workflow.mdc` дублирует только DoD («скипать нельзя»).

**Запросы от человека** (доработки, найденные баги, уточнения фич) — отдельный канон: [human-intake-workflow](human-intake-workflow.md). Там: классификация по эпику/feature-doc, постановка в план, ветка задачи от **сборочной**; при неясной привязке — уточнение у человека до кода.

TDD-детали (слои тестов, стенд, browser) — в [agent-dev-flow.md](agent-dev-flow.md). После `claim` код идёт **вертикальный срез** из agent-dev-flow §5.

## Context Loading

Run `bd prime` to get complete workflow documentation in AI-optimized format.

`bd prime` is the single source of truth for operational commands and session workflow.

For detailed docs: see [AGENTS.md](../../AGENTS.md), this file, [agent-dev-flow.md](agent-dev-flow.md), or run `bd --help`.

## Гранулярность Beads

Валидация шаблонов и `bd lint`: [.cursor/rules/bd-conventions.mdc](../../.cursor/rules/bd-conventions.mdc) (`.beads/config.yaml`: `validation.on-create=warn`).

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
| 5 | Isolate | Skill `superpowers:using-git-worktrees` для нетривиальной работы; сборочная `feat/bookspace-bd-<epic>`, задачи `task/bd-<id>-<slug>` |
| 6 | Implement | `bd ready` → pick → `bd update --claim` → TDD (RED → GREEN → REFACTOR) по [agent-dev-flow §5](agent-dev-flow.md) |
| 7 | Review | Skill `superpowers:requesting-code-review` |
| 8 | Fix review | Skill `superpowers:receiving-code-review` |
| 9 | Verify | Skill `superpowers:verification-before-completion` (evidence before claims) |
| 10 | Close + merge в сборочную | **Оркестратор** после handoff: протокол [§ Close + merge в сборочную](#close--merge-в-сборочную) (не в `develop`) |
| 11 | Close epic | Когда все дети closed на сборочной: `bd close <epic-id> --reason="Done"` на сборочной + commit `.beads` |
| 12 | Сборочная → develop | [§6 Финал: сборочная → develop](#6-финал-сборочная--develop) |

Параллельно с шагами 4–12: обновлять [PROJECT-STATUS.md](../../PROJECT-STATUS.md) (см. ниже).

### После claim → TDD (обёртка)

Шаг 6 **включает** вертикальный срез:

1. Red backend unit → green → commit  
2. Red API/integration → green → commit  
3. Если UI: red FE unit → green → commit  
4. Red Playwright smoke → green (+ exploratory browser)  
5. Red e2e web↔api → green → commit  
6. Manual checklist `apps/web/e2e/manual/<feature>.md`  
7. Gates из agent-dev-flow §7 (на ветке задачи; push — по профилю)

Политика **1 feature = 1 main subagent** и handoff (tests / results / files) — из agent-dev-flow §1.1.

### Ветки эпика (сборочная)

| Ветка | Назначение |
|-------|------------|
| `feat/bookspace-bd-<epic-id>` | **Сборочная** эпика (от `develop`). Сюда `--no-ff` merge веток задач. |
| `task/bd-<id>-<slug>` | Ветка **одной** задачи (от сборочной). Здесь код и `bd close`. |
| `develop` | Только в [§6](#6-финал-сборочная--develop). Задачи **не** мержатся в `develop` напрямую. |

### Worktree

- Для нетривиальной task: изолированный worktree (skill `using-git-worktrees`).  
- Ветка задачи: `task/bd-<id>-<slug>` от **сборочной** эпика.  
- Docs-only / совсем мелкий hotfix по согласованию с владельцем можно без worktree — но шаги brainstorm/plan/review для runtime **не** отменяются; close всё равно по протоколу ниже.

## PROJECT-STATUS.md (обязательно)

Живой дашборд для владельца. Обновлять при **каждом** из событий:

1. **Задача взята** (`bd update --claim`) → в таблице: `⬜` → `🔄`  
2. **Задача завершена** (`bd close` на ветке задачи) → `🔄` → `✅`, обновить счётчик фазы (`X / N задач`)  
3. **Фаза завершена** (все задачи ✅) → статус фазы `⬜`/`🔄` → `✅`; разблокированные фазы: `🔒` → `⬜`  
4. **Новая задача создана** → строка в таблице фазы с beads ID  
5. **Любое значимое действие** → строка в «Последние действия агента»

Формат «Последние действия» (новые строки **сверху**, историю не удалять):

```
| YYYY-MM-DD | Краткое описание что сделано |
```

## Close + merge в сборочную

**Идея:** задачу **закрываем в Beads на её ветке** (где решалась) и кладём закрытие под git; мёрж ветки задачи в **сборочную** приносит и код, и закрытие. **`develop` здесь не участвует** — он только в [§6](#6-финал-сборочная--develop).

### Кто выполняет

| Роль | Действие |
|------|----------|
| **Main feature / implementing subagent** | TDD на `task/bd-<id>-…`; handoff (tests / results / files). **`bd close` запрещён.** |
| **Оркестратор** | После приёмки handoff — **весь** протокол 1–8 ниже на ветке задачи → сборочная. |

Порядок и страховка от Dolt-переоткрытия **обязательны**. Пропуск шага = DoD не выполнен.

### Протокол (строго)

Находясь на ветке задачи `task/bd-<id>-…` (checkout / worktree задачи):

1. **`bd close <id> --reason "<итог + доказательства>"`**  
   В reason: кратко что сделано + evidence (тесты green, ключевые коммиты). Обновить `PROJECT-STATUS` → `✅` + строка в «Последние действия». При необходимости: `pnpm run bd:export && pnpm run bd:progress`.
2. **`bd show <id>`** — убедиться, что на этой ветке issue реально **closed**.
3. **`git add .beads PROJECT-STATUS.md && git commit`** — фиксируем закрытие в коммите ветки задачи.  
   Без этого коммита `checkout` ниже часто падает: `local changes would be overwritten`.  
   Сообщение вида: `chore: bd-<id> close + dashboard`.
4. **`git checkout <сборочная>`** — например `feat/bookspace-bd-<epic-id>`.
5. **`git merge --no-ff task/bd-<id>-…`** — слияние приносит код и закрытие в сборочную.  
   **`--no-ff` обязателен**; fast-forward, скрывающий работу в ветке, **запрещён**.
6. **Страховка от ложного переоткрытия (обязательно):** после checkout/merge Dolt мог ре-импортировать старый JSONL и переоткрыть задачу. Выполнить:
   ```bash
   bd import .beads/issues.jsonl
   bd show <id>
   ```
   - **closed** → дальше;  
   - всё ещё **open** → повторить `bd import .beads/issues.jsonl`; не помогло → `bd close <id> --reason "<то же>"` уже **на сборочной**.  
   Не двигаться дальше, пока `bd show <id>` не покажет **closed**.
7. **`git add .beads && git commit`** — если import / повторный close изменили `.beads` (и при необходимости `PROJECT-STATUS.md`).
8. Удалить ветку задачи (`git branch -D task/bd-<id>-…`), убрать worktree.

Без шагов 1–7 оркестратор **не** пишет «готово» / «задача закрыта».

### Запреты (close)

- Мёржить ветку задачи **напрямую в `develop`**.
- `bd close` implementing-сабагентом.
- Fast-forward merge задачи в сборочную.
- Считать задачу закрытой, если `bd show` на сборочной после merge показывает open (не пройдена страховка шага 6 протокола).
- Забывать commit `.beads` на ветке задачи до checkout сборочной.

## 6. Финал: сборочная → develop

`develop` трогается **только здесь**, когда все дети эпика closed и слиты в сборочную (и эпик при необходимости закрыт на сборочной).

1. На сборочной: quality gates green (тесты эпика / регрессия по согласованию).
2. Push сборочной → **PR сборочная → `develop`** (merge commit `--no-ff`; не squash).
3. После merge PR: при необходимости sync / housekeeping `.beads` на `develop`; `bd dolt push` — по профилю / явной просьбе.
4. Не пушить в `develop`/`master` напрямую; не мержить `develop` локально мимо PR.

Одиночная задача вне эпика: либо завести мини-сборочную / работать как child существующего эпика, либо по явному ok владельца — тот же протокол close на ветке + merge в согласованную целевую ветку, **не** skip Dolt-страховки. `develop` — всё равно только через PR в финале.

## Definition of Done (агент)

Фича (дочерний issue) закрыта только если:

- [ ] Пройдены шаги checklist (brainstorm/plan на уровне эпика; для follow-up внутри эпика — TDD → review → verify)
- [ ] Все обязательные тестовые слои green ([agent-dev-flow](agent-dev-flow.md))
- [ ] Handoff сабагента: tests / results / changed files
- [ ] **Оркестратор** выполнил протокол [Close + merge в сборочную](#close--merge-в-сборочную) (1–8); `bd show <id>` на сборочной = **closed**
- [ ] `PROJECT-STATUS.md` → `✅`

Эпик закрыт только если:

- [ ] Все дети `✅` / closed на сборочной  
- [ ] Оркестратор: `bd close <epic-id> --reason="Done"` (+ commit `.beads` на сборочной)  
- [ ] Фаза в `PROJECT-STATUS.md` отмечена при необходимости  
- [ ] Финал [§6](#6-финал-сборочная--develop) (сборочная → `develop`) выполнен или явно отложен владельцем  

**Запрещено:** пропускать brainstorm/plan до кода на новом эпике; писать prod-код без red-теста; заявлять «готово» без verification и без протокола close→сборочная; implementing-сабагенту вызывать `bd close`; мержить задачу в `develop`; закрывать эпик с открытыми детьми.
