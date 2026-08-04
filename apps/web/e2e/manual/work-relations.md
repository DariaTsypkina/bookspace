# Связи произведений (bd-azl.2)

Ручной чеклист для `/books/[slug]`. Авто: Playwright `e2e/smoke/work-relations.spec.ts`.

## Предусловия

- API + web подняты; seed применён (`garri-potter-filosofskiy-kamen` → SEQUEL → `garri-potter-taynaya-komnata`)
- Cookie `spoilers_ok` и `localStorage.spoilers_ok` очищены (или приватное окно)

## Сценарии

- [ ] Открыть `/books/garri-potter-filosofskiy-kamen` — виден блок «Связи» с предупреждением «Могут быть спойлеры»
- [ ] Ссылка на «Гарри Поттер и Тайная комната» скрыта до «Показать»
- [ ] Нажать «Показать» — видна ссылка и тип «Продолжение»
- [ ] Клик по ссылке → `/books/garri-potter-taynaya-komnata`
- [ ] Reload с cookie `spoilers_ok=1` — связи сразу открыты, gate нет
- [ ] Книга без связей — блок «Связи» отсутствует (не пустой плейсхолдер)
- [ ] Гость / user не видит UI редактирования связей
- [ ] Mobile viewport: блок и gate читаемы, тап «Показать» работает

## Вне среза

Полный polish spoiler gate → `bd-azl.4`. Порядок чтения → `bd-azl.3`.
