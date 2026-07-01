import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildChemicalIdentityTooltip,
  ENRICHMENT_PARTIAL_WARNING,
  hasExternalChemicalIdentity,
} from './risk-subtype-curation-ai-display.utils';

test('modal indica fonte externa quando chemicalIdentity presente', () => {
  assert.equal(
    hasExternalChemicalIdentity({
      chemicalIdentity: { sources: ['PUBCHEM'], title: 'o-Xylene' },
    }),
    true,
  );
  assert.equal(hasExternalChemicalIdentity({}), false);
});

test('tooltip mostra dados técnicos sem poluir', () => {
  const tooltip = buildChemicalIdentityTooltip({
    sources: ['PUBCHEM'],
    title: 'Naphthalene',
    molecularFormula: 'C10H8',
    classHints: ['aromatic hydrocarbon'],
    matchedBy: 'CAS',
  });
  assert.match(tooltip, /Naphthalene/);
  assert.match(tooltip, /C10H8/);
});

test('warning global de enrichment parcial', () => {
  assert.match(
    ENRICHMENT_PARTIAL_WARNING,
    /apenas com dados internos/i,
  );
});
