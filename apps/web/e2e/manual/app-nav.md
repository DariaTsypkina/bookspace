# Ручной чеклист: AppNav (`bd-6b7.5` + `bd-6b7.6` + `bd-6b7.7`)

См. также 5-tab shell: [app-shell-tab-bar.md](./app-shell-tab-bar.md).

## Viewport

- [ ] Узкий (mobile): bottom bar — 5 табов + «Войти» (гость) или «Выйти» (user); auth **остаётся видимой** после загрузки (не flash)
- [ ] Широкий (desktop): top nav — то же; «Войти»/«Выйти» справа (`md:ml-auto`)

## Гость

- [ ] В `aria-label="Основное меню"` видна ссылка «Войти» → `/login`
- [ ] «Выйти» нет
- [ ] Пять табов без регресса; «Профиль» → `/login`

## Авторизованный (USER)

- [ ] В меню видна кнопка «Выйти»; «Войти» нет
- [ ] «Профиль» → `/library`
- [ ] Клик «Выйти» → сессия сброшена, `/login`, снова видно «Войти»

## Font-weight (`bd-6b7.6`)

- [ ] DevTools → Computed: у активной («Главная») и неактивной («Поиск») ссылок одинаковый `font-weight`
- [ ] Active отличим underline / `text-foreground`, не весом
- [ ] «Войти»/«Выйти» визуально того же веса, что табы
- [ ] Mobile + desktop

## Hydration (`bd-6b7.7`)

- [ ] Hard reload `/`: console **без** `Hydration failed`
- [ ] «Войти» не исчезает через ~1s после загрузки

## Прочее

- [ ] `/admin` по-прежнему вне меню
- [ ] Logout только через BFF `POST /api/auth/logout` (не отдельный endpoint)
