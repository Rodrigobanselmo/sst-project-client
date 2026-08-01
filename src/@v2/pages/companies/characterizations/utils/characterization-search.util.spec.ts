/**
 * Executar: npx tsx src/@v2/pages/companies/characterizations/utils/characterization-search.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  characterizationSearchEmptyMessage,
  characterizationSearchErrorMessage,
  resolveCharacterizationSearchUiState,
  shouldApplyCharacterizationSearchResponse,
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

const base = {
  hasWorkspaceSelected: true,
  searchTerm: '',
  resultCount: 15,
  isLoading: false,
  isFetching: false,
  isError: false,
  hasData: true,
};

assert.equal(resolveCharacterizationSearchUiState(base), 'success');

assert.equal(
  resolveCharacterizationSearchUiState({
    ...base,
    isLoading: true,
    hasData: false,
    resultCount: 0,
  }),
  'loading',
);

assert.equal(
  resolveCharacterizationSearchUiState({
    ...base,
    isFetching: true,
    searchTerm: 'Prédio Sede',
  }),
  'updating',
);

assert.equal(
  resolveCharacterizationSearchUiState({
    ...base,
    searchTerm: 'xyzzyqqq123inexistente',
    resultCount: 0,
  }),
  'empty',
);

assert.equal(
  resolveCharacterizationSearchUiState({
    ...base,
    searchTerm: 'Prédio Sede',
    resultCount: 0,
    isError: true,
    isFetching: true,
  }),
  'error',
  'error must win over empty/updating',
);

assert.equal(
  resolveCharacterizationSearchUiState({
    ...base,
    searchTerm: 'Prédio Sede',
    resultCount: 0,
    isFetching: true,
    hasData: true,
  }),
  'updating',
  'while fetching previous empty results, show updating not empty',
);

assert.equal(
  resolveCharacterizationSearchUiState({
    ...base,
    searchTerm: 'Prédio Sede',
    resultCount: 14,
    isFetching: false,
  }),
  'success',
);

assert.equal(
  shouldApplyCharacterizationSearchResponse({
    activeRequestId: 3,
    responseRequestId: 2,
  }),
  false,
  'stale out-of-order response must be ignored',
);
assert.equal(
  shouldApplyCharacterizationSearchResponse({
    activeRequestId: 3,
    responseRequestId: 3,
  }),
  true,
);

assert.equal(
  resolveCharacterizationSearchUiState({
    ...base,
    hasWorkspaceSelected: false,
  }),
  'idle',
);

console.log('characterization-search.util.spec.ts OK');
