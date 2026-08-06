# Manual: shadcn Select (bd-a12.2)

Чеклист для человека. Агент гоняет Playwright smoke; здесь — визуальная/ручная проверка.

## Desktop

1. `/library` (авторизован): открыть «Статус» → список Radix (не native), Baskerville, выбрать «Читаю» → «Сохранить в библиотеку» → «Статус сохранён».
2. `/books/garri-potter-filosofskiy-kamen`: блок «В моей библиотеке» → Select статуса + оценка → «Сохранить» → успех.

## Mobile (~393×852)

1. Те же шаги: Trigger кликабелен, Content не обрезается viewport’ом, шрифт Baskerville на Trigger/пунктах.

## Негатив / конвенция

1. В DevTools / исходниках форм нет `<select>` (только `SelectTrigger` / combobox).
2. Новый экран с выпадающим списком — только `@/components/ui/select`.
