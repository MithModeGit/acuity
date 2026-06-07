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

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
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
