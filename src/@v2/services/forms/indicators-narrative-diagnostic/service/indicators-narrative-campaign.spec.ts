import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CAMPAIGN_INDICATORS_SCOPE, buildIndicatorsNarrativeDiagnosticScopeKey, normalizeIndicatorsNarrativeScope, diagnosticMatchesScope } from './indicators-narrative-diagnostic.scope.ts';

test('filters and visibility cannot change campaign diagnostic identity', () => {
  const scope = normalizeIndicatorsNarrativeScope({ ...CAMPAIGN_INDICATORS_SCOPE, groupingQuestionId: 'sector', participantGroupIds: ['one'], showOnlyGroupIndicators: true });
  assert.deepEqual(scope, CAMPAIGN_INDICATORS_SCOPE);
  assert.equal(buildIndicatorsNarrativeDiagnosticScopeKey(scope), 'campaign::hierarchy-v1');
});
test('legacy diagnostics are never presented as a new whole-campaign analysis', () => {
  assert.equal(diagnosticMatchesScope({ scopeKey: '_all_::_all_groups_::view::groups_and_questions' } as never, CAMPAIGN_INDICATORS_SCOPE), false);
  assert.equal(diagnosticMatchesScope({ scopeKey: 'campaign::hierarchy-v1' } as never, CAMPAIGN_INDICATORS_SCOPE), true);
});
