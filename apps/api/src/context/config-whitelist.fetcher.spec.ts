import { truncateSnippet } from './config-whitelist.fetcher';
import { MAX_SOURCE_SNIPPET_LENGTH } from './context.constants';

describe('truncateSnippet', () => {
  it('truncates long text to max snippet length', () => {
    const longEssay = 'A'.repeat(2000);
    const result = truncateSnippet(longEssay);
    expect(result.length).toBe(MAX_SOURCE_SNIPPET_LENGTH);
    expect(result).not.toBe(longEssay);
  });
});
