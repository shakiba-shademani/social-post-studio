import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { analyzeCaption } from './analyze-caption.ts';

test('counts visible characters and Persian hashtags without URL fragments', () => {
  const result = analyzeCaption('☕️ #کافه_گردی #قهوه #قهوه https://example.com/page#fragment', 1);
  assert.equal(result.characters, [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment('☕️ #کافه_گردی #قهوه #قهوه https://example.com/page#fragment')].length);
  assert.deepEqual(result.hashtags.unique, ['#کافه_گردی', '#قهوه']);
  assert.deepEqual(result.hashtags.duplicates, ['#قهوه']);
  assert.equal(result.hashtags.total, 3);
  assert.equal(result.links.total, 1);
  assert.deepEqual(result.links.domains, ['example.com']);
});

test('recognizes repeated tags case-insensitively and counts links independently', () => {
  const result = analyzeCaption('#Coffee #coffee www.example.com/a, https://example.com/b!', 2);
  assert.deepEqual(result.hashtags.duplicates, ['#Coffee']);
  assert.equal(result.links.total, 2);
  assert.deepEqual(result.links.domains, ['www.example.com', 'example.com']);
  assert.equal(result.tips.length, 1);
});

test('empty captions do not receive Instagram tips', () => {
  const result = analyzeCaption(' ', 1);
  assert.equal(result.words, 0);
  assert.deepEqual(result.tips, []);
});
