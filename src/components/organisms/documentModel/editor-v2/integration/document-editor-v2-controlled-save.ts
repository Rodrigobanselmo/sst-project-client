import { JSONContent } from '@tiptap/core';
import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

import {
  buildDocumentEditorCandidate,
  DocumentEditorCandidate,
} from '../domain/build-document-editor-candidate';
import { CanonicalDiffChange } from '../domain/canonical-diff';
import { DocumentModelValidationError } from '../domain/validate-document-model';
import { DocumentEditorSelection } from '../domain/document-editor-slice';
import { StaleDocumentEditorSliceError } from '../domain/stale-document-editor-slice.error';
import {
  DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON,
  DOCUMENT_EDITOR_V2_INVALID_SAVE_REASON,
  DOCUMENT_EDITOR_V2_MISSING_EDITOR_REASON,
  DOCUMENT_EDITOR_V2_STALE_SAVE_REASON,
} from './document-editor-v2-notices';
import { DocumentEditorSurface } from './document-editor-v2-session';
import { shouldBlockOfficialSave } from './document-editor-v2-session';

export type V2PersistPlan =
  | { type: 'v1-redux' }
  | { type: 'block'; message: string }
  | {
      type: 'no-op';
      candidate: IDocumentModelData;
      built: DocumentEditorCandidate;
    }
  | {
      type: 'abort';
      kind: 'validation' | 'stale' | 'missing-editor' | 'missing-selection';
      message: string;
      errors?: DocumentModelValidationError[];
    }
  | {
      type: 'patch';
      candidate: IDocumentModelData;
      built: DocumentEditorCandidate;
      diff: CanonicalDiffChange[];
    };

export type OfficialPersistStage = {
  reduxModel: IDocumentModelData;
  queryDocument: IDocumentModelData | null;
  v2LocalDirty: boolean;
  baseline: IDocumentModelData | null;
  needSynchronization: boolean;
  patchedPayload: IDocumentModelData | null;
  snackbar: 'success' | 'error' | 'validation' | 'stale' | null;
  closed: boolean;
  backupCreated: boolean;
};

/**
 * Decide o que o save oficial deve fazer.
 *
 * No-op (diff vazio): sucesso local sem PATCH.
 * Patch: só depois de candidate + validate + diff.
 *
 * Concorrência: o backend continua last-write-wins. Esta fase só detecta
 * stale local (âncora/janela). Não há ETag nem updatedAt.
 */
export function planDocumentEditorV2Persist(args: {
  surface: DocumentEditorSurface;
  saveEnabled: boolean;
  v2LocalDirty: boolean;
  originalModel: IDocumentModelData;
  selectedItem: DocumentEditorSelection | null;
  baselineProjection: IDocumentModelData | null;
  tipTapDoc: JSONContent | null;
  dataOverride?: IDocumentModelData;
}): V2PersistPlan {
  if (args.dataOverride) {
    return {
      type: 'patch',
      candidate: args.dataOverride,
      built: {
        candidate: args.dataOverride,
        editedProjected: args.dataOverride,
        baselineProjection: args.baselineProjection || args.dataOverride,
        diff: [],
        validation: { ok: true, errors: [] },
      },
      diff: [],
    };
  }

  if (
    shouldBlockOfficialSave({
      surface: args.surface,
      v2LocalDirty: args.v2LocalDirty,
      saveEnabled: args.saveEnabled,
    })
  ) {
    return { type: 'block', message: DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON };
  }

  if (!args.saveEnabled || args.surface !== 'v2') {
    return { type: 'v1-redux' };
  }

  if (!args.tipTapDoc) {
    return {
      type: 'abort',
      kind: 'missing-editor',
      message: DOCUMENT_EDITOR_V2_MISSING_EDITOR_REASON,
    };
  }

  if (!args.selectedItem) {
    return {
      type: 'abort',
      kind: 'missing-selection',
      message: DOCUMENT_EDITOR_V2_MISSING_EDITOR_REASON,
    };
  }

  try {
    const built = buildDocumentEditorCandidate({
      originalModel: args.originalModel,
      selectedItem: args.selectedItem,
      baselineProjection: args.baselineProjection || undefined,
      tipTapDoc: args.tipTapDoc,
    });

    if (!built.validation.ok) {
      const first = built.validation.errors[0];
      logV2ValidationErrors(built.validation.errors);
      return {
        type: 'abort',
        kind: 'validation',
        message: first?.message || DOCUMENT_EDITOR_V2_INVALID_SAVE_REASON,
        errors: built.validation.errors,
      };
    }

    if (!built.diff.length) {
      return {
        type: 'no-op',
        candidate: built.candidate,
        built,
      };
    }

    return {
      type: 'patch',
      candidate: built.candidate,
      built,
      diff: built.diff,
    };
  } catch (error) {
    if (error instanceof StaleDocumentEditorSliceError) {
      return {
        type: 'abort',
        kind: 'stale',
        message: DOCUMENT_EDITOR_V2_STALE_SAVE_REASON,
      };
    }
    throw error;
  }
}

