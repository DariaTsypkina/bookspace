# Ручной чеклист: AppNav (`bd-6b7.5`–`.8`)

См. также 5-tab shell: [app-shell-tab-bar.md](./app-shell-tab-bar.md).

## Viewport

- [ ] Узкий (mobile): bottom bar — **только 5 табов** (без Войти/Выйти в меню)
- [ ] Широкий (desktop): top nav — то же

## Гость

- [ ] В меню нет «Войти» / «Выйти»
- [ ] «Профиль» → `/login` (вход там)
- [ ] Пять табов без регресса

## Авторизованный (USER)

- [ ] В меню нет «Выйти»
- [ ] «Профиль» → `/library`; на странице видна «Выйти»
- [ ] Клик «Выйти» → сессия сброшена, `/login`
- [ ] `/u/[slug]` по-прежнему с «Выйти»

## Font-weight (`bd-6b7.6`)

- [ ] DevTools → Computed: у активной и неактивной ссылок одинаковый `font-weight`
- [ ] Active отличим underline / `text-foreground`, не весом

## Hydration (`bd-6b7.7`)

- [ ] Hard reload `/`: console **без** `Hydration failed`

## Прочее

- [ ] `/admin` по-прежнему вне меню
- [ ] Logout только через BFF `POST /api/auth/logout`
