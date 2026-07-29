# UI typography (Roboto)

## Цель

Единый UI-шрифт Bookspace: **Roboto** (Google Fonts) через `next/font/google` (self-host), веса 400 / 500 / 700.

## Акторы

Гость, user, admin (весь UI).

## User flow

1. Открыть любой экран приложения
2. Текст body, заголовки и компоненты рендерятся шрифтом Roboto
3. Без зависимости от CDN fonts.googleapis.com в runtime

## Данные

Нет; только фронтенд-токены (`--font-roboto`, Tailwind `font-sans`).

## API / jobs

Нет.

## Края и ошибки

- FOIT/FOUT: `display: 'swap'`
- Offline / PWA: шрифт в билде Next, не внешний CDN
- Подмножества: `cyrillic` + `latin` (RU UI)

## Критерии приёмки

- [x] Roboto через `next/font/google`, веса 400 / 500 / 700
- [x] Корневой layout + CSS/Tailwind `font-sans` на Roboto; Georgia не основной
- [x] Нет runtime `<link>` на fonts.googleapis.com
- [x] Smoke home / nav / login без регрессий layout

## Ссылки

- ADR [0003](../adr/0003-tailwind-shadcn.md)
- [stack-and-architecture](../tech/stack-and-architecture.md)
- Issue: `bd-82j`
