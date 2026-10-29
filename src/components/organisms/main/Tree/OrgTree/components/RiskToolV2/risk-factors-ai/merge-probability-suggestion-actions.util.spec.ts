import assert from 'node:assert/strict';
import { mergeProbabilitySuggestionActions } from './merge-probability-suggestion-actions.util';
import type { RiskFactorAiSuggestionActions } from './useRiskFactorAiSuggestionActions';
const item = {
  key: 'risk:probability:3',
  riskId: 'risk',
  riskFactorDataId: 'row',
  field: 'probability' as const,
  value: '3',
  action: 'approve-probability' as const,
};
const events: string[] = [];
const primary: RiskFactorAiSuggestionActions = {
  applyingKey: null,
  resolvedKeys: new Set(),
  pendingFor: () => [item],
  accept: async () => {
    events.push('canonical-confirm-and-revalidate');
  },
  dismiss: () => {
    events.push('canonical-dismiss');
  },
};
const fallback: RiskFactorAiSuggestionActions = {
  applyingKey: null,
  pendingFor: () => [
    item,
    { ...item, key: 'risk:probability:4', value: '4' },
    { ...item, key: 'foreign', riskFactorDataId: 'other' },
  ],
  accept: async () => {
    throw new Error('Must not bypass canonical revalidation');
  },
  dismiss: () => {
    throw new Error('Must not mutate other legacy sessions');
  },
};
const query = {
  riskId: 'risk',
  column: 'probability' as const,
  riskData: { id: 'row' } as any,
};
async function main() {
  assert.equal(mergeProbabilitySuggestionActions(primary), primary);
  const combined = mergeProbabilitySuggestionActions(primary, fallback);
  assert.deepEqual(
    combined.pendingFor(query).map((x) => x.value),
    ['3', '4'],
  );
  await combined.accept({
    suggestion: { ...item, key: 'risk:probability:4', value: '4' },
    riskData: query.riskData,
    handleSelect: () => {},
  });
  combined.dismiss({ suggestion: item, riskData: query.riskData });
  assert.deepEqual(events, [
    'canonical-confirm-and-revalidate',
    'canonical-dismiss',
  ]);
  const resolved = mergeProbabilitySuggestionActions(
    {
      ...primary,
      pendingFor: () => [],
      resolvedKeys: new Set(['risk:probability:3', 'risk:probability:4']),
    },
    fallback,
  );
  assert.deepEqual(resolved.pendingFor(query), []);
  assert.deepEqual(resolved.pendingFor({ ...query, column: 'source' }), []);
  assert.deepEqual(resolved.pendingFor({ ...query, riskData: undefined }), []);
  console.log(
    'Pendências de probabilidade: sem duplicação, identidade exata, resolução e revalidação canônica OK',
  );
}
void main();
