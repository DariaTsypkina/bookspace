# PWA: offline shell

## Цель

Service worker: shell + недавно открытые страницы; fallback `/offline`.

## Акторы

Гость, user.

## User flow

1. Посетить страницы online
2. Выключить сеть
3. Открыть shell/recent или `/offline`

## Данные

Cache Storage; не полный каталог.

## API / jobs

SW в web app.

## Края и ошибки

Мутации библиотеки offline — явное «нет сети» в MVP (без sync queue).

## Критерии приёмки

- [ ] Offline не даёт white-screen
- [ ] Recent pages доступны по возможности
- [ ] Каталог целиком не требуется offline

## Ссылки

[screens](../tech/screens.md)
