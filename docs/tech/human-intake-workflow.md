# Запросы от человека (доработки, баги, уточнения)

Связано: [feature-workflow](feature-workflow.md) (эпик → plan), [agent-dev-flow](agent-dev-flow.md) (TDD), [git-flow](../../.cursor/rules/git-flow-develop-master.mdc), [PROJECT-STATUS.md](../../PROJECT-STATUS.md), [карта feature-docs](../features/README.md).

Человек описывает **что нужно сделать**. Агент **классифицирует** запрос, **ставит задачу в план** и **реализует в отдельной ветке** от `develop`. Без ясной привязки к эпику/фиче — **остановиться и уточнить у человека**.

**Быстрый ввод в чате:** `/task` или `/задача` + описание в том же сообщении (skill `.cursor/skills/task/SKILL.md`).

## Когда применяется

| Тип запроса | Пример | Тип issue в bd | Ветка |
|-------------|--------|----------------|-------|
| **Баг** (найден человеком) | «На странице работы не показывается рейтинг после обновления» | `bug` | `fix/bd-<id>/<slug>` |
| **Доработка** существующей фичи | «Добавить сортировку на полке» | `feature` или `task` | `feature/bd-<id>/<slug>` |
| **Расширение** в рамках эпика | «В auth ещё нужен сброс пароля» | `feature` | `feature/bd-<id>/<slug>` |
| **Новая крупная цель** | «Целиком модуль уведомлений» | `epic` + дети | см. [feature-workflow](feature-workflow.md) |

Если запрос — **новый эпик** (крупная цель вне текущих фаз), не подменяйте его одной task: пройдите полный epic-workflow (brainstorm → plan → children).

## Роли

- **Человек:** цель, контекст, для багов — шаги воспроизведения и ожидаемое поведение.
- **Агент:** классификация, постановка в Beads и `PROJECT-STATUS.md`, реализация по TDD, handoff.

## Обязательный порядок (скипать нельзя)

| # | Шаг | Действие |
|---|-----|----------|
| 1 | Приём | Зафиксировать описание человека (в issue `--description` / `--notes`) |
| 2 | Классификация | Определить эпик, feature-doc, тип (`bug` / `feature` / `task`) |
| 3 | Уточнение | Если привязка неочевидна — **стоп**, сообщить человеку (см. ниже) |
| 4 | Постановка в план | `bd create` + `--parent=<epic-id>`; обновить `PROJECT-STATUS.md` |
| 5 | Изоляция | Ветка от `develop`; worktree при нетривиальной работе |
| 6 | Реализация | `bd update --claim` → TDD → review → verify → finish → PR в `develop` |

Шаги 5–6 — тот же TDD и DoD, что в [agent-dev-flow](agent-dev-flow.md) и [feature-workflow §DoD](feature-workflow.md). Epic-level brainstorm/plan **не повторять**, если эпик уже существует и запрос — дочерняя доработка или баг.

## Шаг 2: Классификация

Перед `bd create` и до любого prod-кода агент обязан определить:

1. **Эпик** — фаза и `bd`-id из [PROJECT-STATUS.md](../../PROJECT-STATUS.md) или `bd list` / `bd show`.
2. **Feature-doc** — файл в `docs/features/` (карта: [features/README.md](../features/README.md)).
3. **Тип работы** — баг vs доработка vs новая capability в рамках эпика.
4. **Зависимости** — блокирует ли открытые задачи (`bd dep add` при необходимости).

Источники для сопоставления:

- `PROJECT-STATUS.md` — фазы, эпики, открытые задачи
- `docs/features/*.md` — продуктовый контекст и приёмка
- `docs/product/mvp-spec.md` — границы MVP
- `bd list --status=open` / `bd show <id>`

### Эвристики привязки

- UI/экран → feature-doc по экрану (`work-page`, `auth-session`, …) и фаза из карты features.
- API без явного экрана → feature-doc по домену (рейтинги, каталог, auth, …).
- Админка → `admin-*` feature-docs, фаза 10.
- Инфра/CI/docs без runtime → `chore` / `task`, эпик Bootstrap или отдельное согласование.
- Несколько фич затронуты → назвать **основную**; остальные — в `--notes` и deps.

