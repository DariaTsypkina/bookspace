import { type CatalogSearchResultItem } from '@/lib/catalog-search';

export type WorkSuggestion = {
  id: string;
  slug: string;
  title: string;
};

type ResolvePayloadArgs = {
  inputValue: string;
  selectedWork: WorkSuggestion | null;
};

export function getWorkSuggestions(
  items: CatalogSearchResultItem[],
): WorkSuggestion[] {
  return items
    .filter((item) => item.type === 'WORK')
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
    }));
}

export function resolveWorkSelectionPayload({
  inputValue,
  selectedWork,
}: ResolvePayloadArgs): {
  workSlug: string | undefined;
  workId: string | undefined;
} {
  const trimmedValue = inputValue.trim();

  if (!trimmedValue) {
    return {
      workSlug: undefined,
      workId: undefined,
    };
  }

  if (selectedWork && selectedWork.title === trimmedValue) {
    return {
      workSlug: selectedWork.slug,
      workId: selectedWork.id,
    };
  }

  return {
    workSlug: trimmedValue,
    workId: undefined,
  };
}
