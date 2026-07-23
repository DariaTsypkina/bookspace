# PROJECT-STATUS

Живой дашборд Bookspace для владельца проекта.

**Канон обновлений:** [docs/tech/feature-workflow.md](docs/tech/feature-workflow.md) (раздел PROJECT-STATUS).  
**Легенда:** `✅` готово · `🔄` в работе · `⬜` готово к старту · `🔒` заблокировано предыдущей фазой

---

## Фазы

| # | Фаза | Статус | Прогресс | Эпик |
|---|------|--------|----------|------|
| 0 | Bootstrap (monorepo, docker, CI) | ✅ | — | — |
| 1 | Auth | ✅ | 6 / 6 | `bd-957` |
| 2 | Каталог | ✅ | 6 / 6 | `bd-6v0` |
| 3 | Связи и порядок | ⬜ | 0 / 4 | `bd-azl` |
| 4 | ContextReading | ✅ | 4 / 4 | `bd-8s4` |
| 5 | Библиотека и профиль | ⬜ | 0 / 5 | `bd-cq7` |
| 6 | Заметки и цель | 🔒 | 0 / 2 | `bd-sf4` |
| 7 | Рейтинги | ⬜ | 0 / 3 | `bd-es5` |
| 8 | Подборки | ⬜ | 0 / 3 | `bd-b75` |
| 9 | Рекомендации | 🔒 | 0 / 3 | `bd-ada` |
| 10 | Админка | ⬜ | 0 / 8 | `bd-i5b` |
| 11 | PWA и оболочка | 🔄 | 2 / 4 | `bd-6b7` |

---

## Задачи по фазам

### 0. Bootstrap — ✅

Сделано до Beads-задач: monorepo `apps/web` + `apps/api`, Docker Postgres/Redis, Prisma seed, quality gates, CI.

Доп. docs / infra (вне фаз продукта):

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-wus` | **Эпик DX: Tailwind + shadcn** (ADR 0003 accepted) — 18 / 18 |
| ✅ | `bd-ky6` | Chore: синхронизировать beads interactions.jsonl |
| ✅ | `bd-0e6` | Docs: согласование зависимостей агентом |
| ✅ | `bd-rtp` | Docs: human intake workflow и /task skill |
| ✅ | `bd-nvi` | Scaffold monorepo dev baseline |
| ✅ | `bd-384` | Session Completion: git push при конце сессии |
| ✅ | `bd-v3k` | Docs: протокол `bd close` на ветке задачи + merge в сборочную |

### DX — Tailwind + shadcn — ✅ · epic `bd-wus` · 18 / 18 · ADR [0003](docs/adr/0003-tailwind-shadcn.md) **accepted**

План: [migration-tailwind-shadcn.md](docs/tech/migration-tailwind-shadcn.md). F1–F2 ✅; N1 ✅; S1–S13 ✅; C1 ✅; корневой layout shell ✅. Эпик закрыт.

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-wus.1` | Foundation: Tailwind + design tokens |
| ✅ | `bd-wus.2` | Foundation: shadcn baseline + Lucide |
| ✅ | `bd-wus.3` | Миграция app-nav (tab-bar) |
| ✅ | `bd-wus.4` | Экран: Главная `/` |
| ✅ | `bd-wus.5` | Экран: Вход `/login` |
| ✅ | `bd-wus.6` | Экран: Регистрация `/register` |
| ✅ | `bd-wus.7` | Экран: Auth error `/auth/error` |
| ✅ | `bd-wus.8` | Экран: Поиск `/search` |
| ✅ | `bd-wus.9` | Экран: Книга `/books/[slug]` |
| ✅ | `bd-wus.10` | Экран: Автор `/authors/[slug]` |
| ✅ | `bd-wus.11` | Экран: Персонаж `/characters/[slug]` |
| ✅ | `bd-wus.12` | Экран: Мир `/worlds/[slug]` |
| ✅ | `bd-wus.13` | Экран: Локация `/places/[slug]` |
| ✅ | `bd-wus.14` | Экран: Профиль `/u/[slug]` |
| ✅ | `bd-wus.15` | Экран: Библиотека `/library` |
| ✅ | `bd-wus.16` | Экран: Admin Context `/admin/context` |
| ✅ | `bd-wus.17` | Конвенция: новый UI только на стеке |
| ✅ | `bd-wus.18` | Корневой layout: `.app-shell` / `.app-content` → Tailwind |

