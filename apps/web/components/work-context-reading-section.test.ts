import { describe, expect, it } from 'vitest';
import {
  getWorkContextReadingSectionContent,
  shouldShowWorkContextReadingSection,
} from './work-context-reading-section';

describe('WorkContextReadingSection helpers', () => {
  const items = [
    {
      recommendedWork: { slug: 'hobbit', titleRu: 'Хоббит' },
      importanceRank: 1,
      whyText: 'Вводит в мир фэнтези.',
    },
    {
      recommendedWork: { slug: 'silmarillion', titleRu: 'Сильмариллион' },
      importanceRank: 2,
      whyText: 'Расширяет предысторию.',
    },
  ];

  it('hides section when there are no items', () => {
    expect(shouldShowWorkContextReadingSection([])).toBe(false);
    expect(getWorkContextReadingSectionContent([])).toBeNull();
  });

  it('shows section with disclaimer and items sorted by API order', () => {
    expect(shouldShowWorkContextReadingSection(items)).toBe(true);

    const content = getWorkContextReadingSectionContent(items);

    expect(content).not.toBeNull();
    expect(content?.heading).toBe('Для понимания');
    expect(content?.disclaimer).toMatch(/автоматически/i);
    expect(content?.items).toHaveLength(2);
    expect(content?.items[0]?.titleRu).toBe('Хоббит');
    expect(content?.items[0]?.whyText).toBe('Вводит в мир фэнтези.');
    expect(content?.items[1]?.titleRu).toBe('Сильмариллион');
  });

  it('does not include source URLs in section content', () => {
    const content = getWorkContextReadingSectionContent(items);

    expect(JSON.stringify(content)).not.toMatch(/https?:\/\//);
    expect(JSON.stringify(content)).not.toMatch(/sourceUrl/);
  });
});
