import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  type SystemRiskMatrixProjection,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  beginSystemRiskMatrixSave,
  completeSystemRiskMatrixSave,
  createSystemRiskMatrixDraft,
  failSystemRiskMatrixSave,
  isSystemRiskMatrixDraftDirty,
  isSystemRiskMatrixDraftStale,
  receiveSystemRiskMatrixProjection,
} from './system-risk-matrix-draft.util';

const projection = (revision: number, criterion = 'Critério publicado') =>
  ({
    editorial: { revision },
    axisCriteria: [
      {
        axis: RiskMatrixAxisEnum.SEVERITY,
        value: 1,
        coverageKey: RiskMatrixCoverageKeyEnum.FIS,
        criterion,
      },
    ],
    axisLevelColors: [{ value: 1, color: '#123456' }],
    classificationColors: [{ key: 'C1', color: '#654321' }],
    version: { axisLevels: [], axisLevelColors: [], classifications: [] },
  }) as unknown as SystemRiskMatrixProjection;

const edit = (revision = 4) => {
  const draft = createSystemRiskMatrixDraft(projection(revision));
  return {
    ...draft,
    editorial: {
      ...draft.editorial,
      axisCriteria: draft.editorial.axisCriteria.map((item) => ({
        ...item,
        criterion: 'Rascunho local',
      })),
    },
  };
};

test('a clean editor follows a coherent projection and revision', () => {
  const current = createSystemRiskMatrixDraft(projection(4));
  const next = receiveSystemRiskMatrixProjection(
    current,
    projection(5, 'Texto novo'),
  );
  assert.equal(next.baselineRevision, 5);
  assert.equal(next.editorial.axisCriteria[0].criterion, 'Texto novo');
  assert.equal(isSystemRiskMatrixDraftDirty(next), false);
});

test('refetch preserves dirty text and its original revision, announcing stale data', () => {
  const current = edit();
  const next = receiveSystemRiskMatrixProjection(
    current,
    projection(5, 'Outra sessão'),
  );
  assert.equal(next.editorial.axisCriteria[0].criterion, 'Rascunho local');
  assert.equal(next.baseline.axisCriteria[0].criterion, 'Critério publicado');
  assert.equal(next.baselineRevision, 4);
  assert.equal(isSystemRiskMatrixDraftDirty(next), true);
  assert.equal(isSystemRiskMatrixDraftStale(next), true);
});

test('an unchanged refetch also preserves unsaved fields', () => {
  const next = receiveSystemRiskMatrixProjection(edit(), projection(4));
  assert.equal(next.editorial.axisCriteria[0].criterion, 'Rascunho local');
  assert.equal(isSystemRiskMatrixDraftStale(next), false);
});

test('an older request cannot roll back the baseline or hide an observed conflict', () => {
  const clean = createSystemRiskMatrixDraft(projection(5));
  const cleanAfterOldRead = receiveSystemRiskMatrixProjection(
    clean,
    projection(4),
  );
  assert.equal(cleanAfterOldRead.baselineRevision, 5);
  const dirty = receiveSystemRiskMatrixProjection(edit(), projection(5));
  const dirtyAfterOldRead = receiveSystemRiskMatrixProjection(
    dirty,
    projection(4),
  );
  assert.equal(dirtyAfterOldRead.latest.editorial?.revision, 5);
  assert.equal(isSystemRiskMatrixDraftStale(dirtyAfterOldRead), true);
});

test('network retries preserve the exact operation ID and request body', () => {
  const first = beginSystemRiskMatrixSave(edit(), () => 'operation-1');
  const failed = failSystemRiskMatrixSave(first.draft);
  const retry = beginSystemRiskMatrixSave(failed, () => {
    throw new Error('Must reuse operation');
  });
  assert.deepEqual(retry.payload, first.payload);
  assert.equal(retry.payload.expectedRevision, 4);
  assert.equal(retry.payload.axisCriteria[0].criterion, 'Rascunho local');
  assert.equal(failed.saving, false);
});

test('editing after a failure creates a different operation for different content', () => {
  const first = beginSystemRiskMatrixSave(edit(), () => 'operation-1');
  const failed = failSystemRiskMatrixSave(first.draft);
  const changed = {
    ...failed,
    editorial: {
      ...failed.editorial,
      axisLevelColors: [{ value: 1, color: '#ABCDEF' }],
    },
  };
  const next = beginSystemRiskMatrixSave(changed, () => 'operation-2');
  assert.equal(next.payload.operationId, 'operation-2');
  assert.equal(next.payload.axisLevelColors[0].color, '#ABCDEF');
});

test('conflicts keep input and block saving even when refetch fails', () => {
  const started = beginSystemRiskMatrixSave(edit(), () => 'operation-1');
  const failed = failSystemRiskMatrixSave(started.draft, true);
  assert.equal(failed.editorial.axisCriteria[0].criterion, 'Rascunho local');
  assert.equal(failed.baselineRevision, 4);
  assert.equal(isSystemRiskMatrixDraftStale(failed), true);
});

test('a refetch during saving cannot replace the submitted draft', () => {
  const started = beginSystemRiskMatrixSave(edit(), () => 'operation-1');
  const refreshed = receiveSystemRiskMatrixProjection(
    started.draft,
    projection(5),
  );
  assert.equal(refreshed.editorial.axisCriteria[0].criterion, 'Rascunho local');
  assert.equal(refreshed.baselineRevision, 4);
  assert.equal(refreshed.saving, true);
});

test('successful save updates baseline and revision together and clears operation', () => {
  const started = beginSystemRiskMatrixSave(edit(), () => 'operation-1');
  const saved = completeSystemRiskMatrixSave(
    started.draft,
    projection(5, 'Rascunho local'),
  );
  assert.equal(saved.baselineRevision, 5);
  assert.equal(saved.editorial.axisCriteria[0].criterion, 'Rascunho local');
  assert.equal(isSystemRiskMatrixDraftDirty(saved), false);
  assert.equal(isSystemRiskMatrixDraftStale(saved), false);
  assert.equal(saved.operation, null);
  assert.equal(saved.saving, false);
});

test('a newer concurrent publication observed during save remains visible', () => {
  const started = beginSystemRiskMatrixSave(edit(), () => 'operation-1');
  const refreshed = receiveSystemRiskMatrixProjection(
    started.draft,
    projection(6),
  );
  const saved = completeSystemRiskMatrixSave(
    refreshed,
    projection(5, 'Rascunho local'),
  );
  assert.equal(saved.baselineRevision, 5);
  assert.equal(saved.latest.editorial?.revision, 6);
  assert.equal(isSystemRiskMatrixDraftStale(saved), true);
});

test('explicitly loading the latest publication discards the draft and old operation', () => {
  const latest = projection(6, 'Último texto publicado');
  const reloaded = createSystemRiskMatrixDraft(latest);
  assert.equal(
    reloaded.editorial.axisCriteria[0].criterion,
    'Último texto publicado',
  );
  assert.equal(reloaded.baselineRevision, 6);
  assert.equal(isSystemRiskMatrixDraftStale(reloaded), false);
  assert.equal(reloaded.operation, null);
});
