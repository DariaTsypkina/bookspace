# Ручной чеклист: Auth Яндекс OAuth (bd-957.3)

## Перед проверкой

- [ ] В `.env` api заданы `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, `YANDEX_CALLBACK_URL=http://localhost:3000/api/auth/yandex/callback`
- [ ] Для локальной отладки без Яндекс: `OAUTH_TEST_MODE=true`
- [ ] Запущены api (:8000) и web (:3000)

## Сценарии

1. **Первый вход**
   - [ ] `/login` → «Войти через Яндекс»
   - [ ] Согласие у Яндекс (или test mode)
   - [ ] Редирект на `/`, cookie `session` (HttpOnly)
   - [ ] В БД: User + Account (provider=yandex)

2. **Повторный вход**
   - [ ] Logout → снова Яндекс
   - [ ] Тот же User / Account (не дубликат)

3. **Склейка по email**
   - [ ] Зарегистрировать email+пароль
   - [ ] Войти через Яндекс с тем же email
   - [ ] Account привязан к существующему User

4. **Отмена**
   - [ ] Отменить согласие у Яндекс
   - [ ] `/auth/error` с русским текстом «Вход через Яндекс отменён»

## Негатив

- [ ] Без env Яндекс (и без test mode) — понятная ошибка / недоступность
