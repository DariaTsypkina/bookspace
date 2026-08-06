# Ручной чеклист: Admin MatchQueue (bd-i5b.7)

## Подготовка

- [ ] Docker: Postgres + Redis; API и web запущены
- [ ] Вход как admin (`admin@bookspace.local`)

## Очередь

- [ ] `/admin/match-queue` — заголовок, фильтр статуса (shadcn Select), кнопка «Обновить»
- [ ] После импорта без идентификаторов — элемент IMPORT_ROW в списке OPEN
- [ ] Выбор элемента — JSON payload, блок «Предложенные Works»

## Действия

- [ ] «Привязать» по suggestion — элемент исчезает из OPEN (или статус RESOLVED)
- [ ] «Создать DRAFT Work» — новый DRAFT в каталоге, для CONTEXT_CANDIDATE — ContextReading PUBLISHED
- [ ] «Отклонить» — статус DISMISSED, элемент не удалён из БД

## Навигация

- [ ] Ссылка «Открыть MatchQueue» с `/admin/import` ведёт на `/admin/match-queue`
- [ ] С дашборда счётчик MatchQueue OPEN ведёт на `/admin/match-queue`
