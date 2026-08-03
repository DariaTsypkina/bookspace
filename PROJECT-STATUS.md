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
| 11 | PWA и оболочка | ✅ | 4 / 4 | `bd-6b7` |

---

## Задачи по фазам

### 0. Bootstrap — ✅

Сделано до Beads-задач: monorepo `apps/web` + `apps/api`, Docker Postgres/Redis, Prisma seed, quality gates, CI.

Доп. docs / infra (вне фаз продукта):

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-wus` | **Эпик DX: Tailwind + shadcn** (ADR 0003 accepted) — 18 / 18 |
| ✅ | `bd-0t0` | **Эпик DX: RHF + Zod full contour** (ADR 0004 accepted) — 11 / 11 + bug .12 |
| ✅ | `bd-707` | **Эпик DX: axios HTTP-клиент** (ADR 0005 accepted) — 10 / 10 · сборочная `feat/bookspace-bd-707` (не влита в develop) |
| ✅ | `bd-ky6` | Chore: синхронизировать beads interactions.jsonl |
| ✅ | `bd-0e6` | Docs: согласование зависимостей агентом |
| ✅ | `bd-rtp` | Docs: human intake workflow и /task skill |
| ✅ | `bd-nvi` | Scaffold monorepo dev baseline |
| ✅ | `bd-384` | Session Completion: git push при конце сессии |
| ✅ | `bd-v3k` | Docs: протокол `bd close` на ветке задачи + merge в сборочную |
| ✅ | `bd-82j` | UI: Google Fonts Roboto на весь UI (400/500/700) — DX · сборочная `feat/bookspace-bd-82j` |
| ✅ | `bd-23j` | UI: Baskerville (woff2, кириллица) на весь UI — DX · сборочная `feat/bookspace-bd-23j` |
| ✅ | `bd-p3l` | [bug] UI: Baskerville не на кнопках/инпутах — DX · сборочная `feat/bookspace-bd-bugs` |
| ✅ | `bd-v3x` | [bug] web: work-page-context-reading.integration stubs fetch (axios) — DX · сборочная `feat/bookspace-bd-bugs` |
| 🔄 | `bd-jtw` | [bug] web: spoiler-gate setState-in-effect lint (react-hooks) — DX · сборочная `feat/bookspace-bd-bugs` · ветка `task/bd-jtw-spoiler-gate-setstate-lint` · discovered-from `bd-azl.5` |

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

### DX — RHF + Zod full contour — ✅ · epic `bd-0t0` · 11 / 11 · ADR [0004](docs/adr/0004-rhf-zod-full-contour.md) **accepted**

План: [migration-rhf-zod.md](docs/tech/migration-rhf-zod.md). Цель: единый контур валидации и форм (shared schemas + RHF + nestjs-zod) и итоговый отказ от `class-validator` в runtime.

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-0t0.1` | RHF/Zod foundation: packages/schemas + naming |
| ✅ | `bd-0t0.2` | RHF/Zod foundation: web form pattern on shadcn Form |
| ✅ | `bd-0t0.3` | RHF/Zod foundation: api validation pipe + OpenAPI |
| ✅ | `bd-0t0.4` | Wave 1: миграция login/register end-to-end |
| ✅ | `bd-0t0.5` | Wave 1: миграция catalog search end-to-end |
| ✅ | `bd-0t0.6` | Wave 1: миграция admin context end-to-end |
| ✅ | `bd-0t0.7` | Wave 2: миграция домена Catalog pages DTO/forms |
| ✅ | `bd-0t0.8` | Wave 2: миграция домена Library/Profile DTO/forms |
| ✅ | `bd-0t0.9` | Wave 2: миграция домена Relations/Spoiler DTO/forms |
| ✅ | `bd-0t0.10` | Wave 2: миграция домена Rankings/Collections/Admin DTO/forms |
| ✅ | `bd-0t0.11` | Finalization: remove class-validator and legacy cleanup |

