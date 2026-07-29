# UI typography (Baskerville)

## Для агентов

В Bookspace **единственный** UI-шрифт — **Baskerville** (с кириллицей). Не предлагать и не подключать Roboto, Inter, Geist, Google Fonts или другой typeface без явной задачи человека. Токены: `--font-baskerville`, Tailwind `font-sans`. Файлы: `apps/web/fonts/Baskerville-*.woff2`. Layout: `apps/web/app/layout.tsx` (`next/font/local`). Form controls (`button`/`input`/…) часто не наследуют `font-family` с `body` — на примитивах `components/ui` задавать `font-sans` или `inherit`.

## Цель

Единый UI-шрифт Bookspace: **Baskerville** (кириллица) через `next/font/local` (self-host woff2), начертания roman / italic / bold / bolditalic (веса 400 / 700).

## Акторы

Гость, user, admin (весь UI).

## User flow

1. Открыть любой экран приложения
2. Текст body, заголовки и компоненты рендерятся шрифтом Baskerville
3. Без зависимости от CDN fonts.googleapis.com в runtime

## Данные

Нет; только фронтенд-токены (`--font-baskerville`, Tailwind `font-sans`). Файлы: `apps/web/fonts/Baskerville-*.woff2`.

## API / jobs

Нет.

## Края и ошибки

- FOIT/FOUT: `display: 'swap'`
- Offline / PWA: шрифт в билде Next, не внешний CDN
- Нет medium (500): Tailwind `font-medium` → 400 (без faux-bold)
- Кириллица в тех же woff2-файлах

## Критерии приёмки

- [x] Baskerville через `next/font/local` (woff2: roman, italic, bold, bolditalic)
- [x] Корневой layout + CSS/Tailwind `font-sans` на Baskerville; Roboto/Georgia не основные
- [x] Нет runtime `<link>` на fonts.googleapis.com
- [x] Smoke home / nav / login без регрессий layout; кириллица в Baskerville

## Ссылки

- ADR [0003](../adr/0003-tailwind-shadcn.md)
- [stack-and-architecture](../tech/stack-and-architecture.md)
- Issue: `bd-23j` (ранее `bd-82j` Roboto)
