# Цель чтения на год

## Цель

Задать N книг на год и видеть прогресс; на профиле — только с разрешения.

## Акторы

User; гости — если showOnProfile.

## User flow

1. `/library/goal` задать targetCount
2. Включить/выключить показ на профиле
3. Прогресс растёт от READ в текущем году

## Данные

ReadingGoal (userId, year, targetCount) + флаг публикации прогресса (поле на goal или User settings).

## API / jobs

Upsert goal; aggregate progress; public profile читает флаг.

## Края и ошибки

Смена года — новая цель. READ без finishedAt — fallback даты перехода в READ.

## Критерии приёмки

- [ ] Цель сохраняется
- [ ] Прогресс корректен
- [ ] Без тумблера прогресс скрыт на профиле
- [ ] С тумблером — виден

## Ссылки

[database-schema](../tech/database-schema.md), [public-profile](public-profile.md)
