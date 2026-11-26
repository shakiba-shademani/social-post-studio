// Turn inline Markdown links into text that can be copied to social platforms.
// Keep both the label and destination when they are different.
export function normalizeCaptionLinks(text: string): string {
  return text.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/giu, (_match, label: string, url: string) =>
    label === url ? url : `${label} ${url}`,
  );
}

export function extractLinks(text: string): { domains: string[]; total: number; withoutLinks: string } {
  const domains = new Set<string>();
  let total = 0;
  const normalized = normalizeCaptionLinks(text);
  const withoutLinks = normalized.replace(/\b(?:https?:\/\/|www\.)[^\s<>\[\]()]+/giu, match => {
    const candidate = match.replace(/[.,!?;:،؛؟]+$/u, '');
    try {
      const url = new URL(/^www\./iu.test(candidate) ? `https://${candidate}` : candidate);
      if (!url.hostname) return match;
      domains.add(url.hostname.toLowerCase());
      total += 1;
      return ' ';
    } catch {
      return match;
    }
  });
  return { domains: [...domains], total, withoutLinks };
}