### 1. Auth — ✅ · epic `bd-957` · 6 / 6 (эпик закрыт)

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-8jk` | Auth: email и пароль |
| ✅ | `bd-957.1` | Auth: редирект с /login и /register → /u/[slug] |
| ✅ | `bd-957.2` | Auth: Google OAuth |
| ✅ | `bd-957.3` | Auth: Яндекс OAuth |
| ✅ | `bd-v2y` | Auth: сессия и защита маршрутов |
| ✅ | `bd-wlw` | Auth: rate limit на register/login |

### 2. Каталог — ✅ · epic `bd-6v0` · 6 / 6 (эпик закрыт)

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-6v0.1` | Каталог: Поиск по каталогу |
| ✅ | `bd-6v0.2` | Каталог: Карточка произведения |
| ✅ | `bd-6v0.3` | Каталог: Карточка автора |
| ✅ | `bd-6v0.4` | Каталог: Карточка персонажа |
| ✅ | `bd-6v0.5` | Каталог: Карточка мира |
| ✅ | `bd-6v0.6` | Каталог: Карточка локации |
| ✅ | `bd-6v0.9` | Поиск: восстановить FTS search_vector после drift Prisma |
| ⬜ | `bd-6v0.10` | Поиск: префикс `роул` не находит «Роулинг» (human-reported) |

### 3. Связи и порядок — ⬜ · epic `bd-azl` · 0 / 4

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-azl.1` | Связи: Карточка серии |
| ⬜ | `bd-azl.2` | Связи произведений |
| ⬜ | `bd-azl.3` | Связи: Порядок чтения |
| ⬜ | `bd-azl.4` | Связи: Spoiler gate |

### 4. ContextReading — ✅ · epic `bd-8s4` · 4 / 4 (эпик закрыт)

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-8s4.1` | ContextReading: Блок «Для понимания» (UI) |
| ✅ | `bd-8s4.2` | ContextReading: Классификация needsContext |
| ✅ | `bd-8s4.3` | ContextReading: Пайплайн extract ContextReading |
| ✅ | `bd-8s4.4` | ContextReading: Админка ContextReading |

### 5. Библиотека и профиль — ⬜ · epic `bd-cq7` · 0 / 5

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-cq7.1` | Библиотека: Статус и оценка книги |
| ⬜ | `bd-cq7.2` | Библиотека: Пользовательские полки |
| ⬜ | `bd-cq7.3` | Библиотека: Теги пользователя |
| ⬜ | `bd-cq7.4` | Библиотека: Моя библиотека |
| ⬜ | `bd-cq7.5` | Библиотека: Публичный профиль |

### 6. Заметки и цель — 🔒 · epic `bd-sf4` · 0 / 2

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-sf4.1` | Заметки и цитаты |
| ⬜ | `bd-sf4.2` | Заметки: Цель чтения на год |

### 7. Рейтинги — ⬜ · epic `bd-es5` · 0 / 3

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-es5.1` | Рейтинги: Публичные рейтинги (UI) |
| ⬜ | `bd-es5.2` | Рейтинги: Импорт внешних рейтингов |
| ⬜ | `bd-es5.3` | Рейтинги: Агрегация и автопубликация рейтингов |

### 8. Подборки — ⬜ · epic `bd-b75` · 0 / 3

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-b75.1` | Подборки: Публичные подборки (UI) |
| ⬜ | `bd-b75.2` | Подборки: Импорт источников для подборок |
| ⬜ | `bd-b75.3` | Подборки: Публикация подборки |

