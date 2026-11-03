import assert from 'node:assert/strict';
import {
  adaptOccupationalAnalysis,
  recognitionLabel,
  occupationalTechnicalSections,
} from './gse-occupational-adapter';
import type { SimilarityProposalsResponse } from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';
const source = () =>
  ({
    workspace: { id: 'w', companyId: 'c' },
    snapshotContentHash: 'snapshot',
    similarityAlgorithmVersion: 'version',
    schemaVersion: 'schema',
    candidates: [
      {
        provisionalName: 'GSE',
        proposalFingerprint: 'server-fingerprint',
        blocks: [],
        divergences: ['different exposures'],
        favorableReasons: ['similarity'],
        indication: 'REVIEW',
        confidence: 'LOW',
        draft: {
          proposalId: 'p',
          companyId: 'c',
          workspaceIds: ['w'],
          hierarchyIds: ['h'],
          includedElements: [{ elementId: 'e' }],
          includedRisks: { riskIds: ['r'] },
          warnings: [{ message: 'missing' }],
          inclusionCriteria: ['criterion'],
          algorithmVersion: 'v',
          reviewNotes: ['review'],
        },
        materialization: {
          status: 'EXACT_EXISTING_GSE',
          homogeneousGroupId: 'g',
          missingElementIds: ['e'],
          matchReason: 'hierarchy set',
        },
      },
    ],
    discardedSummary: [{ reason: 'incompatible' }],
    consultativeNotice: 'consultative',
  }) as unknown as SimilarityProposalsResponse;
let count = 0;
function test(name: string, fn: () => void) {
  fn();
  count++;
  console.log('PASS', name);
}
test('preserves complete original evidence and response', () => {
  const s = source();
  const a = adaptOccupationalAnalysis(s, 'c', 'w');
  assert.equal(a.response, s);
  assert.equal(a.proposals[0].candidate, s.candidates[0]);
  assert.deepEqual(a.response.discardedSummary, s.discardedSummary);
});
test('server fingerprint and versions retained without recomputation', () => {
  const p = adaptOccupationalAnalysis(source(), 'c', 'w').proposals[0];
  assert.equal(p.fingerprint, 'server-fingerprint');
  assert.equal(p.snapshotHash, 'snapshot');
  assert.equal(p.algorithmVersion, 'v');
});
test('hierarchy equality is not occupational equivalence', () => {
  const p = adaptOccupationalAnalysis(source(), 'c', 'w').proposals[0];
  assert.equal(p.occupationalEquivalenceConfirmed, false);
  assert.equal(p.requiresTechnicalReview, true);
  assert.equal(p.existingGroupId, 'g');
});
for (const status of [
  'EXACT_CREATED_PROPOSAL',
  'EXACT_EXISTING_GSE',
  'PARTIAL_OVERLAP',
  'NOT_MATERIALIZED',
] as const)
  test(status, () => {
    const s = source();
    s.candidates[0].materialization!.status = status;
    const p = adaptOccupationalAnalysis(s, 'c', 'w').proposals[0];
    assert.equal(p.recognition, status);
    assert.ok(recognitionLabel(status));
  });
test('blocked and insufficient remain distinct', () => {
  const s = source();
  s.candidates[0].blocks = [{ code: 'b', message: 'blocked' }];
  s.candidates[0].indication = 'INSUFFICIENT_DATA';
  const p = adaptOccupationalAnalysis(s, 'c', 'w').proposals[0];
  assert.equal(p.blocked, true);
  assert.equal(p.insufficient, true);
});
test('scope mismatch rejected', () => {
  assert.throws(() => adaptOccupationalAnalysis(source(), 'other', 'w'));
  const s = source();
  s.candidates[0].draft!.workspaceIds = ['other'];
  assert.throws(() => adaptOccupationalAnalysis(s, 'c', 'w'));
});
test('missing fingerprint explicitly unavailable on old API', () => {
  const s = source();
  delete s.candidates[0].proposalFingerprint;
  assert.equal(
    adaptOccupationalAnalysis(s, 'c', 'w').proposals[0].fingerprint,
    null,
  );
});
test('divergences and criteria available in technical sections', () => {
  const sections = occupationalTechnicalSections(source().candidates[0]);
  assert.deepEqual(sections['Divergências'], ['different exposures']);
  assert.deepEqual(sections['Critérios de inclusão'], ['criterion']);
});
test('empty and no-draft responses supported without invented identity', () => {
  const s = source();
  delete s.candidates[0].draft;
  assert.equal(
    adaptOccupationalAnalysis(s, 'c', 'w').proposals[0].proposalId,
    null,
  );
  s.candidates = [];
  assert.deepEqual(adaptOccupationalAnalysis(s, 'c', 'w').proposals, []);
});
console.log(`${count} adapter tests passed`);
