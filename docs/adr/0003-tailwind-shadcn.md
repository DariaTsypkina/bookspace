# ADR 0003: UI-слой Tailwind + shadcn (Radix)

- **Статус:** accepted
- **Дата:** 2026-07-22
- **Accepted:** 2026-07-22 (человек)

## Контекст

Публичный UI и будущая админка живут в `apps/web` на самописном CSS (`globals.css`). Перед фазой админки и ростом числа экранов нужен предсказуемый UI-kit с a11y, без смены «читальня»-эстетики на Material-look. ADR 0001 фиксирует Next.js, но не UI-библиотеку.

Согласовано с человеком (2026-07-22):

- стек целиком: Tailwind + shadcn (Radix) + lucide-react + cva + clsx + tailwind-merge;
- миграция **инкрементальная**;
- декомпозиция: отдельные задачи на foundation, на строку меню, на каждый существующий экран.

## Решение

1. **Стили:** Tailwind CSS в `apps/web`; дизайн-токены («читальня») переносятся из CSS variables `globals.css` в Tailwind theme / CSS variables, совместимые с shadcn.
2. **Компоненты:** shadcn/ui как copy-in-repo (`components/ui`), поверх Radix; иконки — **lucide-react**.
3. **Обвязка shadcn:** `class-variance-authority`, `clsx`, `tailwind-merge` (хелпер `cn()`).
4. **Миграция:** legacy CSS живёт до касания экрана/компонента; новый UI и рефактор экрана — только Tailwind + shadcn-примитивы.
5. **Не выбираем:** MUI / Chakra / Ant Design как основной kit.

План: [migration-tailwind-shadcn.md](../tech/migration-tailwind-shadcn.md).

## Последствия

- Плюсы: единый kit для public + admin; a11y из Radix; код компонентов в репозитории; проще агентам и ревью.
- Минусы: новая toolchain (PostCSS/Tailwind); временно два стилевых мира; нужна дисциплина «не плодить новый globals.css».
- Зависимости web — только после явного согласования (уже дано на этот стек); состав Radix-пакетов растёт по мере добавления shadcn-компонентов (`@radix-ui/react-select` для Select — согласовано 2026-08-05, bd-a12.2).
- Выпадающие списки: только `components/ui/select` на `@radix-ui/react-select`; native `<select>` в прод-UI не использовать.
- Смена kit или отказ от Tailwind — новый ADR.
