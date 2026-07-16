# Ручной чеклист: Auth email/password (bd-8jk)

Проверять на локальном стенде: `docker compose up -d`, `pnpm dev`, web `:3000`, api `:8000`.

## Регистрация (`/register`)

- [ ] Страница на русском: заголовок «Регистрация», поля Email и Пароль
- [ ] Ссылка «Войти» ведёт на `/login`
- [ ] Успешная регистрация с сильным паролем (например `Test123!`) → редирект на `/login`
- [ ] Слабый пароль → сообщение об ошибке на русском, без отправки на сервер (клиент) или 400 от API
- [ ] Повторная регистрация с тем же email → сообщение о конфликте на русском
- [ ] В ответе API / UI нигде не отображается пароль или `passwordHash`

## Вход (`/login`)

- [ ] Страница на русском: заголовок «Вход»
- [ ] Ссылка «Зарегистрироваться» ведёт на `/register`
- [ ] Успешный вход seed-пользователя `user@bookspace.local` / `User123!` → редирект на главную
- [ ] Неверный пароль → «Неверный email или пароль», без утечки деталей
- [ ] После входа в DevTools → Application → Cookies для `localhost` есть httpOnly cookie `session` (домен API `localhost:8000`)

## Seed-пользователи

- [ ] `pnpm --filter api prisma:seed` создаёт `admin@bookspace.local` / `Admin123!` (ADMIN) и `user@bookspace.local` / `User123!` (USER)
- [ ] Вход под admin и user работает

## Вне scope (отдельная задача auth-session / bd-v2y)

- [ ] Logout, guards, защита `/admin` — не проверять в этом чеклисте
- [ ] Cookie `session` сейчас на origin API (`localhost:8000`); для prod split web/api нужен BFF или `SameSite=None; Secure` + CSRF — не считать текущую схему production-complete
