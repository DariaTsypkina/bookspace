import { slugBaseFromEmail } from './slug.util';

describe('slugBaseFromEmail', () => {
  it('uses email local-part as slug base', () => {
    expect(slugBaseFromEmail('Daria.Reader@bookspace.local')).toBe(
      'daria-reader',
    );
  });

  it('falls back to user for empty local-part', () => {
    expect(slugBaseFromEmail('@bookspace.local')).toBe('user');
  });
});
