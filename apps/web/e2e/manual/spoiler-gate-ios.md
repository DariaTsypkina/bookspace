# Ручной чеклист: Spoiler gate (bd-azl.5 / bd-azl.4)

## Prefight

- [ ] `api` + `web` запущены
- [ ] Очистить cookie `spoilers_ok` и `localStorage.spoilers_ok` (или приватное окно)

## Desktop

- [ ] `/characters/garri-potter` (или иной со связями): видно «Могут быть спойлеры», связей нет
- [ ] «Показать» → связи видны сразу, предупреждение скрыто
- [ ] Reload → связи остаются открытыми (`spoilers_ok=1` в cookie)

## iOS Chrome (iPhone) — регресс bd-azl.5

- [ ] Открыть страницу со spoiler gate
- [ ] Тап «Показать» → контент раскрывается **без** перезагрузки
- [ ] Reload → согласие сохранено (cookie и/или localStorage)
- [ ] При блокировке cookie: после «Показать» UI всё равно открыт; после reload gate не возвращается за счёт storage

## Не регресс

- [ ] GuestOnly / AppNav (Профиль) работают как после bd-cq7.6
