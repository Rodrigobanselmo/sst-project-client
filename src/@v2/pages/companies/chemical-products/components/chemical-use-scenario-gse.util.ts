import type {
  ChemicalUseScenarioBoardRow,
  ChemicalUseScenarioGseMatchStatus,
  ChemicalUseScenarioGseReconcileApplyPayload,
  ChemicalUseScenarioGseReconcileLink,
  ChemicalUseScenarioGseReconcilePreview,
  ChemicalUseScenarioGseReconcilePreviewItem,
  ChemicalUseScenarioHomogeneousGroup,
  ChemicalUseScenarioListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import { CHEMICAL_USE_SCENARIO_RECONCILE_STALE_CODE } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export const USE_SCENARIO_REAL_GSE_NONE_FILTER = '__UNLINKED__';

export const USE_SCENARIO_GSE_MATCH_STATUS_LABEL: Record<
  ChemicalUseScenarioGseMatchStatus,
  string
> = {
  ALREADY_LINKED: 'Já vinculado',
  MATCH_UNIQUE: 'Match único',
  NO_MATCH: 'Sem match',
  AMBIGUOUS: 'Ambíguo',
};

export type UseScenarioGsePresentation = {
  kind: 'REAL' | 'SNAPSHOT_ONLY' | 'EMPTY';
  primary: string;
  hint: string | null;
  cellText: string;
};

export function getUseScenarioRealGseName(
  row: Pick<
    ChemicalUseScenarioListItem,
    'homogeneousGroup' | 'homogeneousGroupId'
  >,
): string | null {
  const name = row.homogeneousGroup?.name?.trim();
  return name || null;
}

export function hasRealUseScenarioGse(
  row: Pick<
    ChemicalUseScenarioListItem,
    'homogeneousGroup' | 'homogeneousGroupId'
  >,
): boolean {
  return Boolean(row.homogeneousGroupId || getUseScenarioRealGseName(row));
}

export function presentUseScenarioGse(row: {
  exposureGroupSnapshot?: string | null;
  homogeneousGroupId?: string | null;
  homogeneousGroup?: ChemicalUseScenarioHomogeneousGroup | null;
}): UseScenarioGsePresentation {
  const realName = getUseScenarioRealGseName(row);
  if (realName) {
    return {
      kind: 'REAL',
      primary: realName,
      hint: null,
      cellText: realName,
    };
  }
  const snapshot = row.exposureGroupSnapshot?.trim() || '';
  if (snapshot) {
    return {
      kind: 'SNAPSHOT_ONLY',
      primary: snapshot,
      hint: 'sem GSE real',
      cellText: `${snapshot} · sem GSE real`,
    };
  }
  return {
    kind: 'EMPTY',
    primary: '—',
    hint: null,
    cellText: '—',
  };
}

export function formatUseScenarioGseMatchLine(
  item: Pick<
    ChemicalUseScenarioGseReconcilePreviewItem,
    'canonicalExposureCode' | 'snapshot' | 'candidates' | 'suggestedHomogeneousGroupId'
  >,
): string | null {
  const suggested =
    item.candidates.find(
      (candidate) => candidate.id === item.suggestedHomogeneousGroupId,
    ) || item.candidates[0];
  if (!suggested) return null;
  const evidence =
    item.canonicalExposureCode?.trim() || item.snapshot?.trim() || '';
  if (!evidence) return suggested.name;
  return `${evidence} → ${suggested.name}`;
}

export type UseScenarioGseReconcileGroupKind =
  | 'MATCH_UNIQUE'
  | 'AMBIGUOUS'
  | 'NO_MATCH'
  | 'ALREADY_LINKED'
  | 'CONFLICT';

export type UseScenarioGseReconcileGroup = {
  key: string;
  documentaryCode: string | null;
  kind: UseScenarioGseReconcileGroupKind;
  headline: string;
  suggestedHomogeneousGroupId: string | null;
  candidates: ChemicalUseScenarioGseReconcilePreviewItem['candidates'];
  items: ChemicalUseScenarioGseReconcilePreviewItem[];
  pendingItems: ChemicalUseScenarioGseReconcilePreviewItem[];
  alreadyLinkedItems: ChemicalUseScenarioGseReconcilePreviewItem[];
  alreadyLinkedGroupName: string | null;
  conflictReason: string | null;
};

export type UseScenarioGseReconcileDraft = {
  groupKey: string;
  included: boolean;
  selectedHomogeneousGroupId: string | null;
};

export function documentaryReconcileGroupKey(
  item: ChemicalUseScenarioGseReconcilePreviewItem,
): string {
  const code = item.canonicalExposureCode?.trim();
  if (code) return `CODE:${code}`;
  if (item.status === 'NO_MATCH' || item.status === 'ALREADY_LINKED') {
    const snapshot = item.snapshot?.trim();
    if (snapshot) return `SNAP:${snapshot}`;
  }
  return `SCENARIO:${item.scenarioId}`;
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort();
}

function candidateSignature(
  item: ChemicalUseScenarioGseReconcilePreviewItem,
) {
  return item.candidates
    .map((candidate) => candidate.id)
    .sort()
    .join('|');
}

function candidateNameById(
  items: ChemicalUseScenarioGseReconcilePreviewItem[],
  id: string | null,
) {
  if (!id) return null;
  for (const item of items) {
    const fromCandidates = item.candidates.find((candidate) => candidate.id === id);
    if (fromCandidates) return fromCandidates.name;
    if (item.currentHomogeneousGroup?.id === id) {
      return item.currentHomogeneousGroup.name;
    }
  }
  return null;
}

function classifyDocumentaryGroup(
  key: string,
  items: ChemicalUseScenarioGseReconcilePreviewItem[],
): UseScenarioGseReconcileGroup {
  const codes = uniqueSorted(items.map((item) => item.canonicalExposureCode));
  const documentaryCode = codes[0] || null;
  const alreadyLinkedItems = items.filter(
    (item) => item.status === 'ALREADY_LINKED',
  );
  const pendingItems = items.filter((item) => item.status !== 'ALREADY_LINKED');
  const linkedIds = uniqueSorted(
    alreadyLinkedItems.map((item) => item.currentHomogeneousGroup?.id),
  );
  const alreadyLinkedGroupName =
    linkedIds.length === 1
      ? candidateNameById(items, linkedIds[0])
      : null;

  const conflict = (
    reason: string,
  ): UseScenarioGseReconcileGroup => ({
    key,
    documentaryCode,
    kind: 'CONFLICT',
    headline: documentaryCode
      ? `${documentaryCode} — conflito no mesmo código`
      : 'Correspondência inconsistente',
    suggestedHomogeneousGroupId: null,
    candidates: [],
    items,
    pendingItems,
    alreadyLinkedItems,
    alreadyLinkedGroupName,
    conflictReason: reason,
  });

  if (codes.length > 1) {
    return conflict('O mesmo grupo documental veio com códigos canônicos diferentes.');
  }

  if (!pendingItems.length) {
    if (linkedIds.length !== 1) {
      return conflict(
        'Os cenários já vinculados deste código apontam para GSEs reais diferentes.',
      );
    }
    return {
      key,
      documentaryCode,
      kind: 'ALREADY_LINKED',
      headline: documentaryCode
        ? `${documentaryCode} → ${alreadyLinkedGroupName}`
        : `Já vinculado — ${alreadyLinkedGroupName}`,
      suggestedHomogeneousGroupId: null,
      candidates: [],
      items,
      pendingItems,
      alreadyLinkedItems,
      alreadyLinkedGroupName,
      conflictReason: null,
    };
  }

  const pendingStatuses = uniqueSorted(pendingItems.map((item) => item.status));
  if (pendingStatuses.length > 1) {
    return conflict(
      'O mesmo código veio com status de match incompatíveis entre os cenários pendentes.',
    );
  }

  const pendingStatus = pendingItems[0]?.status;

  if (pendingStatus === 'NO_MATCH') {
    const label = documentaryCode || items[0]?.snapshot?.trim() || 'sem código';
    return {
      key,
      documentaryCode,
      kind: 'NO_MATCH',
      headline: `${label} — sem correspondência`,
      suggestedHomogeneousGroupId: null,
      candidates: [],
      items,
      pendingItems,
      alreadyLinkedItems,
      alreadyLinkedGroupName,
      conflictReason: null,
    };
  }

  if (pendingStatus === 'MATCH_UNIQUE') {
    const suggestedIds = uniqueSorted(
      pendingItems.map((item) => item.suggestedHomogeneousGroupId),
    );
    if (suggestedIds.length !== 1) {
      return conflict(
        'MATCH_UNIQUE do mesmo código sugeriu GSEs reais diferentes.',
      );
    }
    if (linkedIds.length && linkedIds.some((id) => id !== suggestedIds[0])) {
      return conflict(
        'Há cenários já vinculados a um GSE diferente do MATCH_UNIQUE deste código.',
      );
    }
    const suggestedHomogeneousGroupId = suggestedIds[0];
    const suggestedName = candidateNameById(items, suggestedHomogeneousGroupId);
    return {
      key,
      documentaryCode,
      kind: 'MATCH_UNIQUE',
      headline:
        documentaryCode && suggestedName
          ? `${documentaryCode} → ${suggestedName}`
          : suggestedName || documentaryCode || 'Match único',
      suggestedHomogeneousGroupId,
      candidates: pendingItems[0]?.candidates || [],
      items,
      pendingItems,
      alreadyLinkedItems,
      alreadyLinkedGroupName,
      conflictReason: null,
    };
  }

  if (pendingStatus === 'AMBIGUOUS') {
    const signatures = uniqueSorted(pendingItems.map(candidateSignature));
    if (signatures.length !== 1 || !signatures[0]) {
      return conflict(
        'AMBIGUOUS do mesmo código veio com conjuntos de candidatos incompatíveis.',
      );
    }
    if (linkedIds.length > 1) {
      return conflict(
        'Os cenários já vinculados deste código ambíguo apontam para GSEs diferentes.',
      );
    }
    const candidates = pendingItems[0]?.candidates || [];
    if (
      linkedIds.length === 1 &&
      !candidates.some((candidate) => candidate.id === linkedIds[0])
    ) {
      return conflict(
        'O vínculo atual não está entre os candidatos ambíguos deste código.',
      );
    }
    const label = documentaryCode || items[0]?.snapshot?.trim() || 'grupo';
    return {
      key,
      documentaryCode,
      kind: 'AMBIGUOUS',
      headline: `${label} — escolha o GSE real`,
      suggestedHomogeneousGroupId: null,
      candidates,
      items,
      pendingItems,
      alreadyLinkedItems,
      alreadyLinkedGroupName,
      conflictReason: null,
    };
  }

  return conflict('Não foi possível consolidar este grupo documental.');
}

export function groupUseScenarioGseReconcilePreview(
  items: ChemicalUseScenarioGseReconcilePreviewItem[],
): UseScenarioGseReconcileGroup[] {
  const buckets = new Map<string, ChemicalUseScenarioGseReconcilePreviewItem[]>();
  for (const item of items) {
    const key = documentaryReconcileGroupKey(item);
    const current = buckets.get(key) || [];
    current.push(item);
    buckets.set(key, current);
  }

  const kindOrder: Record<UseScenarioGseReconcileGroupKind, number> = {
    MATCH_UNIQUE: 0,
    AMBIGUOUS: 1,
    CONFLICT: 2,
    NO_MATCH: 3,
    ALREADY_LINKED: 4,
  };

  return [...buckets.entries()]
    .map(([key, grouped]) => classifyDocumentaryGroup(key, grouped))
    .sort((left, right) => {
      const byKind = kindOrder[left.kind] - kindOrder[right.kind];
      if (byKind !== 0) return byKind;
      return (left.documentaryCode || left.key).localeCompare(
        right.documentaryCode || right.key,
        'pt-BR',
        { numeric: true, sensitivity: 'base' },
      );
    });
}

export function createUseScenarioGseReconcileDraft(
  group: UseScenarioGseReconcileGroup,
): UseScenarioGseReconcileDraft {
  if (
    group.kind === 'MATCH_UNIQUE' &&
    group.suggestedHomogeneousGroupId &&
    group.pendingItems.length
  ) {
    return {
      groupKey: group.key,
      included: true,
      selectedHomogeneousGroupId: group.suggestedHomogeneousGroupId,
    };
  }
  return {
    groupKey: group.key,
    included: false,
    selectedHomogeneousGroupId: null,
  };
}

export function canConfirmUseScenarioGseReconcileGroup(
  group: UseScenarioGseReconcileGroup,
  draft: UseScenarioGseReconcileDraft,
): boolean {
  if (!draft.included || !draft.selectedHomogeneousGroupId) return false;
  if (group.kind === 'NO_MATCH' || group.kind === 'ALREADY_LINKED') return false;
  if (group.kind === 'CONFLICT') return false;
  if (!group.pendingItems.length) return false;
  if (group.kind === 'MATCH_UNIQUE') {
    return draft.selectedHomogeneousGroupId === group.suggestedHomogeneousGroupId;
  }
  if (group.kind === 'AMBIGUOUS') {
    return group.candidates.some(
      (candidate) => candidate.id === draft.selectedHomogeneousGroupId,
    );
  }
  return false;
}

export function expandUseScenarioGseReconcileGroupLinks(
  group: UseScenarioGseReconcileGroup,
  draft: UseScenarioGseReconcileDraft,
): ChemicalUseScenarioGseReconcileLink[] {
  if (!canConfirmUseScenarioGseReconcileGroup(group, draft)) return [];
  const homogeneousGroupId = draft.selectedHomogeneousGroupId as string;
  return group.pendingItems
    .filter((item) => {
      if (item.status === 'NO_MATCH' || item.status === 'ALREADY_LINKED') {
        return false;
      }
      if (item.status === 'MATCH_UNIQUE') {
        return item.suggestedHomogeneousGroupId === homogeneousGroupId;
      }
      if (item.status === 'AMBIGUOUS') {
        return item.candidates.some((candidate) => candidate.id === homogeneousGroupId);
      }
      return false;
    })
    .map((item) => ({
      scenarioId: item.scenarioId,
      homogeneousGroupId,
    }));
}

export function buildUseScenarioGseReconcileApplyPayload(params: {
  previewFingerprint: string;
  groups: UseScenarioGseReconcileGroup[];
  drafts: UseScenarioGseReconcileDraft[];
}):
  | { ok: true; body: ChemicalUseScenarioGseReconcileApplyPayload }
  | { ok: false; error: string } {
  const fingerprint = params.previewFingerprint.trim();
  if (!fingerprint) {
    return { ok: false, error: 'previewFingerprint é obrigatório.' };
  }

  const groupByKey = new Map(
    params.groups.map((group) => [group.key, group]),
  );
  const links: ChemicalUseScenarioGseReconcileLink[] = [];

  for (const draft of params.drafts) {
    const group = groupByKey.get(draft.groupKey);
    if (!group) continue;
    links.push(...expandUseScenarioGseReconcileGroupLinks(group, draft));
  }

  if (!links.length) {
    return {
      ok: false,
      error: 'Confirme ao menos um vínculo antes de aplicar.',
    };
  }

  return {
    ok: true,
    body: {
      previewFingerprint: fingerprint,
      links,
    },
  };
}

export function formatUseScenarioGseGroupImpact(group: UseScenarioGseReconcileGroup) {
  const pending = group.pendingItems.length;
  const linked = group.alreadyLinkedItems.length;
  if (group.kind === 'ALREADY_LINKED') {
    return `Já vinculado — ${linked} ${linked === 1 ? 'cenário' : 'cenários'}`;
  }
  if (group.kind === 'NO_MATCH') {
    return `${pending} ${pending === 1 ? 'cenário ficou' : 'cenários ficaram'} sem correspondência`;
  }
  if (linked && pending) {
    return `${linked} já vinculado${linked === 1 ? '' : 's'} · ${pending} ${
      pending === 1 ? 'será vinculado' : 'serão vinculados'
    }`;
  }
  return `Aplicável a ${pending} ${pending === 1 ? 'cenário' : 'cenários'}`;
}

export function countUseScenarioGseReconcileStatuses(
  items: ChemicalUseScenarioGseReconcilePreviewItem[],
) {
  return {
    total: items.length,
    alreadyLinked: items.filter((item) => item.status === 'ALREADY_LINKED')
      .length,
    matchUnique: items.filter((item) => item.status === 'MATCH_UNIQUE').length,
    noMatch: items.filter((item) => item.status === 'NO_MATCH').length,
    ambiguous: items.filter((item) => item.status === 'AMBIGUOUS').length,
  };
}

export function identifyUseScenarioForReconcile(
  item: ChemicalUseScenarioGseReconcilePreviewItem,
  rows: Array<
    Pick<ChemicalUseScenarioBoardRow, 'id' | 'activityName' | 'product'>
  >,
) {
  const row = rows.find((candidate) => candidate.id === item.scenarioId);
  return {
    productName: row?.product?.tradeName?.trim() || 'Produto não identificado',
    activityName: row?.activityName?.trim() || '—',
  };
}

export function isChemicalUseScenarioReconcileStaleError(error: unknown) {
  const payload = (
    error as {
      response?: {
        status?: number;
        data?: {
          code?: unknown;
          message?: unknown;
        };
      };
    }
  )?.response;
  if (payload?.status !== 409) return false;
  const data = payload.data;
  if (data?.code === CHEMICAL_USE_SCENARIO_RECONCILE_STALE_CODE) return true;
  if (
    data?.message &&
    typeof data.message === 'object' &&
    data.message &&
    'code' in data.message &&
    (data.message as { code?: unknown }).code ===
      CHEMICAL_USE_SCENARIO_RECONCILE_STALE_CODE
  ) {
    return true;
  }
  return false;
}

export function chemicalUseScenarioSurveyStatusUnchangedByGseLink(params: {
  surveyStatus: ChemicalUseScenarioListItem['surveyStatus'] | null;
  homogeneousGroupId?: string | null;
}) {
  return params.surveyStatus;
}

export function unlinkPreservesExposureSnapshot(params: {
  exposureGroupSnapshot: string | null;
  homogeneousGroupId: null;
}) {
  return {
    exposureGroupSnapshot: params.exposureGroupSnapshot,
    homogeneousGroupId: params.homogeneousGroupId,
  };
}

export type PreviewIdentity = Pick<
  ChemicalUseScenarioGseReconcilePreview,
  'previewFingerprint' | 'items'
>;
