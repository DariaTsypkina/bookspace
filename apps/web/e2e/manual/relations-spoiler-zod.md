# Ручная проверка: Relations/Spoiler Zod (bd-0t0.9)

## Предусловия

- Postgres + API (`:8000`) + Web (`:3000`) запущены локально
- Seed с персонажами и CharacterRelation (например Гарри ↔ Гермиона)
- Предпочтительно `http://localhost` (не `127.0.0.1`) для cookie
- `E2E_THROTTLE_BYPASS=true` при необходимости

## Spoiler gate / связи персонажа

### Guest без cookie

- [ ] `/characters/garri-potter` — регион «Связи персонажа», текст «Могут быть спойлеры», кнопка «Показать»
- [ ] Ссылка на связанного персонажа (Гермиона) **не** видна до клика
- [ ] «Показать» → связи видны; предупреждение скрыто
- [ ] Cookie `spoilers_ok=1`, Path `/`, SameSite=Lax, Max-Age ≈ 30 дней

### Guest с cookie

- [ ] Выставить `spoilers_ok=1` → связи сразу видны, gate нет
- [ ] `spoilers_ok=0` / `yes` / пустое → gate снова (invalid value)

### Навигация

- [ ] После согласия клик по связи → `/characters/germiona-greindzher` (или другой published)

### Mobile

- [ ] Те же сценарии на узком viewport (~390px)

## Примечание

WorkRelation / reading-order на `/books` в runtime ещё нет (эпик bd-azl) — вне среза. Миграция Wave 2 здесь: shared Zod spoiler cookie + CharacterRelationType (+ WorkRelationType contract), web/api types на schemas; RHF-форм в домене нет (SpoilerGate = button).
