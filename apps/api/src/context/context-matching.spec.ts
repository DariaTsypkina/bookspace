import {
  findBestWorkMatch,
  normalizeTitle,
  titleSimilarity,
} from './context-matching';

describe('context-matching', () => {
  it('normalizes titles', () => {
    expect(normalizeTitle('  Crime & Punishment!  ')).toBe('crime punishment');
  });

  it('scores exact match as 1', () => {
    expect(titleSimilarity('Записки из подполья', 'Записки из подполья')).toBe(
      1,
    );
  });

  it('finds best work on high-confidence title match', () => {
    const match = findBestWorkMatch(
      { title: 'Notes from Underground', year: 1864 },
      [
        {
          id: 'w1',
          titleRu: 'Записки из подполья',
          titleOrig: 'Notes from Underground',
          yearFirst: 1864,
        },
      ],
      0.92,
    );

    expect(match?.work.id).toBe('w1');
    expect(match?.score).toBeGreaterThanOrEqual(0.92);
  });
});
