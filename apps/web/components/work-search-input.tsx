'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { fetchCatalogSearch } from '@/lib/catalog-search';
import { getWorkSuggestions, type WorkSuggestion } from '@/lib/work-search';
import { Input } from '@/components/ui/input';

type WorkSearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onWorkSelect: (work: WorkSuggestion) => void;
  ariaLabel: string;
  placeholder: string;
};

export function WorkSearchInput({
  value,
  onValueChange,
  onWorkSelect,
  ariaLabel,
  placeholder,
}: WorkSearchInputProps) {
  const [suggestions, setSuggestions] = useState<WorkSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const listId = useId();

  const hasValue = value.trim().length > 0;
  const shouldShowSuggestions = hasValue && suggestions.length > 0;

  useEffect(() => {
    if (!hasValue) {
      setSuggestions([]);
      setErrorMessage(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        const result = await fetchCatalogSearch(value);
        setSuggestions(getWorkSuggestions(result.items));
        setErrorMessage(null);
      } catch {
        setSuggestions([]);
        setErrorMessage('Не удалось загрузить подсказки поиска');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasValue, value]);

  const helperText = useMemo(() => {
    if (!hasValue) {
      return 'Введите название книги или slug.';
    }
    if (loading) {
      return 'Ищем произведения…';
    }
    if (errorMessage) {
      return errorMessage;
    }
    if (suggestions.length === 0) {
      return 'Совпадений не найдено. Можно ввести slug вручную.';
    }
    return 'Выберите произведение из подсказок или используйте slug.';
  }, [errorMessage, hasValue, loading, suggestions.length]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        autoComplete="off"
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-controls={listId}
        aria-expanded={shouldShowSuggestions}
      />
      <p className="text-xs text-muted" role="status">
        {helperText}
      </p>
      {shouldShowSuggestions ? (
        <ul
          id={listId}
          aria-label="Подсказки произведений"
          className="m-0 flex list-none flex-col gap-1 rounded-md border border-border bg-surface p-2"
        >
          {suggestions.slice(0, 5).map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="w-full rounded-sm px-2 py-1 text-left text-sm text-foreground hover:bg-muted"
                onClick={() => onWorkSelect(suggestion)}
              >
                {suggestion.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
