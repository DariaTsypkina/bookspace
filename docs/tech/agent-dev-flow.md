# Процесс разработки для агентов (TDD + browser)

Связано: [feature-workflow](feature-workflow.md) (оркестрация эпик→план→ревью), [design](../superpowers/specs/2026-07-15-agent-dev-flow-design.md), [git-flow](../../.cursor/rules/git-flow-develop-master.mdc), [стек](stack-and-architecture.md).

## 1. Цель и аудитория

Единый обязательный процесс **TDD + browser** для Cursor-агентов и разработчиков: любая feature/fix-работа с изменением runtime-поведения закрывается тестами (сначала red) и проверкой UI там, где есть UI.

Этот документ — **источник правды по TDD-слоям, стенду и browser**.  
Порядок шагов эпика (brainstorm → plan → worktree → review → finish) и запрет пропуска — в **[feature-workflow.md](feature-workflow.md)**; rule `.cursor/rules/feature-workflow.mdc`.

Cursor rule `.cursor/rules/agent-dev-flow.mdc` дублирует только инварианты TDD и ссылается сюда.

§5 ниже выполняется **внутри** шага Implement из feature-workflow (после `bd update --claim`).

## 1.1 Политика subagent-per-feature (обязательная)

- Для **каждой фичи** обязателен формат `1 feature = 1 main subagent`.
- Фича в этом контексте: отдельный `bd`-issue, в котором есть runtime-изменения.
- Main subagent может поднимать дочерние subagents для внутренних подзадач, но внешняя ответственность за фичу остаётся у main subagent.
- Для каждой фичи обязательно фиксировать соответствие `feature (bd-id) -> main subagent`:
  - в процессной документации/правилах;
  - в артефактах выполнения (issue/PR шаблоны).
- Handoff по фиче считается неполным без трёх обязательных блоков:
  - список запущенных тестов/проверок;
  - результат по каждой проверке (pass/fail + краткий статус);
  - список изменённых файлов.

## 2. Инварианты TDD

- Сначала тест, который **падает** (нет реализации или поведение неверное).
- Затем минимальный prod-код, чтобы тест стал green.
- Рефакторинг — только на зелёных тестах.
- **Не писать и не менять prod-код** (`apps/**`, shared runtime) без предшествующего red-теста на это поведение. Исключений для кода нет.
- Правки только docs / `.cursor/rules` / skills **без** изменения runtime-кода тестами не требуют.

## 3. Слои тестов

| Слой                      | Где                                   | Кто гоняет              | На feature-ветку                       |
| ------------------------- | ------------------------------------- | ----------------------- | -------------------------------------- |
| Backend unit              | `apps/api`                            | агент                   | обязательно                            |
| Backend API / integration | `apps/api` (HTTP к Nest, тестовая БД) | агент                   | обязательно                            |
| Frontend unit             | `apps/web`                            | агент                   | обязательно при UI / логике FE         |
| Playwright smoke          | `apps/web/e2e/smoke/`                 | агент пишет и запускает | обязательно при UI                     |
| E2E web↔api               | `apps/web/e2e/` (сквозной набор)      | агент                   | обязательно                            |
| Ручной чеклист UI         | `apps/web/e2e/manual/<feature>.md`    | человек                 | агент **создаёт/обновляет**; не гоняет |

Смысл:

- **Smoke (Playwright):** 1–N быстрых happy-path проверок экранов фичи.
- **E2E:** сквозной сценарий web → api → БД (контракт и интеграция).
- **Ручной чеклист:** визуал, копирайт, edge UX — вне Playwright.

Держать smoke тонкими, e2e узкими. Flaky-тест — блокер push, пока не починен.

## 4. Локальный стенд

Перед Playwright и Cursor Browser:

1. Docker Compose: **только** Postgres + Redis (`docker compose up -d` для infra).
2. Локально: `api` и `web` в dev-режиме (не контейнеры — канон для разработки).
3. Миграции Prisma; seed/fixtures: тестовый user/admin и данные фичи.
4. `BASE_URL` (ориентир `http://localhost:3000`) и URL API.
5. Health: web → 200, api health ok.

UI-проверку **не начинать**, пока стенд не готов. Полный Compose с api/web в контейнерах допустим позже, но не канон для day-to-day разработки.

