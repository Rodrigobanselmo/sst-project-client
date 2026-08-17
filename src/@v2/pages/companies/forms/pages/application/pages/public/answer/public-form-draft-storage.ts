export const PUBLIC_FORM_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export type PublicFormDraftState = {
  answers: Record<string, unknown>;
  currentStep?: number;
  timestamp: number;
};

export function getLegacyPublicFormDraftStorageKey(applicationId: string) {
  return `form_answers_${applicationId}`;
}

export function getPublicFormDraftStorageKey(
  applicationId: string,
  employeeId?: number | string | null,
) {
  if (employeeId === undefined || employeeId === null || employeeId === '') {
    return getLegacyPublicFormDraftStorageKey(applicationId);
  }

  return `form_answers_${applicationId}_${employeeId}`;
}

export function canPersistPublicFormDraft(params: {
  employeeId?: number | string | null;
  isIdentifiedSession: boolean;
}) {
  if (!params.isIdentifiedSession) {
    return true;
  }

  return (
    params.employeeId !== undefined &&
    params.employeeId !== null &&
    params.employeeId !== ''
  );
}

export function parsePublicFormDraft(
  raw: string | null,
  now = Date.now(),
): PublicFormDraftState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PublicFormDraftState>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (typeof parsed.timestamp !== 'number') {
      return null;
    }
    if (now - parsed.timestamp >= PUBLIC_FORM_DRAFT_TTL_MS) {
      return null;
    }
    if (!parsed.answers || typeof parsed.answers !== 'object') {
      return null;
    }

    return {
      answers: parsed.answers as Record<string, unknown>,
      currentStep:
        typeof parsed.currentStep === 'number' ? parsed.currentStep : undefined,
      timestamp: parsed.timestamp,
    };
  } catch {
    return null;
  }
}

export function serializePublicFormDraft(params: {
  answers: Record<string, unknown>;
  currentStep?: number;
  timestamp?: number;
}) {
  return JSON.stringify({
    answers: params.answers,
    currentStep: params.currentStep ?? 0,
    timestamp: params.timestamp ?? Date.now(),
  });
}

export function collectPublicFormSectorQuestionIds(
  groups?:
    | Array<{
        questions?: Array<{
          id: string;
          details?: { identifierType?: string };
        }>;
      }>
    | null,
) {
  if (!groups) {
    return [];
  }

  return groups
    .flatMap((group) => group.questions ?? [])
    .filter((question) => question.details?.identifierType === 'SECTOR')
    .map((question) => question.id);
}

export function resolvePublicFormDraftRestore(params: {
  applicationId: string;
  employeeId?: number | string | null;
  identityRaw: string | null;
  legacyRaw: string | null;
  now?: number;
}): {
  storageKey: string;
  answers: Record<string, unknown>;
  currentStep?: number;
  restoredFrom: 'identity' | 'legacy' | 'none';
  ignoredUnattributableLegacy: boolean;
} {
  const { applicationId, employeeId, identityRaw, legacyRaw, now } = params;
  const storageKey = getPublicFormDraftStorageKey(applicationId, employeeId);
  const legacyKey = getLegacyPublicFormDraftStorageKey(applicationId);
  const identified = storageKey !== legacyKey;
  const hasLegacyDraft = Boolean(parsePublicFormDraft(legacyRaw, now));

  if (identified) {
    const identityDraft = parsePublicFormDraft(identityRaw, now);
    if (identityDraft) {
      return {
        storageKey,
        answers: identityDraft.answers,
        currentStep: identityDraft.currentStep,
        restoredFrom: 'identity',
        ignoredUnattributableLegacy: hasLegacyDraft,
      };
    }

    return {
      storageKey,
      answers: {},
      restoredFrom: 'none',
      ignoredUnattributableLegacy: hasLegacyDraft,
    };
  }

  const legacyDraft = parsePublicFormDraft(legacyRaw ?? identityRaw, now);
  if (!legacyDraft) {
    return {
      storageKey,
      answers: {},
      restoredFrom: 'none',
      ignoredUnattributableLegacy: false,
    };
  }

  return {
    storageKey,
    answers: legacyDraft.answers,
    currentStep: legacyDraft.currentStep,
    restoredFrom: 'legacy',
    ignoredUnattributableLegacy: false,
  };
}

export function buildIdentifiedSectorFieldValue(params: {
  hierarchyId: string;
  sectorOptions: Array<{ id: string; text: string; value: string }>;
}) {
  return (
    params.sectorOptions.find((option) => option.id === params.hierarchyId) ?? {
      id: params.hierarchyId,
      text: '',
      value: params.hierarchyId,
    }
  );
}
