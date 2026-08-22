import {
  DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON,
  DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON,
} from './document-editor-v2-notices';
import {
  DocumentEditorSurface,
  requestSurfaceChange,
  shouldBlockOfficialSave,
} from './document-editor-v2-session';

export const DOCUMENT_EDITOR_V2_DIRTY_NOTICE =
  'Alterações locais do V2 — não salvas no modelo.';

export type V2SaveGuardSession = {
  surface: DocumentEditorSurface;
  v2LocalDirty: boolean;
  experimentNotice: string | null;
  remountKey: number;
  baselineRevision: number;
};

export type OfficialSaveIntent = 'stay' | 'exit';

export type OfficialSaveDecision = {
  persist: boolean;
  close: boolean;
  next: V2SaveGuardSession;
};

export type DirtyClearReason =
  | 'discard'
  | 'explicit-reset'
  | 'official-v2-persist'
  | 'official-v1-save';

export function canClearExperimentalDirty(reason: DirtyClearReason): boolean {
  return reason === 'discard' || reason === 'explicit-reset';
}

export function shouldRebaseOfficialDocument(args: {
  v2LocalDirty: boolean;
}): boolean {
  return !args.v2LocalDirty;
}

export function createV2SaveGuardSession(
  partial: Partial<V2SaveGuardSession> = {},
): V2SaveGuardSession {
  return {
    surface: 'v2',
    v2LocalDirty: false,
    experimentNotice: null,
    remountKey: 0,
    baselineRevision: 0,
    ...partial,
  };
}

export function markV2LocalDirty(
  session: V2SaveGuardSession,
): V2SaveGuardSession {
  if (session.surface !== 'v2') return session;
  return {
    ...session,
    v2LocalDirty: true,
  };
}

export function resolveOfficialSaveAttempt(
  session: V2SaveGuardSession,
  intent: OfficialSaveIntent = 'stay',
): OfficialSaveDecision {
  if (shouldBlockOfficialSave(session)) {
    return {
      persist: false,
      close: false,
      next: {
        ...session,
        v2LocalDirty: true,
        experimentNotice: DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON,
      },
    };
  }

  return {
    persist: true,
    close: intent === 'exit',
    next: { ...session },
  };
}

export function resolveClassicSwitchAttempt(session: V2SaveGuardSession): {
  allowed: boolean;
  next: V2SaveGuardSession;
} {
  const result = requestSurfaceChange({
    current: session.surface,
    next: 'v1',
    v2LocalDirty: session.v2LocalDirty,
  });

  if (!result.allowed) {
    return {
      allowed: false,
      next: {
        ...session,
        experimentNotice:
          result.reason || DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON,
      },
    };
  }

  return {
    allowed: true,
    next: {
      ...session,
      surface: 'v1',
      experimentNotice: null,
    },
  };
}

export function resolveDiscardExperiment(
  session: V2SaveGuardSession,
): V2SaveGuardSession {
  if (!canClearExperimentalDirty('discard')) return session;
  return {
    ...session,
    v2LocalDirty: false,
    experimentNotice: null,
    remountKey: session.remountKey + 1,
    baselineRevision: session.baselineRevision + 1,
  };
}

export function resolveExperimentalStatusMessage(args: {
  v2LocalDirty: boolean;
  experimentNotice: string | null;
  blockedSectionSwitch?: boolean;
  sectionReason?: string | null;
}): string | null {
  const parts: string[] = [];
  if (args.v2LocalDirty) parts.push(DOCUMENT_EDITOR_V2_DIRTY_NOTICE);
  if (
    args.experimentNotice &&
    args.experimentNotice !== DOCUMENT_EDITOR_V2_DIRTY_NOTICE
  ) {
    parts.push(args.experimentNotice);
  }
  if (args.blockedSectionSwitch && args.sectionReason) {
    parts.push(args.sectionReason);
  }
  return parts.length ? parts.join(' ') : args.experimentNotice;
}

export function resolveBlockedSaveNotice(): string {
  return DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON;
}