### Переменные окружения

- `.env.example` — шаблон для **локальной** разработки; коммитить в git можно (без реальных prod-секретов).
- `.env` — локальные значения; **не коммитить** (см. `.gitignore`).
- **Prod:** никогда не копировать `.env.example` в prod как есть — только как шаблон с **новыми** значениями (пароли БД, JWT/session secrets, OAuth, API keys и т.д.).
- E2E-креды и dev-пароли из example/seed — только для local/CI; в prod не переиспользовать.

## 5. Флоу фичи (вертикальный срез)

Вызывается **после** claim в [feature-workflow](feature-workflow.md) (шаг Implement). Не заменяет brainstorm/plan/ревью на уровне эпика.

1. `bd update <id> --claim`; ветка `feature/bd-<id>/<slug>` от `develop` (см. git-flow); worktree — по feature-workflow.
2. Red **backend unit** → код → green → commit.
3. Red **API/integration** → код → green → commit.
4. Если UI: red **FE unit** → код → green → commit.
5. Red **Playwright smoke** → UI/правки → green; **параллельно** exploratory в Cursor Browser по UI-срезам.
6. Red **e2e web↔api** → green → commit.
7. Создать/обновить `apps/web/e2e/manual/<feature>.md` для человека.
8. Перед push/PR: все тесты фичи green (без регрессии suite); финальный проход в Cursor Browser по smoke-сценариям и ключевым пунктам чеклиста.

Коммиты: Conventional Commits + bd-id. Тип `test:` — для коммитов только с тестами.

## 6. Browser

| Режим          | Инструмент               | Обязанность агента                                           |
| -------------- | ------------------------ | ------------------------------------------------------------ |
| Авто smoke     | Playwright               | написать, гонять, чинить flaky до green                      |
| Exploratory    | Cursor Browser           | итеративно при UI + финал перед push/PR на том же `BASE_URL` |
| Ручная приёмка | человек по `e2e/manual/` | только подготовить чеклист                                   |

Если Cursor Browser недоступен: явно сказать пользователю; DoD **не** считать выполненным без его ok или альтернативы (headed Playwright с тем же сценарием).

## 7. Gates

| Момент    | Требование                                                                                                                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commit    | Слой(и) коммита green. Не оставлять красные «на потом». Допустим парный `test:` (red) сразу перед коммитом реализации в том же срезе — без push красного состояния.                                                                           |
| Push / PR | Все обязательные слои фичи green; exploratory в браузере пройден; файл ручного чеклиста на месте; в PR/issue заполнено `feature -> main subagent` и handoff-блок (tests/results/files). Согласовано с git-flow: не пушить при красных тестах. |

## 8. Пути артефактов (ориентир)

```
apps/api/…                         # unit + API/integration (Jest/Nest — как в проекте)
apps/web/…                         # FE unit
apps/web/e2e/smoke/…               # Playwright smoke
apps/web/e2e/…                     # e2e web↔api (при scaffold можно выделить e2e/critical/)
apps/web/e2e/manual/<feature>.md   # ручной чеклист для человека
docker-compose.yml                 # postgres, redis (dev infra)
```

npm-скрипты (`test`, `test:e2e`, `test:smoke`) фиксируются при появлении `package.json` и при необходимости дополняются сюда отдельным docs-коммитом без смены процесса.

Пустые каталоги `apps/web/e2e/…` до появления web-app **не** создавать.

## 9. Связь с другими docs

- **Feature-workflow:** оркестрация эпик → brainstorm → plan → children → worktree → review → verify → finish → close epic; [PROJECT-STATUS.md](../../PROJECT-STATUS.md).
- **Feature-docs** (`docs/features/*`): продуктовые критерии приёмки. Не заменяют автотесты. Ручной чеклист — рядом с e2e, не в feature-doc.
- **Git-flow:** push только на зелёных; этот документ уточняет какие тесты и порядок TDD.
- **Beads:** claim → работа → close после merge; эпик закрывать только когда все дети закрыты.
- **Human intake:** доработки и баги от человека — [human-intake-workflow](human-intake-workflow.md) (классификация, план, ветка от `develop`).
- **Product mvp-spec:** процесс не расширяет MVP scope и не дублирует продуктовую спеку.
