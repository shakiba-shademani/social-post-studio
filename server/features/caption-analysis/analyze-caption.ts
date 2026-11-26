export type CaptionAnalysis = {
  characters: number;
  words: number;
  hashtags: { total: number; unique: string[]; duplicates: string[] };
  links: { total: number; domains: string[] };
  tips: string[];
};

// Counts visible Unicode characters rather than UTF-16 code units (e.g. emoji).
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function analyzeCaption(text: string, platformId: number): CaptionAnalysis {
  const linkMatches = [...text.matchAll(/\bhttps?:\/\/[^\s<>]+|\bwww\.[^\s<>]+/giu)];
  const domains = new Set<string>();
  for (const match of linkMatches) {
    const candidate = match[0].replace(/[.,!?;:،؛؟)\]}]+$/u, '');
    try {
      domains.add(new URL(candidate.startsWith('www.') ? `https://${candidate}` : candidate).hostname.toLowerCase());
    } catch {
      // Invalid URLs are not counted as links.
    }
  }
  const validLinks = linkMatches.filter(match => {
    const candidate = match[0].replace(/[.,!?;:،؛؟)\]}]+$/u, '');
    try { return Boolean(new URL(candidate.startsWith('www.') ? `https://${candidate}` : candidate).hostname); }
    catch { return false; }
  });
  // Exclude URLs so a URL fragment is not mistaken for a hashtag.
  const withoutLinks = text.replace(/\bhttps?:\/\/[^\s<>]+|\bwww\.[^\s<>]+/giu, ' ');
  const tags = [...withoutLinks.matchAll(/(?<![\p{L}\p{N}_#])#[\p{L}\p{M}\p{N}_\u200c]+/gu)].map(match => match[0]);
  const unique = new Map<string, string>();
  const duplicates = new Map<string, string>();
  for (const tag of tags) {
    const key = tag.normalize('NFKC').toLocaleLowerCase('und');
    if (unique.has(key)) duplicates.set(key, unique.get(key)!);
    else unique.set(key, tag);
  }
  const tips: string[] = [];
  if (duplicates.size) tips.push('Remove repeated hashtags to keep the caption focused.');
  if (platformId === 1 && text.trim()) {
    if (!tags.length) tips.push('Consider adding relevant hashtags so people can discover your topic.');
    else tips.push('Choose hashtags that are relevant to the post and its audience.');
    if (validLinks.length) tips.push('Check how links work for your Instagram post format; consider directing readers to your profile link.');
  }
  return {
    characters: [...segmenter.segment(text)].length,
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    hashtags: { total: tags.length, unique: [...unique.values()], duplicates: [...duplicates.values()] },
    links: { total: validLinks.length, domains: [...domains] },
    tips,
  };
}
