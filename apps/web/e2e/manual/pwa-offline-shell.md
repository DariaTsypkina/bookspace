# Ручной чеклист: PWA offline shell (bd-6b7.2)

## Prefight

- [ ] `api` + `web` запущены (localhost ок для SW)
- [ ] Открыть сайт в Chrome (desktop или mobile)
- [ ] DevTools → Application → Service Workers: зарегистрирован `/sw.js`, status activated

## Online → offline (shell / recent)

- [ ] Online: открыть Главную `/`, затем Поиск `/search` (и при желании одну карточку книги)
- [ ] DevTools → Network → Offline (или выключить сеть)
- [ ] Reload Главной: не white-screen; видна навигация и/или контент shell/recent
- [ ] Открыть ранее посещённый `/search`: по возможности из Cache Storage (recent)

## Fallback `/offline`

- [ ] Offline: перейти на URL, который не открывали online (например `/books/unknown-offline-slug`)
- [ ] Видна страница «Нет сети» (русский UI) и ссылка «На главную»
- [ ] Нет пустого белого экрана

## Инварианты MVP

- [ ] Каталог целиком не кэшируется: в Application → Cache Storage нет массового списка `/books/*` без визитов
- [ ] Precache shell: `/`, `/offline`, иконки, manifest (имена кэшей `bookspace-shell-v1` / `bookspace-recent-v1`)
- [ ] Мутации библиотеки offline не ставятся в очередь (явное «нет сети» — вне scope этой задачи UI)

## Автопроверка

```bash
pnpm --filter web test -- lib/pwa/offline-cache-policy.test.ts lib/pwa/register-sw.test.ts app/offline-page.test.ts
pnpm --filter web exec playwright test e2e/smoke/pwa-offline-shell.spec.ts --project=chromium-desktop --project=chromium-mobile
```
