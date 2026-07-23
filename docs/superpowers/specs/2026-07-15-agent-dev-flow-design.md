# Design: Agent development flow (TDD + browser)

Дата: 2026-07-15  
Статус: approved — внедрено  
Канон: [docs/tech/agent-dev-flow.md](../../tech/agent-dev-flow.md) + `.cursor/rules/agent-dev-flow.mdc` + ссылки в `AGENTS.md` / `docs/README.md`.

## Контекст

Нужны обязательные требования для агентов (и людей): как разрабатывать фичи в Bookspace — тесты первыми, слои автотестов, Playwright smoke, e2e, ручной чеклист, проверка в браузере. Репозиторий сейчас в основном документация; код (`apps/`, Compose) появится позже — спека должна быть исполнима с первого feature-PR.

## Решения (зафиксировано с заказчиком)

| Тема | Решение |
|------|---------|
| Канон | `docs/tech/agent-dev-flow.md` |
| Agent rule | короткое always-applied `.cursor/rules/agent-dev-flow.mdc` + ссылка на канон |
| Навигация | строка в `AGENTS.md`, пункт в `docs/README.md` |
| TDD | строго: падающие тесты → код → зелёные; **без красных тестов prod-код не писать**; исключений нет |
| Порядок слоёв | вертикальный срез (red→green по одному слою, затем следующий) |
| Слои на feature-ветку | backend unit + API/integration; frontend unit; Playwright smoke; e2e web↔api — **все обязательны** |
| UI «ручное» | не Playwright: чеклист для человека в `apps/web/e2e/manual/<feature>.md` |
| Браузер агента | Playwright smoke **и** exploratory в Cursor Browser |
| Когда browser | итеративно во время UI-работы + финальный проход перед push/PR |
| Стенд | Docker: Postgres + Redis; локально: `api` + `web` |
| Gates | перед коммитом — слой green; перед push/PR — все тесты фичи green + финальный browser |
| Rule vs doc | полный текст только в tech-doc; rule — инварианты |

## Не цели этого дизайна

- Выбор конкретных test-runner версий / конфигов CI (появятся с кодом; в каноне — принципы и пути).
- Переписывание критериев приёмки в `docs/features/*` (приёмка остаётся продуктовой; автотесты — отдельных артефактов).
- ADR по стеку тестов (пока не нужны; при смене инструментария — ADR).

## Артефакты для реализации

1. **`docs/tech/agent-dev-flow.md`** — канон (см. оглавление ниже).
2. **`.cursor/rules/agent-dev-flow.mdc`** — `alwaysApply: true`, ~15–25 строк.
3. **`AGENTS.md`** — пункт в «Источники правды» или отдельная секция «Процесс разработки».
4. **`docs/README.md`** — ссылка в разделе «Техника».

Опционально позже (вне минимального MVP этой задачи): обновить этап 8 чеклиста documentation/agent-setup одной строкой про TDD-флоу.

## Оглавление канона `docs/tech/agent-dev-flow.md`

1. Цель и аудитория (агенты Cursor + разработчики)
2. Инварианты TDD
3. Слои тестов и ответственность
4. Локальный стенд
5. Флоу фичи (вертикальный срез)
6. Browser: Playwright vs Cursor exploratory
7. Gates: commit / push / PR (связь с git-flow)
8. Пути артефактов
9. Связь с Beads, feature-docs, git-flow

### 1. Цель

Единый обязательный процесс: любая feature/fix-работа с изменением поведения закрывается тестами и проверкой UI там, где есть UI. Документ — источник правды; Cursor rule только дублирует запреты.

### 2. Инварианты TDD

- Сначала тест, который **падает** по текущему коду (или отсутствует реализации).
- Затем минимальный prod-код, чтобы тест стал green.
- Рефакторинг только на зелёных тестах.
- **Не писать и не менять prod-код** без предшествующего red-теста на это поведение.
- Чистые `docs`-only / правки правил без изменения runtime-кода не требуют тестов *при отсутствии code change*; любое изменение `apps/**` (и shared runtime) — только через TDD. *(Уточнение границ: см. §Self-review note ниже — заказчик выбрал «исключений нет» для code; docs-only не code.)*

### 3. Слои тестов

| Слой | Где | Кто гоняет | На feature-ветку |
|------|-----|------------|------------------|
| Backend unit | `apps/api` | агент | обязательно |
| Backend API / integration | `apps/api` (HTTP к Nest, тестовая БД) | агент | обязательно |
| Frontend unit | `apps/web` | агент | обязательно при UI/логике FE |
| Playwright smoke | `apps/web` e2e/smoke | агент пишет и запускает | обязательно при UI |
| E2E web↔api | отдельный e2e-набор (сквозной) | агент | обязательно на каждую feature-ветку |
| Ручной чеклист UI | `apps/web/e2e/manual/<feature>.md` | человек | агент обязан **создать/обновить** файл; не запускает |

Смысл слоёв:

- **Smoke (Playwright):** 1–N happy-path проверок экранов фичи (быстро, стабильно).
- **E2E:** сквозной сценарий web → api → БД (контракт и интеграция), тоже через браузер или API+UI по мере появления harness.
- **Ручной чеклист:** кейсы, которые плохо автоматизируются или нужен человеческий глаз (визуал, копирайт, edge UX); вне Playwright.

Пока `apps/` нет — при первой инициализации монорепо агент создаёт согласованную структуру путей из этого документа.

### 4. Локальный стенд

Перед Playwright и Cursor Browser:

