# Manual checklist: class-validator removal (bd-0t0.11)

## Preflight

- [ ] API health `GET http://localhost:8000/health` → 200
- [ ] Web `http://localhost:3000` отвечает
- [ ] `E2E_THROTTLE_BYPASS=true` / заголовок `X-E2E: 1` для auth-сценариев

## Smoke (guest)

- [ ] `/login` — форма RHF, RU labels, клиентская валидация
- [ ] `/register` — форма RHF
- [ ] `/search` — поиск каталога
- [ ] `/admin/context` — stub/редирект для guest (или форма для admin)
- [ ] `/library` — stub/форма add item
- [ ] `/books/...` character/world/place — карточки без падений
- [ ] Spoiler gate на character page
- [ ] `/rankings` и `/collections` — stubs без форм

## Regression from dep removal

- [ ] Невалидный login → field errors (не 500)
- [ ] API `POST /auth/login` с пустым body → 400 `VALIDATION_FAILED` + `errors[{code,path,message}]`
- [ ] OpenAPI `/docs` открывается

## Notes

Прямые зависимости `class-validator` / `class-transformer` удалены. Optional peer в lockfile у Nest/`@hookform/resolvers` допустим; app source не импортирует их.
