import { buildPrefixTsQuery } from './catalog-search-query';

describe('buildPrefixTsQuery', () => {
  it('builds single-token prefix query', () => {
    expect(buildPrefixTsQuery('роул')).toBe('роул:*');
  });

  it('builds multi-token AND prefix query', () => {
    expect(buildPrefixTsQuery('гарри поттер')).toBe('гарри:* & поттер:*');
  });

  it('strips punctuation and operators that would break to_tsquery', () => {
    expect(buildPrefixTsQuery('роул! & | :*')).toBe('роул:*');
  });

  it('returns null for blank or punctuation-only input', () => {
    expect(buildPrefixTsQuery('')).toBeNull();
    expect(buildPrefixTsQuery('   ')).toBeNull();
    expect(buildPrefixTsQuery('!!!')).toBeNull();
  });

  it('keeps latin tokens for titleOrig prefix', () => {
    expect(buildPrefixTsQuery('Row')).toBe('Row:*');
  });
});
