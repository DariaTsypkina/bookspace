# Admin catalog CRUD — ручной чеклист (bd-i5b.2)

## Предусловия

- API + web подняты; seed: `admin@bookspace.local` / `Admin123!`
- Миграция `ExternalId` применена

## Сценарии

1. Войти как admin → `/admin` → быстрое действие «Каталог» → `/admin/catalog`
2. Создать произведение (название RU) → статус «Черновик»
3. Добавить ExternalId (источник Select + ключ) → видно в списке
4. «Опубликовать» → статус «Опубликовано»; «Открыть публично» → карточка книги
5. «Скрыть (soft-delete)» → пропадает из админ-списка; публичный URL → не найдено
6. Гость на `/admin/catalog` → редирект на `/login`
7. USER на `/admin/catalog` → редирект на `/`

## Не покрыто в этом срезе

- Series / Characters / Worlds / Places full CRUD — см. `admin-catalog-entities.md` (bd-i5b.9)
- Merge Works (`bd-i5b.3`)
