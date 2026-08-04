# Сессия и защита маршрутов

## Цель

Cookie/JWT сессия Nest для Next; logout; role checks в т.ч. admin.

## Акторы

User, admin.

## User flow

1. После login иметь authenticated запросы с credentials
2. Logout сбрасывает сессию
3. Non-admin на admin API → 403

## Данные

Session/cookie store; User.role USER|ADMIN.

## API / jobs

Nest guards; Next BFF-proxy предпочтителен для first-party cookie.

## Края и ошибки

Скрытие `/admin` в UI недостаточно без server check.

Mobile Chrome (iOS/Android) может вставлять `__gcruniqueid` / `__gchrome_uniqueid` в `<form>`/`<input>` до гидратации React → hydration mismatch в консоли. В Safari обычно чисто. Это не баг приложения; progressive form POST для login/logout страхует сценарий, когда JS handlers не цепляются.

## Критерии приёмки

- [ ] Мутации библиотеки требуют сессии
- [ ] Admin API отвергает USER
- [ ] Logout инвалидирует доступ

## Ссылки

[stack](../tech/stack-and-architecture.md), [admin-dashboard](admin-dashboard.md)
