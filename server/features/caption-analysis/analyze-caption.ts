import { extractLinks } from './links.ts';

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
  const links = extractLinks(text);
  const tags = [...links.withoutLinks.matchAll(/(?<![\p{L}\p{N}_#])#[\p{L}\p{M}\p{N}_\u200c]+/gu)].map(match => match[0]);
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
    if (links.total) tips.push('Check how links work for your Instagram post format; consider directing readers to your profile link.');
  }
  return {
    characters: [...segmenter.segment(text)].length,
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    hashtags: { total: tags.length, unique: [...unique.values()], duplicates: [...duplicates.values()] },
    links: { total: links.total, domains: links.domains },
    tips,
  };
}
