# Ручная проверка: Rankings/Collections/Admin Zod (bd-0t0.10)

## Предусловия

- Postgres + API (`:8000`) + Web (`:3000`) запущены локально
- Предпочтительно `http://localhost` (не `127.0.0.1`)
- `E2E_THROTTLE_BYPASS=true` при необходимости

## Public stubs (форм нет)

### `/rankings`

- [ ] Заголовок «Рейтинги»
- [ ] Текст «Публичные рейтинги скоро появятся.»
- [ ] Нет textbox / submit
- [ ] Tab «Рейтинги» с `aria-current=page`

### `/collections`

- [ ] Заголовок «Подборки»
- [ ] Текст «Подборки приложения скоро появятся.»
- [ ] Нет textbox / submit
- [ ] Tab «Подборки» с `aria-current=page`

### Mobile

- [ ] Те же stubs на узком viewport (~390px)

## Remaining admin path params (API)

- [ ] Admin `PATCH /admin/works/:workId/needs-context` с валидным UUID workId → 200 (как раньше)
- [ ] Admin `PATCH /admin/context/:id` с валидным id → 200 (как раньше)
- [ ] Пустой / oversized path param → 400 `VALIDATION_FAILED` (Zod)

## Gaps (вне среза)

- Prisma-моделей Ranking/Collection ещё нет — full CRUD admin/public list-detail не реализовывать в этой задаче
- Job triggers `rankings.import.source` / `rankings.aggregate.publish` — только shared Zod contracts
- Admin UI `/admin/rankings`, `/admin/collections` — ещё не существует

## Playwright

```bash
PLAYWRIGHT_CHROME_CHANNEL=0 pnpm --filter web exec playwright test e2e/smoke/rankings-collections-zod.spec.ts --project=chromium-desktop --project=chromium-mobile
```
