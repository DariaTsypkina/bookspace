# Admin catalog entities CRUD — ручной чеклист (bd-i5b.9)

## Предусловия

- API + web подняты; seed: `admin@bookspace.local` / `Admin123!`

## Сценарии

1. Войти как admin → `/admin/catalog`
2. Вкладки: Произведения | Серии | Персонажи | Миры | Локации
3. Серии: создать черновик → опубликовать → «Открыть публично» → soft-delete → публичная страница не найдена
4. Персонажи / Миры / Локации: то же (для локации опционально выбрать мир через Select)
5. Гость на `/admin/catalog` → `/login`
6. USER → редирект с админки

## API

- Non-admin на `/admin/series|characters|worlds|places` → 403
