# Ручной чеклист: RU user-facing ошибки (bd-a12.1)

Для человека. Агент гоняет Playwright `e2e/smoke/ru-user-facing-errors.spec.ts`.

## Desktop + mobile

1. `/login` — невалидный email / короткий пароль → FormMessage на русском, без `Too small` / `Invalid email`.
2. `/login` — неверные учётные данные → «Неверный email или пароль».
3. `/register` — слабый пароль → «Минимум 8 символов» (или эквивалент на русском).
4. `/library` (гость) — пустой слаг → «Укажите слаг произведения», без EN Zod.
5. `/auth/error?reason=oauth_failed&provider=yandex` → понятное русское сообщение.
6. При EN `Unauthorized` с API (мок/прокси) — на экране «Необходима авторизация», не `Unauthorized`.
