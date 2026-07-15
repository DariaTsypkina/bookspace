# Процесс разработки для агентов (TDD + browser)

Связано: [design](../superpowers/specs/2026-07-15-agent-dev-flow-design.md), [git-flow](../../.cursor/rules/git-flow-develop-master.mdc), [стек](stack-and-architecture.md).

## 1. Цель и аудитория

Единый обязательный процесс для Cursor-агентов и разработчиков: любая feature/fix-работа с изменением runtime-поведения закрывается тестами (сначала red) и проверкой UI там, где есть UI.

Этот документ — **источник правды**. Cursor rule `.cursor/rules/agent-dev-flow.mdc` дублирует только инварианты и ссылается сюда.

Пока нет `apps/` и Compose — документ описывает целевое состояние; при scaffold агент создаёт пути из §8.

## 2. Инварианты TDD

- Сначала тест, который **падает** (нет реализации или поведение неверное).
- Затем минимальный prod-код, чтобы тест стал green.
- Рефакторинг — только на зелёных тестах.
- **Не писать и не менять prod-код** (`apps/**`, shared runtime) без предшествующего red-теста на это поведение. Исключений для кода нет.
- Правки только docs / `.cursor/rules` / skills **без** изменения runtime-кода тестами не требуют.

## 3. Слои тестов

| Слой | Где | Кто гоняет | На feature-ветку |
|------|-----|------------|------------------|
| Backend unit | `apps/api` | агент | обязательно |
| Backend API / integration | `apps/api` (HTTP к Nest, тестовая БД) | агент | обязательно |
| Frontend unit | `apps/web` | агент | обязательно при UI / логике FE |
| Playwright smoke | `apps/web/e2e/smoke/` | агент пишет и запускает | обязательно при UI |
| E2E web↔api | `apps/web/e2e/` (сквозной набор) | агент | обязательно |
| Ручной чеклист UI | `apps/web/e2e/manual/<feature>.md` | человек | агент **создаёт/обновляет**; не гоняет |

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

## 5. Флоу фичи (вертикальный срез)

1. `bd update <id> --claim`; ветка `feature/bd-<id>/<slug>` от `develop` (см. git-flow).
2. Red **backend unit** → код → green → commit.
3. Red **API/integration** → код → green → commit.
4. Если UI: red **FE unit** → код → green → commit.
5. Red **Playwright smoke** → UI/правки → green; **параллельно** exploratory в Cursor Browser по UI-срезам.
6. Red **e2e web↔api** → green → commit.
7. Создать/обновить `apps/web/e2e/manual/<feature>.md` для человека.
8. Перед push/PR: все тесты фичи green (без регрессии suite); финальный проход в Cursor Browser по smoke-сценариям и ключевым пунктам чеклиста.

Коммиты: Conventional Commits + bd-id. Тип `test:` — для коммитов только с тестами.

## 6. Browser

| Режим | Инструмент | Обязанность агента |
|-------|------------|-------------------|
| Авто smoke | Playwright | написать, гонять, чинить flaky до green |
| Exploratory | Cursor Browser | итеративно при UI + финал перед push/PR на том же `BASE_URL` |
| Ручная приёмка | человек по `e2e/manual/` | только подготовить чеклист |

Если Cursor Browser недоступен: явно сказать пользователю; DoD **не** считать выполненным без его ok или альтернативы (headed Playwright с тем же сценарием).

## 7. Gates

| Момент | Требование |
|--------|------------|
| Commit | Слой(и) коммита green. Не оставлять красные «на потом». Допустим парный `test:` (red) сразу перед коммитом реализации в том же срезе — без push красного состояния. |
| Push / PR | Все обязательные слои фичи green; exploratory в браузере пройден; файл ручного чеклиста на месте. Согласовано с git-flow: не пушить при красных тестах. |

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

- **Feature-docs** (`docs/features/*`): продуктовые критерии приёмки. Не заменяют автотесты. Ручной чеклист — рядом с e2e, не в feature-doc.
- **Git-flow:** push только на зелёных; этот документ уточняет какие тесты и порядок TDD.
- **Beads:** claim → работа → close после merge.
- **Product mvp-spec:** процесс не расширяет MVP scope и не дублирует продуктовую спеку.
