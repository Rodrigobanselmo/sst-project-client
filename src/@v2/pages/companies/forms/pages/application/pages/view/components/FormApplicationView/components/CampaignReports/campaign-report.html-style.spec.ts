import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeReportSnapshotProperty as normalize } from './campaign-report.html-style.ts';

test('HTML tracks and inline labels are independent of the exporting viewport', () => {
  const cell = { html: true, inlineWidth: '' };
  for (const measured of ['140px', '490px', '1830px']) {
    assert.equal(normalize('width', measured, cell), 'auto');
    assert.equal(normalize('flex-basis', measured, cell), 'auto');
  }
  assert.equal(
    normalize('width', '245px', { html: true, inlineWidth: '35%' }),
    '35%',
  );
});

test('grid tracks may shrink below their measured content width', () => {
  assert.equal(
    normalize('grid-template-columns', '490px 810.5px 104px', {
      html: true,
      inlineWidth: '',
    }),
    'minmax(0,490fr) minmax(0,810.5fr) minmax(0,104fr)',
  );
});

test('SVG geometry preserves the proportions of zero, partial and full bars', () => {
  const svg = { html: false, inlineWidth: '' };
  for (const width of ['0px', '94.4px', '400px'])
    assert.equal(normalize('width', width, svg), width);
  assert.equal(normalize('fill', '#229b61', svg), '#229b61');
});
