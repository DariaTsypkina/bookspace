# Auth rate limit — ручной чеклист

Стенд: web `:3000`, api `:8000`.

## Подготовка

- API без `E2E_THROTTLE_BYPASS` (или `false`).
- Лимиты по умолчанию: register 5 / 15 мин, login 10 / 15 мин на IP.

## Сценарии

1. **Register 429**
   - 5+ быстрых POST `/auth/register` с одного IP (curl / DevTools).
   - Ожидание: 6-й запрос → `429`, тело `{ message: "Слишком много попыток..." }`.

2. **Login 429**
   - 10+ POST `/auth/login` с неверным паролем с одного IP.
   - Ожидание: 11-й → `429`.

3. **Легитимный пользователь**
   - Одна регистрация + вход в пределах лимита → `201` / `200`, cookie `session`.

4. **E2E bypass (локально для тестов)**
   - `E2E_THROTTLE_BYPASS=true` + заголовок `X-E2E: 1` → лимит не срабатывает.

## Регресс

- Playwright `auth-email-password.spec.ts` и smoke auth-pages проходят с bypass в `playwright.config.ts`.
