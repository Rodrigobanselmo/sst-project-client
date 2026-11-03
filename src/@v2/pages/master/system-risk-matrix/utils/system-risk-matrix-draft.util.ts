import type {
  PutSystemRiskMatrixPayload,
  SystemRiskMatrixProjection,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  buildSystemRiskMatrixEditorialState,
  buildSystemRiskMatrixPutPayload,
  isSystemRiskMatrixEditorialDirty,
  type SystemRiskMatrixEditorialState,
} from './system-risk-matrix-editorial.util';

export type SystemRiskMatrixDraft = {
  editorial: SystemRiskMatrixEditorialState;
  baseline: SystemRiskMatrixEditorialState;
  baselineRevision: number;
  latest: SystemRiskMatrixProjection;
  saving: boolean;
  conflict: boolean;
  operation: {
    requestKey: string;
    payload: PutSystemRiskMatrixPayload;
  } | null;
};

const revisionOf = (projection: SystemRiskMatrixProjection) =>
  projection.editorial?.revision ?? 0;

export function createSystemRiskMatrixDraft(
  projection: SystemRiskMatrixProjection,
): SystemRiskMatrixDraft {
  const editorial = buildSystemRiskMatrixEditorialState(projection);
  return {
    editorial,
    baseline: editorial,
    baselineRevision: revisionOf(projection),
    latest: projection,
    saving: false,
    conflict: false,
    operation: null,
  };
}

export const isSystemRiskMatrixDraftDirty = (draft: SystemRiskMatrixDraft) =>
  isSystemRiskMatrixEditorialDirty(draft.editorial, draft.baseline);

export const isSystemRiskMatrixDraftStale = (draft: SystemRiskMatrixDraft) =>
  draft.conflict || revisionOf(draft.latest) !== draft.baselineRevision;

/** A refresh may announce a new revision; it must not replace unsaved input. */
export function receiveSystemRiskMatrixProjection(
  current: SystemRiskMatrixDraft | null,
  projection: SystemRiskMatrixProjection,
): SystemRiskMatrixDraft {
  if (
    current &&
    revisionOf(projection) <
      Math.max(current.baselineRevision, revisionOf(current.latest))
  ) {
    // An earlier request can finish after a more recent publication was read.
    return current;
  }
  if (
    !current ||
    (!current.saving &&
      !isSystemRiskMatrixDraftDirty(current) &&
      !isSystemRiskMatrixDraftStale(current))
  ) {
    return createSystemRiskMatrixDraft(projection);
  }
  return { ...current, latest: projection };
}

export function beginSystemRiskMatrixSave(
  current: SystemRiskMatrixDraft,
  createOperationId: () => string,
): { draft: SystemRiskMatrixDraft; payload: PutSystemRiskMatrixPayload } {
  const content = {
    ...buildSystemRiskMatrixPutPayload(current.editorial),
    expectedRevision: current.baselineRevision,
  };
  const requestKey = JSON.stringify(content);
  const payload =
    current.operation?.requestKey === requestKey
      ? current.operation.payload
      : { ...content, operationId: createOperationId() };
  return {
    payload,
    draft: {
      ...current,
      saving: true,
      operation: { requestKey, payload },
    },
  };
}

export function failSystemRiskMatrixSave(
  current: SystemRiskMatrixDraft,
  conflict = false,
): SystemRiskMatrixDraft {
  // Keep the exact operation for a network retry whose result may be unknown.
  return { ...current, saving: false, conflict: current.conflict || conflict };
}

export function completeSystemRiskMatrixSave(
  current: SystemRiskMatrixDraft,
  saved: SystemRiskMatrixProjection,
): SystemRiskMatrixDraft {
  const next = createSystemRiskMatrixDraft(saved);
  // A refetch can finish after another administrator has already saved again.
  if (revisionOf(current.latest) > next.baselineRevision) {
    next.latest = current.latest;
  }
  return next;
}