## Шаг 3: Если неясно — уточнить у человека

**Не создавать issue, не открывать ветку, не писать код**, пока не ясно:

- к какому **эпику** относится работа;
- к какому **feature-doc** (или что doc нужно создать);
- это **баг** или **доработка**.

Сообщение человеку (шаблон):

1. **Как понял запрос** — 1–2 предложения своими словами.
2. **Варианты привязки** — 2–3 варианта с эпиком и feature-doc и кратким «почему».
3. **Вопросы** — что выбрать / чего не хватает в описании.

Пример:

> Похоже на доработку **Библиотеки** (эпик фазы 5, `user-shelves`) или баг в **Каталоге** (фаза 2, `work-page`), если рейтинг берётся с карточки работы. Уточните: на каком URL воспроизводится и относится ли это к полке или к странице произведения?

После ответа человека — шаг 4.

## Шаг 4: Постановка в план

```bash
# Баг
bd create "Краткий заголовок" \
  --type=bug \
  --parent=<epic-id> \
  --description="Описание от человека + шаги воспроизведения" \
  --labels="human-reported"

# Доработка
bd create "Краткий заголовок" \
  --type=feature \
  --parent=<epic-id> \
  --description="Цель и контекст от человека" \
  --acceptance="Критерии приёмки (можно из feature-doc + уточнения)"
```

Дополнительно:

- В `--notes` указать ссылку на feature-doc (`docs/features/….md`).
- При необходимости `bd dep add <новая> <блокер>`.
- Обновить [PROJECT-STATUS.md](../../PROJECT-STATUS.md): новая строка в таблице фазы + запись в «Последние действия».
- Если меняются продуктовые критерии — обновить соответствующий feature-doc (skill `bookspace-write-feature-doc`).

## Шаг 5: Отдельная ветка от develop

Каждый запрос — **отдельная задача и отдельная ветка**. Не коммитить в `develop` / `master` напрямую.

```bash
git checkout develop
git pull   # когда разрешено профилем
git checkout -b fix/bd-<id>/<slug>      # баг
# или
git checkout -b feature/bd-<id>/<slug>  # доработка
```

- Slug — короткий kebab-case на английском ([git-flow](../../.cursor/rules/git-flow-develop-master.mdc)).
- Нетривиальная работа — изолированный worktree (skill `superpowers:using-git-worktrees`).
- PR только в **`develop`**, merge commit (`--no-ff`).

## Шаг 6: Реализация и закрытие

1. `bd update <id> --claim`
2. Вертикальный TDD-срез — [agent-dev-flow §5](agent-dev-flow.md)
3. Review → verify → finish branch (superpowers skills)
4. Handoff: тесты / результаты / изменённые файлы
5. После merge и ok человека: `bd close <id>`

Политика **1 feature = 1 main subagent** сохраняется для runtime-изменений ([agent-dev-flow §1.1](agent-dev-flow.md)).

## Отличие от epic-workflow

| | Новый эпик | Запрос от человека (доработка/баг) |
|---|------------|-------------------------------------|
| Инициатор | план / агент по фазе | человек |
| Brainstorm эпика | обязателен | не нужен (эпик уже есть) |
| Writing-plans | на весь эпик | достаточно описания + acceptance в issue |
| `bd create` | epic + children | один child с `--parent` |
| Ветка | `feature/bd-<id>/…` | `feature/…` или `fix/…` от `develop` |

## Запреты

- Не начинать код без классификации и `bd create` (кроме чистого исследования для классификации).
- Не гадать эпик/feature-doc молча — при сомнении спросить человека.
- Не смешивать несколько несвязанных запросов в одной ветке/issue.
- Не пушить при красных тестах; не мержить в `develop` без PR.

## Context Loading

Run `bd prime` для операционных команд.  
Приём запросов от человека: этот файл + `PROJECT-STATUS.md` + карта [features/README.md](../features/README.md).
