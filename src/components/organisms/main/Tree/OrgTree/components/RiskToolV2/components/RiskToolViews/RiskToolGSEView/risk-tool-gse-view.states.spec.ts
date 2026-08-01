/**
 * Contract tests for RiskToolGSEView list-gate states.
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/risk-tool-gse-view.states.spec.ts
 *
 * Mirrors the gate used by RiskToolGSEView so list rows are never built
 * for loading / error / empty / no-selection.
 */
import assert from 'node:assert/strict';

import {
  RISK_LINKAGE_EMPTY_MESSAGE,
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
  RISK_LINKAGE_SELECT_ENTITY_MESSAGE,
  coerceRiskDataList,
  riskLinkageEmptyMessage,
} from 'core/utils/risk-linkage-guards.util';

type GateInput = {
  homoId: string;
  isLoading: boolean;
  isError: boolean;
  riskData: unknown;
};

type GateResult =
  | { state: 'no-selection'; message: string }
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'empty'; message: string }
  | { state: 'success'; rows: unknown[] };

function resolveRiskToolGseGate(input: GateInput): GateResult {
  if (!input.homoId) {
    return {
      state: 'no-selection',
      message: riskLinkageEmptyMessage({ hasSelection: false }),
    };
  }
  if (input.isLoading) return { state: 'loading' };
  if (input.isError) {
    return { state: 'error', message: RISK_LINKAGE_LOAD_ERROR_MESSAGE };
  }
  const rows = coerceRiskDataList(
    Array.isArray(input.riskData) ? input.riskData : undefined,
  );
  if (rows.length === 0) {
    return {
      state: 'empty',
      message: riskLinkageEmptyMessage({ hasSelection: true }),
    };
  }
  return { state: 'success', rows };
}

assert.deepEqual(resolveRiskToolGseGate({
  homoId: '',
  isLoading: false,
  isError: false,
  riskData: undefined,
}), {
  state: 'no-selection',
  message: RISK_LINKAGE_SELECT_ENTITY_MESSAGE,
});

assert.deepEqual(resolveRiskToolGseGate({
  homoId: 'h1',
  isLoading: true,
  isError: false,
  riskData: undefined,
}), { state: 'loading' });

assert.deepEqual(resolveRiskToolGseGate({
  homoId: 'h1',
  isLoading: false,
  isError: true,
  riskData: null,
}), {
  state: 'error',
  message: RISK_LINKAGE_LOAD_ERROR_MESSAGE,
});

assert.deepEqual(resolveRiskToolGseGate({
  homoId: 'h1',
  isLoading: false,
  isError: false,
  riskData: [],
}), {
  state: 'empty',
  message: RISK_LINKAGE_EMPTY_MESSAGE,
});

assert.deepEqual(resolveRiskToolGseGate({
  homoId: 'h1',
  isLoading: false,
  isError: false,
  riskData: undefined,
}), {
  state: 'empty',
  message: RISK_LINKAGE_EMPTY_MESSAGE,
});

assert.deepEqual(resolveRiskToolGseGate({
  homoId: 'h1',
  isLoading: false,
  isError: false,
  riskData: null,
}), {
  state: 'empty',
  message: RISK_LINKAGE_EMPTY_MESSAGE,
});

const withRisks = resolveRiskToolGseGate({
  homoId: 'h1',
  isLoading: false,
  isError: false,
  riskData: [{ id: 'rd1', riskId: 'r1' }],
});
assert.equal(withRisks.state, 'success');
if (withRisks.state === 'success') {
  assert.equal(withRisks.rows.length, 1);
}

// Rapid entity switch: loading must win over stale rows
assert.deepEqual(resolveRiskToolGseGate({
  homoId: 'h2',
  isLoading: true,
  isError: false,
  riskData: [{ id: 'stale' }],
}), { state: 'loading' });

console.log('risk-tool-gse-view.states.spec.ts: ok');