### 9. Рекомендации — 🔒 · epic `bd-ada` · 0 / 3

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-ada.1` | Рекомендации на карточке книги |
| ⬜ | `bd-ada.2` | Рекомендации на главной |
| ⬜ | `bd-ada.3` | Рекомендации: Эвристики рекомендаций |

### 10. Админка — ⬜ · epic `bd-i5b` · 0 / 8

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-i5b.1` | Админка: Админ-дашборд |
| ⬜ | `bd-i5b.2` | Админка: Админ CRUD каталога |
| ⬜ | `bd-i5b.3` | Админка: Merge дублей Work |
| ⬜ | `bd-i5b.4` | Админка: Админ UI импорта каталога |
| ⬜ | `bd-i5b.5` | Админка: Админ UI рейтингов |
| ⬜ | `bd-i5b.6` | Админка: Админ UI подборок |
| ⬜ | `bd-i5b.7` | Админка: Очередь не сматченного |
| ⬜ | `bd-i5b.8` | Админка: Журнал аудита |

### 11. PWA и оболочка — 🔄 · epic `bd-6b7` · 2 / 4

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-6b7.1` | PWA: установка |
| 🔄 | `bd-6b7.2` | PWA: offline shell |
| ⬜ | `bd-6b7.3` | PWA: App shell и tab-bar |
| ✅ | `bd-6b7.4` | UI: строка меню (Главная · Поиск · Профиль) — MVP-срез |

---

## Последние действия агента

| Дата | Действие |
|------|----------|
| 2026-07-23 | Оркестратор: claim `bd-6b7.2` (PWA offline shell); ветка `task/bd-6b7.2-pwa-offline-shell` |
| 2026-07-23 | `bd-6b7.1` closed: PWA manifest+icons 192/512+install helper; unit pwa 8/8 (suite 171); Playwright pwa-install 8/8 desktop+mobile; merge → `feat/bookspace-bd-6b7` |
| 2026-07-23 | `bd-6b7.1` close-prep: PWA manifest+icons 192/512+metadata/viewport; unit **171**; Playwright pwa-install **8/8** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); manual `e2e/manual/pwa-install.md` (iOS A2HS); ветка `task/bd-6b7.1-pwa-install`; `bd close` за оркестратором |
| 2026-07-23 | `bd-6b7.1` в работе: conventions (design/acceptance/notes/labels area:web+sec:pwa+mobile); TDD PWA manifest+icons+metadata; sync residual globals.css ← develop; ветка `task/bd-6b7.1-pwa-install` |
| 2026-07-23 | Оркестратор: batch `feat/bookspace-bd-6b7` — claim `bd-6b7.1` (PWA install); очередь `.1`→`.2`→`.3`; ветка `task/bd-6b7.1-pwa-install`; ЗАЛИВАТЬ develop=Нет |
| 2026-07-23 | `bd-v3k` closed: канон close — на ветке задачи → commit `.beads` → `--no-ff` в **сборочную** (+ `bd import` страховка); `develop` только §6; обновлены feature-workflow, git-flow, human-intake, agent-dev-flow, rules, skills |
| 2026-07-23 | Housekeeping: закрыт эпик `bd-8s4` ContextReading (4/4); дашборд синхронизирован с bd (`bd-wus.18`, `bd-6b7.4`, `bd-6v0.9`, `bd-ky6`/`bd-rtp`/`bd-nvi` → ✅; фазы 3/5/7/8/10 → ⬜) |
| 2026-07-23 | `/task`: создан `bd-6v0.10` — поиск-префикс `роул` → «Роулинг» (catalog-search, эпик `bd-6v0`) |
| 2026-07-23 | `bd-wus.18` close-prep: root layout → Tailwind (`flex min-h-full flex-1 flex-col` / `pb-[4.25rem] md:pb-0`); legacy `.app-shell`/`.app-content` removed; unit layout-shell 5/5 (suite **160**); Playwright app-nav+home **18/18** desktop+mobile (system Chrome); ветка `task/bd-wus.18-root-layout-tailwind`; `bd close` за оркестратором |
| 2026-07-23 | Claim `bd-wus.18`: корневой layout `.app-shell`/`.app-content` → Tailwind utilities; ветка `task/bd-wus.18-root-layout-tailwind` |
| 2026-07-23 | `/task`: создан `bd-wus.18` — корневой layout `.app-shell`/`.app-content` → Tailwind (хвост эпика `bd-wus`) |
| 2026-07-22 | `bd-wus.17` close-prep: C1 docs/rules — ADR 0003 accepted; `stack-and-architecture` § UI-конвенция + `stack.mdc`/`ui-ru.mdc` запрет legacy CSS для новых экранов; migration C1 ✅; Playwright home+foundation+baseline **18/18** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); docs-only scope; ветка `task/bd-wus.17-convention`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.17`: C1 конвенция docs/rules (ADR 0003 accepted, запрет legacy CSS для новых экранов); ветка `task/bd-wus.17-convention` |
| 2026-07-22 | `bd-wus.16` close-prep: `/admin/context` + panel → Tailwind+shadcn Card/Button/Input/Label; orphan `.admin-context-*` removed; unit admin-context-page 5/5 (suite **155**); Playwright admin-context **6/6** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.16-admin-context`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.16`: S13 `/admin/context` + panel → Tailwind+shadcn; admin-only/API без регрессии; ветка `task/bd-wus.16-admin-context` |
| 2026-07-22 | `bd-wus.15` close-prep: `/library` stub → Tailwind+shadcn Card; orphan `.library-stub` removed; unit library 5/5 (suite **150**); Playwright library-page **6/6** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.15-library`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.15`: S12 `/library` stub → Tailwind+shadcn Card; guest/user без регрессии; ветка `task/bd-wus.15-library` |
| 2026-07-22 | `bd-wus.14` close-prep: `/u/[slug]` + LogoutButton → Tailwind+shadcn Card/Button; orphan `.profile-stub`/`.logout-button` отсутствуют в globals (assert); unit profile 5/5 (suite **145**); Playwright profile+auth-redirect+auth-pages+session **18/18** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.14-profile`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.14`: S11 `/u/[slug]` + LogoutButton → Tailwind+shadcn; auth redirect UX без регрессии; ветка `task/bd-wus.14-profile` |
| 2026-07-22 | `bd-wus.13` close-prep: `/places/[slug]` + not-found → Tailwind+shadcn Card; orphan `.place-*` отсутствуют в globals (assert); unit places 6/6 (suite **140**); Playwright place-page **8/8** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.13-places`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.13`: S10 `/places/[slug]` + not-found → Tailwind+shadcn; ветка `task/bd-wus.13-places` |
| 2026-07-22 | `bd-wus.12` close-prep: `/worlds/[slug]` + not-found → Tailwind+shadcn Card; orphan `.world-*` отсутствуют в globals (assert); unit worlds 6/6 (suite **134**); Playwright world-page **8/8** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.12-worlds`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.12`: S9 `/worlds/[slug]` + not-found → Tailwind+shadcn; ветка `task/bd-wus.12-worlds` |
| 2026-07-22 | `bd-wus.11` close-prep: `/characters/[slug]` + SpoilerGate → Tailwind+shadcn Card/Button; orphan `.character-*`/`.spoiler-gate*` removed; unit characters+spoiler green; Playwright character-page **12/12** desktop+mobile; ветка `task/bd-wus.11-characters`; `bd close` за оркестратором |
| 2026-07-22 | `bd-wus.10` close-prep: `/authors/[slug]` + not-found → Tailwind+shadcn Card; orphan `.author-*` removed; unit authors 6/6 (suite **120**); Playwright author-page **8/8** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.10-authors`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.10`: S7 `/authors/[slug]` + not-found → Tailwind+shadcn; orphan `.author-*`; ветка `task/bd-wus.10-authors` |
| 2026-07-22 | `bd-wus.9` close-prep: `/books/[slug]` + WorkContextReadingSection → Tailwind+shadcn Card; orphan `.work-*`/`.edition-*` removed; SpoilerGate вне scope (S8); unit **114**; Playwright work+context+character (spoiler) **22/22** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.9-books`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.9`: S6 `/books/[slug]` + WorkContextReadingSection → Tailwind+shadcn; orphan `.work-*`/`.edition-*`; SpoilerGate вне scope (character S8); ветка `task/bd-wus.9-books` |
| 2026-07-22 | `bd-wus.7` close-prep: `/auth/error` → Tailwind+shadcn Card/Button; orphan shared `.auth-*` вычищены из globals; e2e alerts → `main [role=alert]`; unit **101**; Playwright auth-error+oauth smoke+auth-pages **16/16** desktop+mobile; ветка `task/bd-wus.7-auth-error`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.7`: conventions (design/acceptance/notes); TDD RED→GREEN миграция `/auth/error` + вычистка orphan `.auth-*` из globals; ветка `task/bd-wus.7-auth-error` |
| 2026-07-22 | `bd-wus.6` close-prep: `/register` → Tailwind+shadcn Card/Input/Label/Button; legacy classes сняты с экрана (shared `.auth-*` оставлены для `/auth/error`); e2e alerts → `main [role=alert]`; unit **96**; Playwright register+auth-pages+email **20/20** desktop+mobile; ветка `task/bd-wus.6-register`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.6`: conventions (design/acceptance/notes); TDD RED→GREEN миграция `/register`; ветка `task/bd-wus.6-register` |
| 2026-07-22 | `bd-wus.5` close-prep: `/login` → Tailwind+shadcn Card/Input/Label/Button; legacy classes сняты с экрана (shared `.auth-*` оставлены для register/error); unit **92**; Playwright login+auth-pages **12/12** desktop+mobile; ветка `task/bd-wus.5-login`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.5`: conventions (design/acceptance/notes/labels area:web+sec:ui+dx); TDD RED→GREEN миграция `/login`; ветка `task/bd-wus.5-login` |
| 2026-07-22 | `bd-wus.4` close-prep: `/` → Tailwind+shadcn Card; legacy `.home-page` removed; unit **88**; Playwright home (+foundation+baseline) **18/18** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.4-home`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.4`: conventions (design/acceptance/notes/labels area:web+sec:ui+dx); TDD RED→GREEN миграция `/`; ветка `task/bd-wus.4-home` |
| 2026-07-22 | `bd-wus.3` close-prep: app-nav → Tailwind+shadcn Button+Lucide; legacy `.app-nav*` removed; unit 83; Playwright app-nav **10/10** (desktop+mobile, PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.3-app-nav`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.3`: conventions (design/acceptance/notes/labels area:web+sec:ui+dx); TDD RED→GREEN миграция app-nav; ветка `task/bd-wus.3-app-nav` |
| 2026-07-22 | `bd-wus.8` close-prep: `/search` + catalog-search-form → Tailwind+shadcn; legacy `.search-*` removed; unit search 6/6; Playwright catalog-search **8/8** (desktop+mobile, PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.8-search`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.8`: S5 `/search` + catalog-search-form → Tailwind+shadcn; ветка `task/bd-wus.8-search` |
| 2026-07-22 | `bd-wus.2` close-prep: shadcn baseline (cn/cva + Button/Input/Label/Card + lucide); unit 78; build/lint ok; Playwright baseline+foundation **12/12** (desktop+mobile, PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.2-shadcn-baseline`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.2`: conventions (design/acceptance/notes/labels area:web+sec:ui+dx); TDD RED cn/Button + smoke; ветка `task/bd-wus.2-shadcn-baseline` |
| 2026-07-22 | `bd-wus.1` close-prep: Tailwind v3+PostCSS+tokens; unit 68; build/lint ok; Playwright foundation+auth-pages+app-nav **20/20** (desktop+mobile, PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-wus.1-tailwind-foundation`; `bd close` за оркестратором |
| 2026-07-22 | Claim `bd-wus.1`: conventions (design/acceptance/notes/labels area:web+sec:ui); TDD RED unit+smoke; ветка `task/bd-wus.1-tailwind-foundation` |
| 2026-07-22 | ADR 0003 **accepted**; обновлены `stack.mdc`, `ui-ru.mdc`, `stack-and-architecture.md`; эпик `bd-wus` готов к `bd-wus.1` |
| 2026-07-22 | Трек UI: правки docs/beads — убраны посторонние «out of scope» (не про UI); повторное согласование ADR 0003 + `bd-wus` |
| 2026-07-22 | Трек UI: ADR 0003 **proposed**, план `docs/tech/migration-tailwind-shadcn.md`, эпик `bd-wus` + 17 детей (foundation, nav, экраны) — на согласование человека; код не стартовать до accept |
| 2026-07-22 | `bd-6b7.4` close-prep: меню реализовано (unit 60, Playwright app-nav 8/8 desktop+mobile); коммиты `7213400`, `0eb74aa`; ветка `task/bd-6b7.4-nav-menu`; `bd close` за оркестратором |
| 2026-07-22 | `bd-6b7.4` в работе: conventions (design/acceptance/notes/labels), TDD app-nav (unit+Playwright), stub `/library`; ветка `task/bd-6b7.4-nav-menu` |
| 2026-07-22 | `/task`: создан `bd-6b7.4` — строка меню (вариант B: Главная · Поиск · Профиль; user → `/library`; admin вне меню) |
| 2026-07-22 | Claim `bd-6v0.9`: FTS search_vector drift (Prisma migrate удалил колонки) — guard-миграция + Unsupported в schema; ветка `fix/bd-6v0.9/restore-catalog-fts` |
| 2026-07-20 | Закрыты эпики `bd-957` Auth и `bd-6v0` Каталог после merge PR #11 (quality green) |
| 2026-07-20 | Sync `feat/bookspace-bd-8s4` ← `origin/develop`: merge conflicts resolved (schema, catalog, beads, PROJECT-STATUS) |
| 2026-07-20 | Закрыт `bd-8s4.1`: блок «Для понимания» на карточке произведения (public API client, WorkContextReadingSection, disclaimer, без source URL); web unit 43/43, Playwright context-reading 4/4 (chromium-desktop+mobile); ветка `task/bd-8s4.1-context-ui` |
| 2026-07-20 | Закрыт `bd-8s4.4`: админка ContextReading (Admin API recent/patch/unpublish/reject + AuditLog, `/admin/context`, BFF, public context-readings); api unit 6/6 + e2e 5/5, web unit 32/32, Playwright 6/6; ветка `task/bd-8s4.4-admin-context` (коммит 65ac14e) |
| 2026-07-20 | Реализация `bd-8s4.3`: extract pipeline (ContextReading+MatchQueue schema, whitelist→LLM→match→publish/queue, BullMQ jobs, admin POST extract, unit+e2e); ветка `task/bd-8s4.3-extract-pipeline` |
| 2026-07-20 | Закрыт `bd-8s4.2`: needsContext classify (Prisma enum, LlmProvider, admin patch/classify API, unit+e2e); ветка `task/bd-8s4.2-needs-classify` |
| 2026-07-20 | Закрыт `bd-957.4`: импорт ConfigService в AuthModule (регрессия bd-wlw); e2e rate-limit 3/3, Playwright 12/12; merge в сборочную |
| 2026-07-20 | Обнаружен `bd-957.4` (discovered-from bd-wlw): ConfigService import missing в auth.module.ts — ломает API e2e |
| 2026-07-20 | Закрыт `bd-wlw`: rate limit register/login (in-memory, 429); unit 9/9, e2e 23/23, Playwright 12/12; merge в `feat/bookspace-bd-957` |
| 2026-07-20 | Закрыт `bd-6v0.4`: GET /catalog/characters/:slug, /characters/[slug], SpoilerGate; ветка `task/bd-6v0.4-character-page` (коммиты dc26f7f, 3627ea8, 05ee22d) |
| 2026-07-20 | Claim/реализация `bd-6v0.1`: FTS-поиск каталога (API + /search UI, Playwright 8/8); ветка `task/bd-6v0.1-catalog-search` — `bd close` за оркестратором |
| 2026-07-20 | Claim/реализация `bd-957.3` Яндекс OAuth (Nest fetch, Account linking, OAUTH_TEST_MODE); ветка `task/bd-957.3-yandex-oauth` — `bd close` за оркестратором |
| 2026-07-20 | Реализация `bd-957.2` Google OAuth (Nest code flow без новых deps, Account, BFF Location, Playwright 16/16); ветка `task/bd-957.2-google-oauth` — `bd close` за оркестратором |
| 2026-07-20 | Claim/реализация `bd-v2y`: guards, logout, BFF, stub library; ветка `task/bd-v2y-auth-session-guards` |
| 2026-07-20 | Claim/реализация `bd-957.1`: редирект auth → `/u/[slug]` + stub профиля; ветка `task/bd-957.1-auth-redirect-profile` |
| 2026-07-20 | `bd-8jk`: доводка приёмки — bd conventions, Playwright chromium-desktop+mobile (12/12), unit/e2e green; `bd close` за оркестратором |
| 2026-07-20 | Claim `bd-ky6`, ветка `chore/bd-ky6/beads-interactions-sync`: sync interactions.jsonl |
| 2026-07-20 | Claim `bd-0e6`, ветка `feature/bd-0e6/dependency-approval`: rule согласования зависимостей |
| 2026-07-17 | `bd-aud`: автоэкспорт issues.jsonl + progress.json (скрипт, pre-commit) |
| 2026-07-17 | bd-conventions: канон перенесён в `.cursor/rules/bd-conventions.mdc` |
| 2026-07-17 | Включены bd-conventions: `validation.on-create/on-close=warn`, `create.require-description=true` |
| 2026-07-17 | Backlog: эпики + feature-задачи на все 45 feature-docs (OAuth в Auth; фазы 2–11); deps между эпиками по порядку фаз |
| 2026-07-17 | `bd-957.1`: уточнения — редирект `/login` и `/register` → `/u/[slug]` (заглушка); реализацию отложить |
| 2026-07-17 | `/task`: создан `bd-957.1` — редирект авторизованного с `/login` в профиль (эпик Auth) |
| 2026-07-17 | Claim `bd-rtp`, ветка `feature/bd-rtp/human-intake-workflow`: канон human-intake + skill `/task` |
| 2026-07-16 | Добавлен канон `docs/tech/feature-workflow.md`, rule DoD, `PROJECT-STATUS.md`; создан epic `bd-957` Auth, дети `bd-8jk` / `bd-v2y` / `bd-wlw` |
| 2026-07-16 | Push ветки `feature/bd-8jk/auth-email-password` (feat + lint fix) |
| 2026-07-16 | Code review fixes для `bd-8jk` (email normalize, P2002, soft-delete, timing) |
| 2026-07-16 | Реализация `bd-8jk` auth email/password (API + web + тесты) |
| 2026-07-16 | Claim `bd-8jk`, ветка feature; bootstrap monorepo уже на `develop` |
