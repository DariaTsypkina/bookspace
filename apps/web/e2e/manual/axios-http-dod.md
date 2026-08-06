# Ручной чеклист: Axios HTTP DoD (bd-707.10)

Guardrails + docs; runtime UI не менялся. Полный smoke auth/library/admin — см. W5 (`bd-707.8`).

## Перед проверкой

- [ ] Установлены зависимости (`pnpm install`)

## Guardrails

1. **Инвентарь `fetch(`**
   - [ ] `rg 'fetch\s*\(' apps/web` — только `public/sw.js` и `app/api/**/route.ts`
   - [ ] `rg 'fetch\s*\(' apps/api/src` — пусто

2. **ESLint**
   - [ ] `pnpm --filter web run lint` — зелёный
   - [ ] `pnpm --filter api run lint` — зелёный
   - [ ] Временный `fetch(` в `apps/web/lib/*.ts` или `apps/api/src/**` → eslint error (опционально)

## Docs

- [ ] [migration-axios.md](../../../../docs/tech/migration-axios.md) — status **completed**, инвентарь закрыт
