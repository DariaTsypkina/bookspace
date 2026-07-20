# Ручной чеклист: Auth Google OAuth (bd-957.2)

## Перед проверкой

- [ ] В `.env` api заданы `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback`
- [ ] Для локальной отладки без Google: `OAUTH_TEST_MODE=true`
- [ ] Запущены api (:8000) и web (:3000)

## Сценарии

1. **Первый вход**
   - [ ] `/login` → «Войти через Google»
   - [ ] Согласие у Google (или test mode)
   - [ ] Редирект на `/`, cookie `session` (HttpOnly)
   - [ ] В БД: User + Account (provider=google)

2. **Повторный вход**
   - [ ] Logout → снова Google
   - [ ] Тот же User / Account (не дубликат)

3. **Склейка по email**
   - [ ] Зарегистрировать email+пароль
   - [ ] Войти через Google с тем же email
   - [ ] Account привязан к существующему User

4. **Отмена**
   - [ ] Отменить согласие у Google
   - [ ] `/auth/error` с русским текстом «Вход через Google отменён»

## Негатив

- [ ] Без env Google (и без test mode) — понятная ошибка / недоступность
