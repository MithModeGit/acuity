/** Extract a clean hostname (without a leading "www.") from a URL.
 *  Falls back to the raw string if the URL can't be parsed. */
export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
