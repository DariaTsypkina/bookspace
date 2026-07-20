# Auth: сессия и защита маршрутов (bd-v2y)

Ручной чеклист после автоматических тестов.

## Предусловия

- `api` на `:8000`, `web` на `:3000`
- Postgres + seed (есть `admin@bookspace.local` / `Admin123!`)

## Сценарии

- [ ] Регистрация + вход через UI: в DevTools → Cookies для `localhost:3000` есть httpOnly `session` (BFF first-party)
- [ ] `/api/auth/me` с cookie → 200; без cookie → 401
- [ ] Кнопка «Выйти» на `/u/[slug]` → редирект на `/login`, повторный заход на `/login` не редиректит в профиль
- [ ] После logout старый cookie (если сохранён) не даёт `/auth/me` 200 (jti revoke)
- [ ] `POST /me/library/items` без cookie → 401; с сессией → 201
- [ ] USER на `GET /admin/ping` → 403; ADMIN (seed) → 200
- [ ] Скрытие `/admin` в UI недостаточно: сервер всё равно отвечает 403 USER

## Вне scope

- Rate limit register/login → `bd-wlw`
- Полная library / UserBook → фаза библиотеки
- Redis denylist multi-instance → follow-up при горизонтальном масштабировании
