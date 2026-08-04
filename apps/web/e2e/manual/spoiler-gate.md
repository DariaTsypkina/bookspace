# Ручной чеклист: Spoiler gate (bd-azl.4)

См. также iOS-регресс: [spoiler-gate-ios.md](./spoiler-gate-ios.md).

## Prefight

- [ ] `api` + `web` запущены
- [ ] Очистить cookie `spoilers_ok` и `localStorage.spoilers_ok` (или приватное окно)

## Desktop — критерии приёмки

- [ ] `/characters/garri-potter`: видно «Могут быть спойлеры», связей (Гермиона и др.) нет
- [ ] «Показать» → связи видны сразу, предупреждение скрыто
- [ ] DevTools → Application: cookie `spoilers_ok=1`, Path `/`, SameSite=Lax, Max-Age ≈ 30 дней (2592000); на HTTPS — Secure
- [ ] `localStorage.spoilers_ok === "1"`
- [ ] Reload → связи остаются открытыми (согласие сохранено)

## Surfaces (регресс эпика bd-azl)

- [ ] `/books/garri-potter-filosofskiy-kamen` без согласия: gate; после «Показать» — «Связи» и «Порядок чтения»
- [ ] `/series/garri-potter` без согласия: gate; после «Показать» — «Порядок чтения» (Шаг N)

## Mobile viewport

- [ ] Gate читаем, кнопка «Показать» тапабельна
- [ ] После accept + reload согласие сохраняется

## Не регресс

- [ ] Character / work-relations / reading-order smokes зелёные
- [ ] iOS Chrome — по [spoiler-gate-ios.md](./spoiler-gate-ios.md)
