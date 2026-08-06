# Mobile auth: Chrome vs Safari

Ручной чеклист после фиксов progressive login/logout (`bd-6b7.*`, `bd-957.7`).

## Safari (ожидание: OK)

1. Открыть LAN URL → войти → Профиль `/library` → **Выйти** → `/login` с формой (не «Загрузка»).
2. Войти снова → редирект на `/` (не `/login?email=…&password=…`).
3. После logout тап **Профиль** → `/login`, не `/library`.

## Chrome mobile

1. Тот же сценарий login/logout.
2. В консоли может быть hydration mismatch с `__gcruniqueid` — известный Chrome autofill, не регрессия приложения ([Next #77710](https://github.com/vercel/next.js/issues/77710)).
3. Progressive POST `/api/login` и `/api/logout` должны работать даже при шуме hydration.

## Dev LAN

- `NEXT_ALLOWED_DEV_ORIGINS` в `apps/web/.env` (CSV origins) → `next.config` `allowedDevOrigins`.
- В plain `next dev` SW не регистрируется; stale SW снимается (`PwaSwRegister`).
