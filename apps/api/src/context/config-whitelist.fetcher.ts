import { Injectable } from '@nestjs/common';
import {
  CONTEXT_WHITELIST_DOMAINS,
  MAX_SOURCE_SNIPPET_LENGTH,
} from './context.constants';
import type {
  WhitelistFetcher,
  WhitelistSource,
} from './context-whitelist.fetcher';

function truncateSnippet(text: string): string {
  if (text.length <= MAX_SOURCE_SNIPPET_LENGTH) {
    return text;
  }
  return text.slice(0, MAX_SOURCE_SNIPPET_LENGTH);
}

function buildWhitelistUrl(domain: string, titleRu: string): string {
  const slug = encodeURIComponent(titleRu.replace(/\s+/g, '_'));
  return `https://${domain}/wiki/${slug}`;
}

@Injectable()
export class ConfigWhitelistFetcher implements WhitelistFetcher {
  fetchForWork(input: {
    titleRu: string;
    titleOrig?: string | null;
  }): Promise<WhitelistSource[]> {
    const title = input.titleRu.trim();
    if (!title) {
      return Promise.resolve([]);
    }

    return Promise.resolve(
      CONTEXT_WHITELIST_DOMAINS.map((domain) => ({
        url: buildWhitelistUrl(domain, title),
        snippet: truncateSnippet(`Краткая справка из ${domain} о «${title}».`),
      })),
    );
  }
}

export { truncateSnippet };