export function createOfficialPersistStage(
  original: IDocumentModelData,
  extras: Partial<OfficialPersistStage> = {},
): OfficialPersistStage {
  return {
    reduxModel: original,
    queryDocument: original,
    v2LocalDirty: false,
    baseline: null,
    needSynchronization: false,
    patchedPayload: null,
    snackbar: null,
    closed: false,
    backupCreated: false,
    ...extras,
  };
}

export function applyV2PersistPlanToStage(
  stage: OfficialPersistStage,
  plan: V2PersistPlan,
  intent: 'stay' | 'exit' = 'stay',
): OfficialPersistStage {
  if (plan.type === 'block') {
    return {
      ...stage,
      snackbar: null,
      closed: false,
    };
  }

  if (plan.type === 'abort') {
    return {
      ...stage,
      snackbar: plan.kind === 'stale' ? 'stale' : 'validation',
      closed: false,
    };
  }

  if (plan.type === 'no-op') {
    return {
      ...stage,
      v2LocalDirty: false,
      baseline: plan.built.editedProjected,
      needSynchronization: false,
      snackbar: null,
      closed: intent === 'exit',
    };
  }

  if (plan.type === 'v1-redux') {
    return stage;
  }

  return {
    ...stage,
    backupCreated: true,
  };
}

export function applySuccessfulV2Patch(
  stage: OfficialPersistStage,
  candidate: IDocumentModelData,
  built: DocumentEditorCandidate,
  intent: 'stay' | 'exit' = 'stay',
): OfficialPersistStage {
  return {
    ...stage,
    reduxModel: candidate,
    queryDocument: candidate,
    v2LocalDirty: false,
    baseline: built.editedProjected,
    needSynchronization: false,
    patchedPayload: candidate,
    snackbar: 'success',
    closed: intent === 'exit',
  };
}

export function applyFailedV2Patch(
  stage: OfficialPersistStage,
): OfficialPersistStage {
  return {
    ...stage,
    patchedPayload: null,
    snackbar: 'error',
    closed: false,
  };
}

export function logV2PersistDiff(diff: CanonicalDiffChange[]) {
  if (process.env.NODE_ENV === 'production') return;
  // Diagnóstico local da POC — não vai para a API.
  console.info('[document-editor-v2] persist diff', diff);
}

export function logV2ValidationErrors(errors: DocumentModelValidationError[]) {
  if (process.env.NODE_ENV === 'production') return;
  console.info(
    '[document-editor-v2] validation errors',
    errors.map((error) => ({
      code: error.code,
      path: error.path,
      elementId: error.elementId,
      elementType: error.elementType,
      offset: error.offset,
      fragment: error.fragment,
    })),
  );
}
