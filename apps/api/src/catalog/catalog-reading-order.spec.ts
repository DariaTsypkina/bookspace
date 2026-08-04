import { buildReadingOrderSteps } from './catalog-reading-order';

describe('buildReadingOrderSteps', () => {
  it('assigns sequential steps and sorts by order then titleRu then slug', () => {
    expect(
      buildReadingOrderSteps([
        { slug: 'b', titleRu: 'Бета', order: 1 },
        { slug: 'a', titleRu: 'Альфа', order: 1 },
        { slug: 'c', titleRu: 'Гамма', order: 2 },
      ]),
    ).toEqual([
      { step: 1, slug: 'a', titleRu: 'Альфа' },
      { step: 2, slug: 'b', titleRu: 'Бета' },
      { step: 3, slug: 'c', titleRu: 'Гамма' },
    ]);
  });

  it('dedupes by slug so cycles cannot produce duplicates', () => {
    expect(
      buildReadingOrderSteps([
        { slug: 'a', titleRu: 'А', order: 1 },
        { slug: 'b', titleRu: 'Б', order: 2 },
        { slug: 'a', titleRu: 'А', order: 3 },
      ]),
    ).toEqual([
      { step: 1, slug: 'b', titleRu: 'Б' },
      { step: 2, slug: 'a', titleRu: 'А' },
    ]);
  });
});
