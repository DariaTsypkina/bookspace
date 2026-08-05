import { describe, expect, it } from 'vitest';
import { type CatalogSearchResultItem } from '@/lib/catalog-search';
import {
  getWorkSuggestions,
  resolveWorkSelectionPayload,
} from '@/lib/work-search';

const SEARCH_ITEMS: CatalogSearchResultItem[] = [
  {
    type: 'WORK',
    id: 'work-hp2',
    slug: 'garri-potter-taynaya-komnata',
    title: 'Гарри Поттер и Тайная комната',
    path: '/books/garri-potter-taynaya-komnata',
  },
  {
    type: 'AUTHOR',
    id: 'author-rowling',
    slug: 'dzhoan-rouling',
    title: 'Джоан Роулинг',
    path: '/authors/dzhoan-rouling',
  },
];

describe('work search helpers', () => {
  it('returns only WORK suggestions for library forms', () => {
    expect(getWorkSuggestions(SEARCH_ITEMS)).toEqual([
      {
        id: 'work-hp2',
        slug: 'garri-potter-taynaya-komnata',
        title: 'Гарри Поттер и Тайная комната',
      },
    ]);
  });

  it('uses selected work id/slug when title was chosen', () => {
    expect(
      resolveWorkSelectionPayload({
        inputValue: 'Гарри Поттер и Тайная комната',
        selectedWork: {
          id: 'work-hp2',
          slug: 'garri-potter-taynaya-komnata',
          title: 'Гарри Поттер и Тайная комната',
        },
      }),
    ).toEqual({
      workId: 'work-hp2',
      workSlug: 'garri-potter-taynaya-komnata',
    });
  });

  it('falls back to manual slug when no selected work exists', () => {
    expect(
      resolveWorkSelectionPayload({
        inputValue: 'garri-potter-filosofskiy-kamen',
        selectedWork: null,
      }),
    ).toEqual({
      workId: undefined,
      workSlug: 'garri-potter-filosofskiy-kamen',
    });
  });
});
