# PWA: установка

## Цель

Manifest и установка на домашний экран.

## Акторы

Гость, user (mobile).

## User flow

1. Открыть сайт на телефоне
2. Install / Add to Home Screen
3. Открыть с иконки

## Данные

Web app manifest (name, icons, display, start_url).

## API / jobs

Статика Next; без отдельного Nest API.

## Края и ошибки

iOS ограничен — документировать Add to Home Screen.

## Критерии приёмки

- [ ] Manifest валиден
- [ ] Приложение устанавливается на Android Chrome
- [ ] Иконка открывает shell

## Ссылки

[screens](../tech/screens.md)
