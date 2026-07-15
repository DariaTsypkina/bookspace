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

## Критерии приёмки

- [ ] Мутации библиотеки требуют сессии
- [ ] Admin API отвергает USER
- [ ] Logout инвалидирует доступ

## Ссылки

[stack](../tech/stack-and-architecture.md), [admin-dashboard](admin-dashboard.md)
