# Auth Context — один `/api/auth/me` (bd-957.6)

Ручной чеклист после unit + Playwright smoke.

## Предусловия

- `api` на `:8000`, `web` на `:3000`
- Seed: `admin@bookspace.local` / `Admin123!`
- DevTools → Network (фильтр `me`)

## Сценарии

- [ ] Hard reload `/`: ровно **один** `GET /api/auth/me`; guest → Профиль `/login`
- [ ] Клики по табам (Поиск / Рейтинги / Подборки / Главная) **без** новых `/me`
- [ ] Login admin → Профиль `/library`; снова клики по меню без `/me`
- [ ] Открыть `/login` будучи залогиненным → редирект на `/u/[slug]` (GuestOnly)
- [ ] Logout на `/library` → `/login`; клики по меню guest без `/me` на каждый переход
- [ ] Register → `/login` (гость); контекст не «залипает» как authenticated

## Вне scope

- Стейт-менеджер (Zustand/Redux) — запрещён задачей
- Server Components session — follow-up при необходимости
