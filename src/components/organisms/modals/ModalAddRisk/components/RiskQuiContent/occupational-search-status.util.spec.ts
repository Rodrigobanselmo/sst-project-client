/**
 * Testes leves (node assert) — sem runner configurado no client.
 * Executar: npx ts-node --compiler-options '{"module":"commonjs"}' ...
 * ou via import em scripts locais.
 */
import assert from 'assert';

import {
  formatOccupationalSearchStatusLabel,
  parseOccupationalSearchAudit,
} from './occupational-search-status.util';
import type { ChemicalOccupationalSearchAudit } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

const baseAudit = (
  status: ChemicalOccupationalSearchAudit['status'],
): ChemicalOccupationalSearchAudit => ({
  v: 1,
  status,
  searchedAt: '2026-08-11T15:00:00.000Z',
  cas: '630-20-6',
  sourcesConsulted: ['NIOSH_POCKET_GUIDE', 'OSHA_OCCUPATIONAL_CHEMICAL_DB'],
  providers: [
    { provider: 'NIOSH_POCKET_GUIDE', outcome: 'MISS', reason: 'miss' },
    {
      provider: 'OSHA_OCCUPATIONAL_CHEMICAL_DB',
      outcome: 'MISS',
      reason: 'miss',
    },
  ],
  summary: {
    hasAnyLimit: status === 'FOUND' || status === 'REVIEW_REQUIRED',
    unitReviewRequired: status === 'REVIEW_REQUIRED',
    message:
      status === 'NOT_FOUND'
        ? 'Nenhum limite localizado nas fontes consultadas.'
        : null,
  },
});

assert.strictEqual(
  formatOccupationalSearchStatusLabel(null),
  'Nenhuma pesquisa registrada',
);

assert.ok(
  formatOccupationalSearchStatusLabel(baseAudit('NOT_FOUND')).includes(
    'nenhum limite localizado',
  ),
);
assert.ok(
  formatOccupationalSearchStatusLabel(baseAudit('FOUND')).includes(
    'limites encontrados',
  ),
);
assert.ok(
  formatOccupationalSearchStatusLabel(baseAudit('REVIEW_REQUIRED')).includes(
    'revisão necessária',
  ),
);
assert.ok(
  formatOccupationalSearchStatusLabel(baseAudit('INCOMPLETE')).includes(
    'pesquisa incompleta',
  ),
);

const parsed = parseOccupationalSearchAudit({
  ipvs: { unit: 'ppm' },
  occupationalSearch: baseAudit('NOT_FOUND'),
});
assert.strictEqual(parsed?.status, 'NOT_FOUND');
assert.strictEqual(parsed?.cas, '630-20-6');

console.log('occupational-search-status.util.spec: ok');
