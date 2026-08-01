/**
 * Contract for developed-role deletion analysis modal states (Phase A — read-only).
 * Executar: npx tsx src/@v2/pages/companies/exposure-group-assistant/components/developed-role-deletion-analysis.states.spec.ts
 */
import assert from 'node:assert/strict';

type Eligibility =
  | 'ELIGIBLE_DIRECT_DELETE'
  | 'ELIGIBLE_AFTER_EMPLOYEE_DETACH'
  | 'BLOCKED_TECHNICAL_USE'
  | 'BLOCKED_OTHER_REFERENCES'
  | 'UNKNOWN';

type AnalysisGate =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | {
      state: 'success';
      eligibility: Eligibility;
      showDeleteButton: boolean;
      needsDetachConfirm: boolean;
      primaryPreservedMessage: boolean;
      showBlockingReasons: boolean;
    };

function resolveAnalysisGate(input: {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  eligibility?: Eligibility;
}): AnalysisGate {
  if (input.isLoading) return { state: 'loading' };
  if (input.isError) {
    return {
      state: 'error',
      message: input.errorMessage || 'Não foi possível analisar a exclusão.',
    };
  }
  if (!input.eligibility) {
    return { state: 'error', message: 'Análise indisponível.' };
  }
  const eligible =
    input.eligibility === 'ELIGIBLE_DIRECT_DELETE' ||
    input.eligibility === 'ELIGIBLE_AFTER_EMPLOYEE_DETACH';
  return {
    state: 'success',
    eligibility: input.eligibility,
    showDeleteButton: eligible,
    needsDetachConfirm: input.eligibility === 'ELIGIBLE_AFTER_EMPLOYEE_DETACH',
    primaryPreservedMessage: eligible,
    showBlockingReasons: !eligible,
  };
}

assert.equal(resolveAnalysisGate({ isLoading: true, isError: false }).state, 'loading');
assert.equal(
  resolveAnalysisGate({ isLoading: false, isError: true }).state,
  'error',
);

const detach = resolveAnalysisGate({
  isLoading: false,
  isError: false,
  eligibility: 'ELIGIBLE_AFTER_EMPLOYEE_DETACH',
});
assert.equal(detach.state, 'success');
if (detach.state === 'success') {
  assert.equal(detach.showDeleteButton, true);
  assert.equal(detach.needsDetachConfirm, true);
  assert.equal(detach.primaryPreservedMessage, true);
}

const direct = resolveAnalysisGate({
  isLoading: false,
  isError: false,
  eligibility: 'ELIGIBLE_DIRECT_DELETE',
});
assert.equal(direct.state, 'success');
if (direct.state === 'success') {
  assert.equal(direct.needsDetachConfirm, false);
  assert.equal(direct.showDeleteButton, true);
}

const blocked = resolveAnalysisGate({
  isLoading: false,
  isError: false,
  eligibility: 'BLOCKED_TECHNICAL_USE',
});
assert.equal(blocked.state, 'success');
if (blocked.state === 'success') {
  assert.equal(blocked.showDeleteButton, false);
  assert.equal(blocked.showBlockingReasons, true);
}

console.log('developed-role-deletion-analysis.states.spec.ts OK');
