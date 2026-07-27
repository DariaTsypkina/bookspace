export const WHITELIST_FETCHER = Symbol('WHITELIST_FETCHER');

export interface WhitelistSource {
  url: string;
  snippet: string;
}

export interface WhitelistFetcher {
  fetchForWork(input: {
    titleRu: string;
    titleOrig?: string | null;
  }): Promise<WhitelistSource[]>;
}
