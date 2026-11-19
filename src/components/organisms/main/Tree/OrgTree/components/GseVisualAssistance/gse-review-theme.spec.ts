import assert from 'node:assert/strict';
import { getContrastRatio } from '@mui/material/styles';
import { REVIEW_COLORS } from './gse-integrated-review.model';
import { gseReviewTone } from './gse-review-theme';
for (const tone of Object.values(REVIEW_COLORS)) {
  assert.equal(gseReviewTone(tone, 'light'), tone);
  const dark = gseReviewTone(tone, 'dark');
  const values = dark.background.match(/[\d.]+/g)!.map(Number);
  const base = [27, 34, 46],
    a = values[3];
  const background = `rgb(${base.map((v, i) => Math.round(values[i] * a + v * (1 - a))).join(',')})`;
  assert.ok(
    getContrastRatio(dark.color, background) >= 4.5,
    `${dark.color} must contrast on its translucent card`,
  );
}
console.log(
  'GSE dark tones: all text/accent combinations exceed 4.5:1, light tones preserved',
);
