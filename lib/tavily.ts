import type { TavilyResult } from './types';

/**
 * Tavily Search client. Server-side only — never import from a client
 * component. Returns raw, unsynthesized search results, which is the entire
 * point of the comparison: Tavily gives a list of pages, Exa gives a
 * structured, cited brief.
 */

interface TavilyApiResponse {
  results?: TavilyResult[];
  answer?: string;
}

export async function tavilySearch(companyName: string): Promise<TavilyApiResponse> {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not set.');
  }

  // Auth: the current Tavily API accepts the bearer header (verified working),
  // but we also pass api_key in the body for compatibility with the older
  // request format — belt-and-suspenders so a Tavily API change can't silently
  // break the comparison panel.
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: `${companyName} company investment research competitive analysis recent news`,
      search_depth: 'advanced',
      max_results: 10,
      include_answer: true,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status}`);
  }

  return response.json() as Promise<TavilyApiResponse>;
}
