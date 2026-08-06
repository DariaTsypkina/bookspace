# Admin dashboard — ручной чеклист (bd-i5b.1)

Для человека. Агент гоняет автотесты; этот файл — exploratory smoke.

## Предусловия

- `docker compose up` (Postgres + Redis)
- `pnpm --filter api start:dev` на :8000
- `pnpm --filter web dev` на :3000
- Seed admin: `admin@bookspace.local` / `Admin123!`

## Сценарии

1. **Guest**
   - Открыть `/admin` без сессии → редирект на `/login`.

2. **Обычный user**
   - Зарегистрироваться / войти как USER → `/admin` → редирект на `/`.

3. **Admin — сводка**
   - Войти как admin → `/admin`.
   - Видны заголовок «Админ-дашборд», три счётчика: MatchQueue OPEN, ContextReading за N дн., Failed jobs (числа ≥ 0).
   - Карточки MatchQueue / ContextReading кликабельны (переход на `/admin/match-queue`, `/admin/context` — страницы могут быть заглушками/404 до следующих задач).

4. **Быстрые действия**
   - Ссылки «Импорт каталога», «Агрегация рейтингов», «LLM context batch» ведут на `/admin/import`, `/admin/rankings`, `/admin/context`.
   - Кнопки выглядят как outline (Link + buttonVariants), без hydration-мигания auth-меню.

5. **Mobile**
   - Узкий viewport (~390px): счётчики в одну колонку, быстрые действия стеком; шрифт Baskerville на кнопках/карточках.

## Не проверяем здесь

- Запуск реальных BullMQ jobs (другие задачи эпика).
- CRUD MatchQueue / rankings / import UI.
