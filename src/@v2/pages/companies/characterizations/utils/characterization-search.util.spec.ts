/**
 * Executar: npx tsx src/@v2/pages/companies/characterizations/utils/characterization-search.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  characterizationSearchEmptyMessage,
  characterizationSearchErrorMessage,
  shouldResetPageOnSearch,
} from './characterization-search.util';

assert.equal(shouldResetPageOnSearch({ previousPage: 5, nextSearch: 'TIOMIRES' }), true);
assert.equal(shouldResetPageOnSearch({ previousPage: 1, nextSearch: 'TIOMIRES' }), true);
assert.equal(
  characterizationSearchEmptyMessage('TIOMIRES'),
  'Nenhum elemento caracterizável encontrado para “TIOMIRES”.',
);
assert.equal(
  characterizationSearchErrorMessage(),
  'Não foi possível carregar os elementos caracterizáveis. Tente novamente.',
);

console.log('characterization-search.util.spec.ts OK');
