import { filterPublicNotes } from './public-notes';

describe('filterPublicNotes (bd-cq7.5)', () => {
  it('returns only PUBLIC notes; PRIVATE never leak', () => {
    const result = filterPublicNotes([
      {
        id: '1',
        type: 'NOTE',
        body: 'публичная',
        visibility: 'PUBLIC',
        workSlug: 'work-a',
      },
      {
        id: '2',
        type: 'QUOTE',
        body: 'секрет',
        visibility: 'PRIVATE',
        workSlug: 'work-a',
      },
      {
        id: '3',
        type: 'NOTE',
        body: 'ещё публичная',
        visibility: 'PUBLIC',
        pageRef: '42',
      },
    ]);

    expect(result).toEqual([
      {
        id: '1',
        type: 'NOTE',
        body: 'публичная',
        workSlug: 'work-a',
      },
      {
        id: '3',
        type: 'NOTE',
        body: 'ещё публичная',
        pageRef: '42',
      },
    ]);
    expect(result.every((n) => !('visibility' in n))).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/секрет|PRIVATE/i);
  });

  it('returns empty array when no notes', () => {
    expect(filterPublicNotes([])).toEqual([]);
  });
});
