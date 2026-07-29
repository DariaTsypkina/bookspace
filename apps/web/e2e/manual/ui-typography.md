# Manual: UI typography (Roboto) — bd-82j

## Предусловия

- `web` на :3000, `api` на :8000

## Чеклист

1. Открыть `/` → DevTools → Computed на `body`: `font-family` содержит **Roboto**
2. На заголовке «Главная» (h1): computed `font-family` содержит **Roboto**
3. Открыть `/login` → h1 «Вход» — то же
4. Network: нет запросов к `fonts.googleapis.com` / `fonts.gstatic.com` за шрифтом (шрифт self-host через next/font)
5. Mobile + desktop: tab-bar читаем, layout не «плывёт»
