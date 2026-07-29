# Admin ContextReading — ручной чеклист

Стенд: Postgres + Redis, `pnpm --filter api prisma:seed`, api + web локально.

Стек UI: Tailwind + shadcn (`Card` / `Button` / `Input` / `Form`); patch-форма на RHF + Zod (`AdminContextPatchFormSchema`); orphan `.admin-context-*` в `globals.css` удалены.

## Доступ

- [ ] Гость на `/admin/context` → редирект на `/login`
- [ ] USER после входа → редирект на `/`
- [ ] ADMIN видит заголовок «ContextReading» и описание очереди

## Очередь

- [ ] Свежие auto-published записи отображаются с subject/recommended
- [ ] Видны admin-поля: source URL, snippet (если есть)
- [ ] Пустая очередь — понятное сообщение

## Правки / валидация

- [ ] Пустой «Почему (RU)» → field-level ошибка, без сохранения
- [ ] Ранг вне 1..99 → field-level ошибка
- [ ] Сохранение whyText / importanceRank обновляет запись
- [ ] «Снять с публикации» убирает запись из очереди и public API
- [ ] «Отклонить» помечает REJECTED

## Jobs

- [ ] Classify / Extract кнопки доступны для subject work (без падения UI)

## Аудит

- [ ] После правки/unpublish/reject в `AuditLog` есть соответствующая запись