1. `docker compose up -d` **только** Postgres + Redis (имена сервисов зафиксировать в Compose при появлении кода).
2. Локально запущены `api` и `web` (dev).
3. Миграции Prisma применены; seed/fixtures: как минимум тестовый user/admin и данные, нужные фиче.
4. Заданы `BASE_URL` (ориентир `http://localhost:3000`) и URL API.
5. Health: web отдаёт 200, api health ok.

Агент **не** начинает UI-проверку, пока стенд не готов. Полный Compose (api/web в контейнерах) — допустим позже, но **не** канон для разработки.

### 5. Флоу фичи (вертикальный срез)

1. `bd update <id> --claim`; ветка `feature/bd-<id>/<slug>` от `develop` (см. git-flow rule).
2. Red **backend unit** → код → green → commit.
3. Red **API/integration** → код → green → commit.
4. Если UI: red **FE unit** → код → green → commit.
5. Red **Playwright smoke** → реализация/правки UI → green; **параллельно** exploratory в Cursor Browser по UI-срезам.
6. Red **e2e web↔api** → green → commit.
7. Создать/обновить **`apps/web/e2e/manual/<feature>.md`** для человека.
8. Перед push/PR: все тесты, относящиеся к фиче (и не ломающие регрессию suite), green; финальный browser-проход по smoke-сценариям + ключевым пунктам чеклиста глазами агента в Cursor Browser.

Коммиты — Conventional Commits + bd-id (git-flow). Тип `test:` допустим для коммитов только с тестами.

### 6. Browser

| Режим | Инструмент | Обязанность агента |
|-------|------------|-------------------|
| Авто smoke | Playwright | написать, гонять, чинить flaky до green |
| Exploratory | Cursor Browser | итеративно при UI + финал перед push/PR против того же `BASE_URL` |
| Ручная приёмка | человек по `e2e/manual/` | агент только готовит чеклист |

### 7. Gates

| Момент | Требование |
|--------|------------|
| Commit | Слой(и), затронутые коммитом, green. Не коммитить красные тесты «на потом», кроме одного осмысленного red-only коммита типа `test:` **сразу перед** коммитом реализации в том же срезе (предпочтительно red+green в парных коммитах без push красного состояния). |
| Push / PR | Все обязательные слои фичи green; exploratory в браузере пройден; ручной чеклист-файл на месте. Согласовано с git-flow: «не пушить, пока тесты красные». |

### 8. Пути (ориентир)

```
apps/api/…                    # unit + API/integration tests (стек — Jest/Nest как в проекте)
apps/web/…                    # FE unit
apps/web/e2e/smoke/…          # Playwright smoke
apps/web/e2e/…                # e2e web↔api (или apps/web/e2e/critical/ — уточнить при scaffold)
apps/web/e2e/manual/<feature>.md
docker-compose.yml            # postgres, redis (dev infra)
```

Точные npm-скрипты (`test`, `test:e2e`, `test:smoke`) фиксируются при появлении package.json и могут быть добавлены в канон отдельным маленьким PR без смены процесса.

### 9. Связь с другими docs

- **Feature-docs** (`docs/features/*`): критерии приёмки (продукт). Не заменяют автотесты. Ручной чеклист живёт рядом с e2e, не в feature-doc.
- **Git-flow rule:** push только на зелёных тестах; этот документ уточняет *какие* тесты и TDD-порядок.
- **Beads:** claim → работа (сабагент) → handoff → оркестратор: `bd close` на ветке задачи → merge `--no-ff` в сборочную (+ `bd import`); `develop` только в финале эпика.
- **Product mvp-spec:** не дублировать процесс; процесс не расширяет MVP scope.

## Содержимое `.cursor/rules/agent-dev-flow.mdc` (черновик смысла)

- Always apply.
- Prod-код (`apps/**` и runtime shared) только после red-теста на поведение.
- На feature: unit be, API, unit fe (если UI), Playwright smoke, e2e — обязательны; manual checklist файл создать.
- Стенд: Docker Postgres+Redis, local api+web; UI-check только после health.
- Перед push/PR: всё green + Cursor Browser exploratory.
- Полный текст: `docs/tech/agent-dev-flow.md`.

## Риски и смягчение

| Риск | Смягчение |
|------|-----------|
| «E2E на каждую фичу» дорого/медленно | Держать e2e узкими; smoke тонкие; flaky = блокер push |
| Нет кода/Docker сейчас | Документ описывает целевое состояние; пути — ориентир до scaffold |
| Строгий TDD vs docs-only правки | Docs/rules без runtime — вне TDD; любое поведение apps — TDD |
| Cursor Browser недоступен в среде | Зафиксировать в каноне: если browser tool недоступен — явно сообщить пользователю и не считать DoD выполненным без его ok / альтернативного headed Playwright |

## План внедрения (после approval этого design)

1. Добавить `docs/tech/agent-dev-flow.md` по этому дизайну.
2. Добавить `.cursor/rules/agent-dev-flow.mdc`.
3. Обновить `AGENTS.md` и `docs/README.md`.
4. (Опционально) Строка в чеклисте этап 8.
5. Не создавать empty `apps/web/e2e/...` до появления web-app — только описать пути.

## Self-review

- [x] Нет TBD/placeholder без пометки «ориентир».
- [x] Нет противоречия «smoke не e2e» vs «оба на каждую ветку» — оба обязательны, разный смысл.
- [x] Согласовано с git-flow (зелёные перед push).
- [x] Граница docs-only vs code явно в §2 (заказчик: no exceptions для кода).
- [x] Scope не расползается в CI/вендоров.