### DX — axios HTTP-клиент — ✅ · epic `bd-707` · 10 / 10 · ADR [0005](docs/adr/0005-axios-http-client.md) **accepted**

План: [migration-axios.md](docs/tech/migration-axios.md) (**completed**). Сборочная: `feat/bookspace-bd-707` (запушена; в `develop` не влита — ЗАЛИВАТЬ=Нет). Target verify: web unit 54/54, api 15/15, lint OK, PW 48/48.

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-707.1` | F0: deps + docs sync |
| ✅ | `bd-707.2` | F1: web http + ApiError foundation |
| ✅ | `bd-707.3` | F2: api HttpModule foundation |
| ✅ | `bd-707.4` | W1: migrate web lib/auth |
| ✅ | `bd-707.5` | W2: migrate web catalog libs |
| ✅ | `bd-707.6` | W3: migrate web admin-context lib |
| ✅ | `bd-707.7` | W4: migrate web client forms fetch |
| ✅ | `bd-707.8` | W5: web regression smoke |
| ✅ | `bd-707.9` | A1: OAuth clients → HttpService |
| ✅ | `bd-707.10` | D1: DoD guardrails + docs |

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
| 🔄 | `bd-6v0.10` | Поиск: префикс `роул` не находит «Роулинг» (human-reported) |

### 3. Связи и порядок — ⬜ · epic `bd-azl` · 0 / 4

| Статус | ID | Задача |
|--------|-----|--------|
| ⬜ | `bd-azl.1` | Связи: Карточка серии |
| ⬜ | `bd-azl.2` | Связи произведений |
| ⬜ | `bd-azl.3` | Связи: Порядок чтения |
| ⬜ | `bd-azl.4` | Связи: Spoiler gate |
| ✅ | `bd-azl.5` | Bug: iOS Chrome — «Показать» не снимает spoiler gate (human-reported) |

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
| 🔄 | `bd-cq7.6` | Bug: iOS Chrome — пустая страница Профиль `/library` (human-reported) · `task/bd-cq7.6-ios-chrome-library-empty` |

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

### 11. PWA и оболочка — ✅ · epic `bd-6b7` · 4 / 4 (+ human follow-up)

| Статус | ID | Задача |
|--------|-----|--------|
| ✅ | `bd-6b7.1` | PWA: установка |
| ✅ | `bd-6b7.2` | PWA: offline shell |
| ✅ | `bd-6b7.3` | PWA: App shell и tab-bar |
| ✅ | `bd-6b7.4` | UI: строка меню (Главная · Поиск · Профиль) — MVP-срез |
| ✅ | `bd-6b7.5` | UI: кнопки Войти / Выйти в меню (human-reported) |
| ✅ | `bd-6b7.6` | [bug] UI: одинаковый font-weight у всех пунктов меню (как у активного) |
| ✅ | `bd-6b7.7` | [bug] Войти/Выйти пропадает + hydration AppNav |
| ✅ | `bd-6b7.8` | UI: Войти/Выйти из меню в раздел Профиля |

---

## Последние действия агента

| Дата | Действие |
|------|----------|
| 2026-08-03 | `bd-jtw` ready close: `useSyncExternalStore` вместо setState-in-effect; lint green; unit spoiler-gate+characters **19/19**; PW character-page **12/12** desktop+mobile (`PLAYWRIGHT_CHROME_CHANNEL=0`); ветка `task/bd-jtw-spoiler-gate-setstate-lint`; `bd close` — оркестратор |
| 2026-08-03 | Dashboard: `bd-p3l` / `bd-v3x` / `bd-azl.5` → ✅ (closed+merged в сборочную bugs) |
| 2026-08-03 | `bd-v3x` ready close: integration mock `api.get` (не fetch); vitest integration 3/3 + web suite **264/264**; PW context-reading+work-page **10/10** desktop+mobile (`PLAYWRIGHT_CHROME_CHANNEL=0`); ветка `task/bd-v3x-context-reading-axios-mock`; `bd close` — оркестратор |
| 2026-08-03 | `bd-v3x` в работе: conventions (design/acceptance/notes/labels area:web+area:context+sec:http+regress+dx); TDD RED stub fetch → GREEN mock api.get; sync origin/develop OK |
| 2026-08-03 | `bd-p3l` ready close: `font-sans` на Button/Input; unit button.test **9/9**; PW ui-typography+login **14/14** desktop+mobile (`PLAYWRIGHT_CHROME_CHANNEL=0`); manual `e2e/manual/ui-typography-form-controls.md`; ветка `task/bd-p3l-baskerville-form-controls`; `bd close` — оркестратор |
| 2026-08-03 | `bd-p3l` в работе: conventions (design/acceptance/notes); TDD `font-sans` на Button/Input; ветка `task/bd-p3l-baskerville-form-controls` от `feat/bookspace-bd-bugs`; `bd close` — оркестратор |
| 2026-08-03 | `bd-azl.5` ready close: Secure cookie + localStorage fallback + optimistic accept; unit spoiler-gate 10/10 (+ characters 9); PW character-page **12/12** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); manual `e2e/manual/spoiler-gate-ios.md`; ветка `task/bd-azl.5-ios-chrome-spoiler-gate`; `bd close` — оркестратор |
| 2026-08-03 | `bd-azl.5` в работе: iOS Chrome spoiler «Показать»; гипотеза Secure cookie + remount без fallback; TDD Secure/localStorage + PW accept+reload; ветка `task/bd-azl.5-ios-chrome-spoiler-gate` |
| 2026-08-03 | `bd-cq7.6` ready close: GuestOnly loading UI + AppNav pending→/library; unit 47/47; PW library+app-nav 32/32 + auth-pages/redirect/login (PLAYWRIGHT_CHROME_CHANNEL=0); ветка `task/bd-cq7.6-ios-chrome-library-empty`; `bd close` — оркестратор |
| 2026-08-03 | `bd-cq7.6` в работе: root cause GuestOnly `return null` + AppNav pending→/login; TDD GuestOnly loading + pending profile→/library; ветка `task/bd-cq7.6-ios-chrome-library-empty` |
| 2026-07-29 | `bd-6b7.8`: auth из AppNav → `/library` LogoutButton; guest Профиль→/login; unit 48; PW app-nav guest OK |
| 2026-07-29 | Intake: `bd-6b7.8` — Войти/Выйти из AppNav в Профиль/библиотеку (UX mobile); claim `task/bd-6b7.8-auth-in-profile` |
| 2026-07-29 | `bd-6b7.7` fix: AppNav без Slot/asChild; auth shrink-0; unit 48; PW 16/16; ready close+merge → develop |
| 2026-07-29 | Intake+fix: `bd-6b7.7` — Войти/Выйти flash/пропадает + hydration AppNav (Slot asChild); claim `task/bd-6b7.7-nav-hydration-auth-visible` |
| 2026-07-29 | Оркестратор: целевая проверка PASS (unit AppNav 53/53, PW app-nav 16/16); `feat/bookspace-bd-6b7` → develop (`bd-6b7.5`+`.6`); ЗАЛИВАТЬ=Да |
| 2026-07-29 | `bd-6b7.6` closed: общий font-semibold в AppNav; unit 37/37; PW app-nav 16/16 desktop+mobile; merge → `feat/bookspace-bd-6b7` |
| 2026-07-29 | `bd-6b7.6` close-prep: общий `font-semibold` на всех пунктах AppNav (active = underline/цвет); unit **11/11**; Playwright app-nav **16/16** desktop+mobile (`PLAYWRIGHT_CHROME_CHANNEL=0`); manual DevTools; ветка `task/bd-6b7.6-nav-font-weight`; `bd close` за оркестратором |
| 2026-07-29 | `bd-6b7.6` в работе: conventions OK; sync origin/develop Already up to date; TDD font-weight AppNav |
| 2026-07-29 | Оркестратор: claim `bd-6b7.6` → `task/bd-6b7.6-nav-font-weight` (после close+merge `.5`) |
| 2026-07-29 | `bd-6b7.5` closed: Войти/Выйти в AppNav; unit 35/35; PW app-nav 14/14 desktop+mobile; merge → `feat/bookspace-bd-6b7` |
| 2026-07-29 | `bd-6b7.5` close-prep: AppNav guest «Войти»→/login, USER/ADMIN «Выйти»→`logout()` BFF; unit **35/35**; Playwright app-nav **14/14** desktop+mobile (`PLAYWRIGHT_CHROME_CHANNEL=0`); manual `e2e/manual/app-nav.md`; `bd close` за оркестратором |
| 2026-07-29 | `bd-6b7.5` в работе: conventions OK; sync origin/develop Already up to date; TDD `getNavAuthAction` + AppNav «Войти»/«Выйти» (BFF logout); unit 35/35; PW smoke app-nav — далее |
| 2026-07-29 | Оркестратор batch `feat/bookspace-bd-6b7`: sync origin/develop; claim `bd-6b7.5` → `task/bd-6b7.5-nav-login-logout`; очередь `.5` → `.6`; ЗАЛИВАТЬ develop=Да |
| 2026-07-29 | Intake `/task`: `bd-6b7.6` bug — font-weight всех ссылок меню = как у активного (`font-semibold` сейчас только на `isActive`); feature-doc `app-shell-tab-bar`; сборочная `feat/bookspace-bd-6b7` |
| 2026-07-29 | Docs на `feat/bookspace-bd-23j`: канон UI-шрифта Baskerville для агентов — `stack.mdc`, `ui-ru.mdc`, `AGENTS.md`, `stack-and-architecture`, `ui-typography` § Для агентов; `bd remember ui-font-baskerville` |
| 2026-07-29 | Intake `/task`: `bd-p3l` bug — Baskerville не на button/input (UA не наследует font-family); feature-doc `ui-typography`; сборочная `feat/bookspace-bd-23j`; discovered-from `bd-23j` |
| 2026-07-29 | Оркестратор: целевая проверка `feat/bookspace-bd-23j` PASS (unit typography 20/20, typecheck OK, PW 30/30); `bd-v3x` заведён (axios stub, вне diff); ЗАЛИВАТЬ develop=Нет — push сборочной |
| 2026-07-29 | `bd-23j` closed + merge → `feat/bookspace-bd-23j`: Baskerville next/font/local woff2; unit 20/20; Playwright home/nav/login/typography **30/30** desktop+mobile; ЗАЛИВАТЬ develop=Нет |
| 2026-07-29 | `bd-23j` close-prep: Baskerville via next/font/local (woff2 400/700 + italic); unit layout/tokens/tailwind **20/20**; Playwright home+app-nav+login+ui-typography **30/30** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); feature-doc `ui-typography.md`; ветка `task/bd-23j-baskerville-fonts`; `bd close` за оркестратором |
| 2026-07-29 | Оркестратор: claim `bd-23j`; сборочная `feat/bookspace-bd-23j` от develop@524c658; ветка `task/bd-23j-baskerville-fonts`; файлы woff2 в `apps/web/fonts/`; ЗАЛИВАТЬ develop=Нет |
| 2026-07-29 | Intake: `bd-23j` UI Baskerville OTF (roman/italic/bold/bolditalic, кириллица, web-embed OK) вместо Roboto; feature-doc `ui-typography`; DX без продуктового эпика |
| 2026-07-29 | `bd-82j` close-prep: Roboto via next/font (400/500/700); unit layout/tokens/tailwind **19**; Playwright home+app-nav+login+ui-typography **30/30** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); feature-doc `ui-typography.md`; ветка `task/bd-82j-roboto-fonts`; `bd close` за оркестратором |
| 2026-07-29 | `bd-82j` в работе: conventions OK; sync origin/develop Already up to date @8fbb22d; TDD Roboto via next/font (400/500/700) + tokens/Tailwind; ветка `task/bd-82j-roboto-fonts` |
| 2026-07-29 | Оркестратор: эпик `bd-707` closed (10/10); target verify PASS (web 54/54, api 15/15, lint OK, PW 48/48); push `origin/feat/bookspace-bd-707`; в `develop` НЕ мёржили (ЗАЛИВАТЬ=Нет) |
| 2026-07-29 | `bd-707.10` D1: eslint `no-restricted-globals`/`syntax` (web overrides SW+BFF; api запрет fetch); `migration-axios.md` → **completed**; inventory+эпик AC закрыты; stack notes; manual `e2e/manual/axios-http-dod.md`; Playwright N/A; `bd close` за оркестратором |
| 2026-07-29 | Claim `bd-707.10`: conventions (design/acceptance Критерии+Проверка/notes/labels area:web+area:api+sec:http+dx); sync origin/develop OK; ветка `task/bd-707.10-dod-guardrails` |
| 2026-07-29 | `bd-707.9` A1: Google/Yandex OAuth clients → `HttpService`+`firstValueFrom` (без `fetch(`); unit **14/14**; API e2e auth-google+yandex **10/10**; Playwright oauth smoke+e2e desktop **10/10**; `bd close` за оркестратором |
| 2026-07-29 | Claim `bd-707.9`: conventions (design/acceptance Критерии+Проверка/notes/labels area:api+sec:auth+dx); sync origin/develop OK; ветка `task/bd-707.9-oauth-httpservice` |
| 2026-07-29 | `bd-707.8` W5: web regression после W1–W4; unit **54/54** (11 files: http/auth/catalog-*/admin-context/add-library-item-form); Playwright smoke auth-pages+login+register+library+admin-context+catalog-search **44/44** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); фиксов axios нет; `bd close` за оркестратором |
| 2026-07-29 | `bd-82j` closed + merge → `feat/bookspace-bd-82j`: Roboto next/font 400/500/700; unit 19/19; Playwright home/nav/login/typography **30/30** desktop+mobile; ЗАЛИВАТЬ develop=Нет |
| 2026-07-29 | Оркестратор: claim `bd-82j` (Roboto via next/font); сборочная `feat/bookspace-bd-82j` от develop@8fbb22d; ветка `task/bd-82j-roboto-fonts`; ЗАЛИВАТЬ develop=Нет |
| 2026-07-29 | Claim `bd-707.8`: conventions (design/acceptance Критерии+Проверка/notes/labels area:web+sec:http+dx+regress); sync origin/develop OK; ветка `task/bd-707.8-web-regression-smoke` |
| 2026-07-29 | `bd-707.7` W4: `add-library-item-form.tsx` → `api`+`ApiError` (нет client fetch); unit 6/6 (+http 8/8); Playwright `library-page` desktop 5/5; `bd close` за оркестратором |
| 2026-07-29 | Claim `bd-707.7`: conventions (design/acceptance Критерии+Проверка/notes/labels area:web+sec:http+dx); sync origin/develop OK; ветка `task/bd-707.7-migrate-client-forms` |
| 2026-07-29 | `bd-707.6` W3: `lib/admin-context.ts` → `api`+`ApiError`+`noStoreConfig` (без fetch/parseApiError); unit 8/8; Playwright `admin-context` desktop 3/3; `bd close` за оркестратором |
| 2026-07-29 | Claim `bd-707.6`: conventions (design/acceptance Критерии+Проверка/notes/labels area:web+sec:http+dx); sync origin/develop OK; ветка `task/bd-707.6-migrate-admin-context` |
| 2026-07-29 | `bd-707.5` W2: catalog libs → `api`+`ApiError`+`noStoreConfig` (без fetch); unit 22/22; Playwright `catalog-search` desktop 5/5; `bd close` за оркестратором |
| 2026-07-29 | `bd-707.4` W1: `lib/auth.ts` → `api`+`ApiError` (без fetch/parseApiError); unit 10/10; Playwright `auth-pages` desktop 3/3; полный auth e2e → W5; `bd close` за оркестратором |
| 2026-07-29 | `bd-707.3` F2: `HttpOutboundModule` (`HttpModule.register` timeout 10s) + import AppModule/AuthModule; unit inject `HttpService` 1/1; нет `axios.create` в app-коде; Playwright N/A; OAuth не тронут (A1); `bd close` за оркестратором |
| 2026-07-29 | Claim `bd-707.3`: conventions (design/acceptance Критерии+Проверка/notes/labels area:api+dx+sec:http+foundation); sync origin/develop OK; ветка `task/bd-707.3-api-httpmodule` |
| 2026-07-29 | `bd-707.2` F1: `apps/web/lib/http.ts` axios client + `ApiError` interceptor (string/string[]/fallback); unit 8/8; Playwright N/A (foundation без UI); call-sites не тронуты; `bd close` за оркестратором |
| 2026-07-29 | Claim `bd-707.2`: conventions (design/acceptance Критерии+Проверка/notes/labels area:web+dx+sec:http+foundation); sync origin/develop OK; ветка `task/bd-707.2-web-http-apierror` |
| 2026-07-29 | `bd-707.1` F0: axios `^1.18.1` в web+api, `@nestjs/axios` `^4.0.1` в api; docs ADR 0005 уже accepted (README + stack); Playwright N/A; ветка `task/bd-707.1-axios-deps-docs`; `bd close` за оркестратором |
| 2026-07-29 | Claim `bd-707.1`: conventions (design/acceptance/notes/labels area:web+area:api+sec:http+dx+deps); sync origin/develop OK; ветка `task/bd-707.1-axios-deps-docs` |
| 2026-07-29 | ADR 0005 **accepted**; эпик `bd-707` + 10 задач (F0–D1) по [migration-axios.md](docs/tech/migration-axios.md); ready: `bd-707.1`; сборочная `feat/bookspace-bd-707` |
| 2026-07-29 | `/task`: создан `bd-82j` — Roboto (Google Fonts) на весь UI, веса 400/500/700; DX без продуктового эпика; feature-doc `ui-typography` при реализации |
| 2026-07-29 | `/task`: создан `bd-6b7.5` — Войти/Выйти в AppNav (гость→`/login`, user→logout BFF); эпик `bd-6b7`, feature-doc `app-shell-tab-bar` |
| 2026-07-29 | Эпик `bd-0t0` closed (11/11 + bd-0t0.12): target verify code PASS + Playwright **108/108**; сборочная `feat/bookspace-bd-0t0` — ЗАЛИВАТЬ develop=Нет (push only) |
| 2026-07-29 | Target re-verify PASS после `bd-0t0.12` (smoke main-scoped); Playwright regression 108/108 |
| 2026-07-29 | `bd-0t0.12` close-prep: smoke `rankings-collections-zod` button/textbox count scoped to `main` (exclude Next Dev Tools); Playwright **4/4** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0, E2E_THROTTLE_BYPASS, localhost); product stubs unchanged; `bd close` за оркестратором |
| 2026-07-29 | Target verify: bug `bd-0t0.12` (rankings smoke vs Next Dev Tools); claim `task/bd-0t0.12-rankings-smoke-devtools` |
| 2026-07-29 | `bd-0t0.11` close-prep: удалены прямые deps `class-validator`/`class-transformer`; e2e → `configureApp`; CV-path filter убран; docs migration/ADR0004/stack/schemas README; unit removal gates api 5 + web 3; API e2e auth/oauth/openapi/search/admin-context green; Playwright migrated domains **84/84** desktop+mobile (localhost, PLAYWRIGHT_CHROME_CHANNEL=0); manual `e2e/manual/class-validator-removed.md`; optional peers Nest/@hookform/resolvers в lockfile; `bd close` за оркестратором |
| 2026-07-29 | Оркестратор: claim `bd-0t0.11` (remove class-validator + legacy cleanup); ветка `task/bd-0t0.11-remove-class-validator` |
| 2026-07-29 | `bd-0t0.10` closed + merge → `feat/bookspace-bd-0t0`: rankings/collections/admin Zod contracts; Playwright 4/4 |
| 2026-07-29 | `bd-0t0.10` close-prep: Rankings/Collections Zod contracts + remaining admin path params; stubs без CRUD; unit API 11 + web 8; e2e admin/openapi 18/18; Playwright rankings-collections **4/4** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0, localhost); manual `e2e/manual/rankings-collections-zod.md`; Prisma Ranking/Collection вне runtime; `bd close` за оркестратором |
| 2026-07-29 | `bd-0t0.10` conventions: design/acceptance/notes/labels; план Wave 2 Rankings/Collections stubs→Zod contracts + remaining admin path params; ветка `task/bd-0t0.10-rankings-collections-admin-dto` |
| 2026-07-29 | Оркестратор: claim `bd-0t0.10` (Rankings/Collections/Admin DTO/forms); ветка `task/bd-0t0.10-rankings-collections-admin-dto` |
| 2026-07-29 | `bd-0t0.9` closed + merge → `feat/bookspace-bd-0t0`: spoiler/relations Zod; Playwright character 12/12 |
| 2026-07-29 | `bd-0t0.9` close-prep: Relations/Spoiler Zod (SpoilersOkCookieValue + SpoilersConsentInput + CharacterRelationType + WorkRelationType contract); web spoiler-gate + catalog-character types на schemas; API catalog-character.types shared enum; class-validator в домене не было; unit web focused + api catalog-relations-zod/service green; Playwright character-page **12/12** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0, localhost); manual `e2e/manual/relations-spoiler-zod.md`; WorkRelation/reading-order вне runtime (bd-azl); ветка `task/bd-0t0.9-relations-spoiler-dto`; `bd close` за оркестратором |
| 2026-07-29 | `bd-0t0.9` conventions: design/acceptance/notes/labels; план Wave 2 Relations/Spoiler (spoiler cookie Zod + CharacterRelationType shared; WorkRelation вне runtime); ветка `task/bd-0t0.9-relations-spoiler-dto` |
| 2026-07-29 | Оркестратор: claim `bd-0t0.9` (Relations/Spoiler DTO/forms); ветка `task/bd-0t0.9-relations-spoiler-dto` |
| 2026-07-29 | `bd-0t0.8` closed + merge → `feat/bookspace-bd-0t0`: library RHF + Zod profile slug; Playwright 20/20 |
| 2026-07-29 | `bd-0t0.8` close-prep: Library/Profile Zod (AddLibraryItem + ProfileSlug); class-validator убран из me-library; RHF form `/library` + BFF `/api/me`; unit DTO 5/5 + web focused 20+; API e2e auth 13/13; Playwright library+profile **20/20** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0, next start localhost); manual `e2e/manual/library-profile-zod.md`; shelves/tags runtime нет; ветка `task/bd-0t0.8-library-profile-dto`; `bd close` за оркестратором |
| 2026-07-29 | `bd-0t0.8` conventions: design/acceptance/notes/labels; план Wave 2 Library/Profile (AddLibraryItem + ProfileSlug Zod, RHF form `/library`, shelves/tags вне runtime); ветка `task/bd-0t0.8-library-profile-dto` |
| 2026-07-29 | Оркестратор: claim `bd-0t0.8` (Library/Profile DTO/forms); ветка `task/bd-0t0.8-library-profile-dto` |
| 2026-07-29 | `bd-0t0.7` closed + merge `--no-ff` → `feat/bookspace-bd-0t0`: catalog slug/needsContext Zod; unit 5/5, e2e 26/26, Playwright 42/42 |
| 2026-07-29 | `bd-0t0.7` реализация Catalog pages Zod (`CatalogEntitySlugParam` + `AdminWorkNeedsContextPatch`); class-validator убран из admin-work; web slug через schemas; unit DTO 5/5; API e2e catalog+needs+openapi green; CLI Playwright в agent sandbox fail (Chrome SIGABRT/EPERM); visual MCP Playwright work/author/character/world/place OK desktop+mobile viewport; manual `e2e/manual/catalog-pages-zod.md`; ветка `task/bd-0t0.7-catalog-pages-dto`; перед close — CLI PW вне sandbox; `bd close` за оркестратором |
| 2026-07-29 | Оркестратор batch `feat/bookspace-bd-0t0`: claim `bd-0t0.7` (Catalog pages DTO/forms); очередь `.7`→`.8`→`.9`→`.10`→`.11`; ветка `task/bd-0t0.7-catalog-pages-dto`; ЗАЛИВАТЬ develop=Нет |
| 2026-07-28 | Создан DX-эпик `bd-0t0` (RHF + Zod full contour, ADR 0004 accepted) + декомпозиция `bd-0t0.1`…`bd-0t0.11` с зависимостями (foundation → wave1 → wave2 → finalization) |
| 2026-07-23 | `/task`: `bd-azl.5` — iOS Chrome spoiler «Показать» не снимает gate; `bd-cq7.6` — iOS Chrome пустой Профиль `/library` (iPhone 17, human-reported) |
| 2026-07-23 | Эпик `bd-6b7` closed (4/4): target verify web unit **186** + Playwright pwa-install+offline+app-nav **30/30**; сборочная `feat/bookspace-bd-6b7` — ЗАЛИВАТЬ develop=Нет (push only) |
| 2026-07-23 | `bd-6b7.3` closed: 5-tab shell + stubs; unit suite 186; Playwright app-nav 12/12; merge → `feat/bookspace-bd-6b7` |
| 2026-07-23 | `bd-6b7.3` close-prep: 5-tab shell (Главная·Поиск·Рейтинги·Подборки·Профиль); stubs `/rankings` `/collections`; unit app-nav green (suite 186); Playwright app-nav **12/12** desktop+mobile; manual `e2e/manual/app-shell-tab-bar.md`; ветка `task/bd-6b7.3-app-shell-tab-bar`; `bd close` за оркестратором |
| 2026-07-23 | `bd-6b7.3` в работе: conventions (design/acceptance/notes/labels area:web+sec:pwa+ui+mobile); TDD 5-tab (Главная·Поиск·Рейтинги·Подборки·Профиль); stubs `/rankings` `/collections`; ветка `task/bd-6b7.3-app-shell-tab-bar`; `bd close` за оркестратором |
| 2026-07-27 | Claim/реализация `bd-6v0.10`: prefix FTS (`to_tsquery` + `:*`, `роул`→«Роулинг»); ветка `task/bd-6v0.10-search-prefix`; `bd close` за оркестратором |
| 2026-07-23 | Оркестратор: claim `bd-6b7.3` (5-tab app shell); ветка `task/bd-6b7.3-app-shell-tab-bar` |
| 2026-07-23 | `bd-6b7.2` closed: native SW + /offline + LRU recent; unit offline 10/10 (suite 181); Playwright pwa-offline-shell 10/10 desktop+mobile; merge → `feat/bookspace-bd-6b7` |
| 2026-07-23 | `bd-6b7.2` close-prep: native SW + Cache Storage + `/offline` (без npm PWA-libs); unit **181**; Playwright pwa-offline-shell **10/10** desktop+mobile (PLAYWRIGHT_CHROME_CHANNEL=0); manual `e2e/manual/pwa-offline-shell.md`; ветка `task/bd-6b7.2-pwa-offline-shell`; `bd close` за оркестратором |
| 2026-07-23 | `bd-6b7.2` в работе: conventions (design/acceptance/notes/labels area:web+sec:pwa+mobile); TDD native SW + Cache Storage + `/offline`; unit offline-cache/register; Playwright pwa-offline-shell; manual `e2e/manual/pwa-offline-shell.md`; ветка `task/bd-6b7.2-pwa-offline-shell`; `bd close` за оркестратором |
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
