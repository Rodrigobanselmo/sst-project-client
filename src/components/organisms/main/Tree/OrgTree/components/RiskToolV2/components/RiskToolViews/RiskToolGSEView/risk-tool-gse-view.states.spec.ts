/**
 * Contract tests for RiskToolGSEView list-gate + catalog join.
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/risk-tool-gse-view.states.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskEnum } from 'project/enum/risk.enums';

import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  RISK_LINKAGE_EMPTY_MESSAGE,
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
  RISK_LINKAGE_SELECT_ENTITY_MESSAGE,
  riskLinkageEmptyMessage,
} from 'core/utils/risk-linkage-guards.util';

import { joinRiskToolGseRows } from './join-risk-tool-gse-rows.util';
import { resolveRiskToolGseListGate } from './resolve-risk-tool-gse-list-gate.util';

function catalogRisk(
  partial: Pick<IRiskFactors, 'id' | 'name' | 'type' | 'representAll'>,
): IRiskFactors {
  return partial as IRiskFactors;
}

function riskData(partial: Pick<IRiskData, 'id' | 'riskId'>): IRiskData {
  return {
    companyId: 'c1',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    riskFactorGroupDataId: 'rg1',
    ...partial,
  } as IRiskData;
}

const padrao = catalogRisk({
  id: 'padrao-1',
  name: 'PADRÃO',
  type: RiskEnum.OUTROS,
  representAll: true,
});

const ruido = catalogRisk({
  id: 'ruido-1',
  name: 'Ruído',
  type: RiskEnum.FIS,
  representAll: false,
});

const emptyFilter = { key: '', value: '' };

function resolveView(input: {
  homoId: string;
  isRiskDataLoading: boolean;
  isRiskDataError: boolean;
  isCatalogFetched: boolean;
  isCatalogLoading: boolean;
  isCatalogFetching: boolean;
  riskCatalog: IRiskFactors[];
  riskDataQuery: IRiskData[] | undefined;
}) {
  const rows = joinRiskToolGseRows({
    isCatalogFetched: input.isCatalogFetched,
    riskCatalog: input.riskCatalog,
    riskDataQuery: input.riskDataQuery,
    homoId: input.homoId,
    selectedGhoFilter: emptyFilter,
    riskGroupId: 'rg1',
  });
  const gate = resolveRiskToolGseListGate({
    homoId: input.homoId,
    isRiskDataLoading: input.isRiskDataLoading,
    isRiskDataError: input.isRiskDataError,
    isCatalogFetched: input.isCatalogFetched,
    isCatalogLoading: input.isCatalogLoading,
    isCatalogFetching: input.isCatalogFetching,
    joinedRowCount: rows.length,
  });
  return { gate, rows };
}

assert.equal(
  resolveRiskToolGseListGate({
    homoId: '',
    isRiskDataLoading: false,
    isRiskDataError: false,
    isCatalogFetched: true,
    isCatalogLoading: false,
    isCatalogFetching: false,
    joinedRowCount: 0,
  }).state,
  'no-selection',
);
assert.equal(
  riskLinkageEmptyMessage({ hasSelection: false }),
  RISK_LINKAGE_SELECT_ENTITY_MESSAGE,
);

assert.equal(
  resolveRiskToolGseListGate({
    homoId: 'h1',
    isRiskDataLoading: true,
    isRiskDataError: false,
    isCatalogFetched: true,
    isCatalogLoading: false,
    isCatalogFetching: false,
    joinedRowCount: 1,
  }).state,
  'loading',
);

assert.equal(
  resolveRiskToolGseListGate({
    homoId: 'h1',
    isRiskDataLoading: false,
    isRiskDataError: true,
    isCatalogFetched: true,
    isCatalogLoading: false,
    isCatalogFetching: false,
    joinedRowCount: 0,
  }).state,
  'error',
);
assert.equal(RISK_LINKAGE_LOAD_ERROR_MESSAGE.length > 0, true);

assert.equal(
  resolveRiskToolGseListGate({
    homoId: 'h2',
    isRiskDataLoading: true,
    isRiskDataError: false,
    isCatalogFetched: true,
    isCatalogLoading: false,
    isCatalogFetching: false,
    joinedRowCount: 3,
  }).state,
  'loading',
);

assert.equal(RISK_LINKAGE_EMPTY_MESSAGE.includes('Nenhum fator'), true);

// Catalog still fetching: never treat [] as empty.
const catalogPending = resolveView({
  homoId: 'h1',
  isRiskDataLoading: false,
  isRiskDataError: false,
  isCatalogFetched: false,
  isCatalogLoading: true,
  isCatalogFetching: true,
  riskCatalog: [],
  riskDataQuery: [riskData({ id: 'rd1', riskId: 'ruido-1' })],
});
assert.equal(catalogPending.gate.state, 'loading');
assert.equal(catalogPending.rows.length, 0);

// Same view instance: catalog arrives later → list without remount.
const catalogLoaded = resolveView({
  homoId: 'h1',
  isRiskDataLoading: false,
  isRiskDataError: false,
  isCatalogFetched: true,
  isCatalogLoading: false,
  isCatalogFetching: false,
  riskCatalog: [padrao, ruido],
  riskDataQuery: [riskData({ id: 'rd1', riskId: 'ruido-1' })],
});
assert.equal(catalogLoaded.gate.state, 'success');
assert.equal(catalogLoaded.rows.length, 2);
assert.equal(
  catalogLoaded.rows.some(([, risk]) => risk.representAll),
  true,
);
assert.equal(
  catalogLoaded.rows.some(([, risk]) => risk.id === 'ruido-1'),
  true,
);

// Background refetch with cache must not go back to loading.
assert.equal(
  resolveRiskToolGseListGate({
    homoId: 'h1',
    isRiskDataLoading: false,
    isRiskDataError: false,
    isCatalogFetched: true,
    isCatalogLoading: false,
    isCatalogFetching: true,
    joinedRowCount: 2,
  }).state,
  'success',
);

// Entity with no links + PADRÃO in catalog still shows PADRÃO.
const onlyPadrao = resolveView({
  homoId: 'h1',
  isRiskDataLoading: false,
  isRiskDataError: false,
  isCatalogFetched: true,
  isCatalogLoading: false,
  isCatalogFetching: false,
  riskCatalog: [padrao],
  riskDataQuery: [],
});
assert.equal(onlyPadrao.gate.state, 'success');
assert.equal(onlyPadrao.rows.length, 1);
assert.equal(onlyPadrao.rows[0][1].representAll, true);
assert.equal(onlyPadrao.rows[0][1].id, 'padrao-1');

// Real empty: catalog resolved, no PADRÃO, no links → empty, not infinite loading.
const realEmpty = resolveView({
  homoId: 'h1',
  isRiskDataLoading: false,
  isRiskDataError: false,
  isCatalogFetched: true,
  isCatalogLoading: false,
  isCatalogFetching: false,
  riskCatalog: [ruido],
  riskDataQuery: [],
});
assert.equal(realEmpty.gate.state, 'empty');
assert.equal(realEmpty.rows.length, 0);
assert.equal(
  riskLinkageEmptyMessage({ hasSelection: true }),
  RISK_LINKAGE_EMPTY_MESSAGE,
);

console.log('risk-tool-gse-view.states.spec.ts: ok');
