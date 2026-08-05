# Карта экранов (MVP)

Mobile first. UI на русском. SEO: title/description для публичных страниц.
User-facing ошибки (FormMessage, alert, toast, ответы API на экране) — только русский; EN Nest/Zod маппить на UI (`apps/web/lib/user-facing-errors.ts`).
Стек UI: Next.js — [stack-and-architecture](stack-and-architecture.md).

## Навигация (публичная оболочка)

Нижняя tab-bar (mobile):

| Tab | Путь | Notes |
|-----|------|--------|
| Главная | `/` | |
| Поиск | `/search` | |
| Рейтинги | `/rankings` | |
| Подборки | `/collections` | |
| Профиль | `/library` или `/login` | гость → вход; user → кабинет / ссылка на публичный профиль |

Админка `/admin/*` — отдельный layout, **не** в tab-bar.

Desktop: та же информационная архитектура (горизонтальная nav или боковая — деталь реализации, IA та же).

## Маршруты

### Публичные (guest + user)

| Путь | Экран | SEO |
|------|-------|-----|
| `/` | Главная: вход в каталог, избранные рейтинги/подборки | да |
| `/search?q=` | Поиск по книгам/авторам/сериям/персонажам/мирам | noindex при пустом q |
| `/books/[slug]` | Карточка произведения | да |
| `/authors/[slug]` | Автор | да |
| `/series/[slug]` | Серия + порядок чтения | да |
| `/characters/[slug]` | Персонаж | да |
| `/worlds/[slug]`, `/places/[slug]` | Мир / локация | да |
| `/rankings` | Список рейтингов | да |
| `/rankings/[slug]` | Топ с позициями | да |
| `/collections` | Список подборок | да |
| `/collections/[slug]` | Подборка | да |
| `/u/[userSlug]` | Публичный профиль / коллекция | да |
| `/u/[userSlug]/books/[workSlug]` | Книга в контексте пользователя | да |
| `/login`, `/register` | Auth | noindex |
| `/auth/error` | Ошибки OAuth | noindex |

### Кабинет (user)

| Путь | Экран |
|------|-------|
| `/library` | Моя коллекция (фильтры по статусу) |
| `/library/shelves` | Полки |
| `/library/shelves/[slug]` | Полка |
| `/library/goal` | Цель на год |
| `/settings` | Имя, slug профиля, пароль |

Редактирование UserBook — sheet/modal со страницы книги или библиотеки.

### Админка

| Путь | Экран |
|------|-------|
| `/admin` | Дашборд: очереди, jobs |
| `/admin/works`, `/admin/works/[id]` | CRUD / merge |
| `/admin/authors` и др. сущности | CRUD каталога |
| `/admin/import` | Импорт каталога |
| `/admin/rankings`, `/admin/collections` | Рейтинги / подборки |
| `/admin/external-sources` | ExternalRankingSource |
| `/admin/context` | ContextReading + запуск LLM |
| `/admin/match-queue` | Не сматченные записи |
| `/admin/audit` | Audit log |

Детали модулей — этап 4 / [admin.md](admin.md) (появится следом).

## Страница книги `/books/[slug]` — блоки

1. Заголовок (`titleRu`), авторы, год, серия.
2. User: статус, оценка 1–10.
3. Издания/переводы.
4. Порядок чтения / sequel–prequel — за **spoiler gate**.
5. Персонажи, места/мир — за spoiler gate.
6. «Для понимания» — **только** при PUBLISHED ContextReading.
7. Рекомендации (эвристики; ≠ ContextReading).
8. Дисклеймер у context: «список составлен автоматически» (без URL источников).

## Spoiler gate

- Предупреждение: «Могут быть спойлеры».
- После подтверждения контент открыт полностью (без blur по статусу прочитанного).
- Согласие хранить в **cookie ~30 дней** (имя ориентир: `spoilers_ok=1`, path `/`, SameSite=Lax).
- По истечении — снова показать gate.

## PWA shell

- Manifest + service worker: precache shell + recently viewed pages.
- Offline fallback `/offline`.
- Каталог целиком offline не требуется.

## Пустые и ошибочные состояния

- 404 — неизвестный slug.
- Пустой поиск — подсказки + ссылки на рейтинги/подборки.
- Нет ContextReading — секция не рендерится.
