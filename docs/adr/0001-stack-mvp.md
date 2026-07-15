# ADR 0001: Стек MVP

- **Статус:** accepted
- **Дата:** 2026-07-15

## Контекст

Нужны раздельный frontend и backend, SEO/PWA, admin API, фоновые импорты/рейтинги/LLM, PostgreSQL. Старт — local, без привязки к облаку.

## Решение

- Frontend: **Next.js + TypeScript**
- Backend: **NestJS + TypeScript + Prisma + PostgreSQL** (+ FTS)
- Jobs: **BullMQ + Redis**
- Auth: **на Nest** (credentials + Google + Yandex), cookie/JWT для Next
- LLM: **OpenAI** через `LlmProvider`
- Admin UI в Next, авторизация на API
- Deploy: Docker Compose локально; cloud — отдельным ADR позже

## Последствия

- Плюсы: чёткое разделение UI/API, один язык TS, зрелые паттерны Nest для модулей и очередей.
- Минусы: два деплоя и CORS/cookie нужно спроектировать аккуратно (предпочитаем BFF-proxy в Next на API routes).
- Redis обязателен уже на MVP из‑за BullMQ.
