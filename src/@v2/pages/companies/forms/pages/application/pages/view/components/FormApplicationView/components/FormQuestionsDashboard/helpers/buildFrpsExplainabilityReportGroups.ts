import type {
  FrpsInventoryInclusion,
  FrpsTechnicalReportItemType,
  FrpsTechnicalReportPendingItem,
  FrpsTechnicalReportRisk,
  FrpsTechnicalReportRiskRef,
  FrpsTechnicalReportValidatedItem,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability-technical-report/frps-explainability-technical-report.types';

const ITEM_TYPE_ORDER: Record<FrpsTechnicalReportItemType, number> = {
  GENERATE_SOURCE: 0,
  REC_MED_ADMIN: 1,
  REC_MED_ENGINEERING: 2,
};

export type FrpsReportValidatedFullEntry = {
  kind: 'full';
  item: FrpsTechnicalReportValidatedItem;
};

export type FrpsReportValidatedReferenceEntry = {
  kind: 'reference';
  itemKey: string;
  name: string;
  itemType: FrpsTechnicalReportItemType;
  primaryFrpsName: string;
};

export type FrpsReportValidatedEntry =
  | FrpsReportValidatedFullEntry
  | FrpsReportValidatedReferenceEntry;

export type FrpsReportGroupCounts = {
  validatedSources: number;
  validatedAdministrative: number;
  validatedEngineering: number;
  pending: number;
};

export type FrpsExplainabilityReportGroup = {
  riskId: string;
  riskName: string;
  inventoryInclusion: FrpsInventoryInclusion;
  counts: FrpsReportGroupCounts;
  sources: FrpsReportValidatedEntry[];
  administrative: FrpsReportValidatedEntry[];
  engineering: FrpsReportValidatedEntry[];
  pending: FrpsTechnicalReportPendingItem[];
};

export type FrpsExplainabilityReportSummaryRow = {
  riskId: string;
  riskName: string;
  inventoryInclusion: FrpsInventoryInclusion;
  validatedSources: number;
  validatedAdministrative: number;
  validatedEngineering: number;
  pending: number;
};

export type FrpsExplainabilityReportGroupsResult = {
  groups: FrpsExplainabilityReportGroup[];
  pendingWithoutFrps: FrpsTechnicalReportPendingItem[];
  frpsSummary: FrpsExplainabilityReportSummaryRow[];
};

function comparePt(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function sortRisks(
  risks: FrpsTechnicalReportRiskRef[],
): FrpsTechnicalReportRiskRef[] {
  return [...risks].sort((a, b) => {
    const byName = comparePt(a.riskName, b.riskName);
    if (byName !== 0) return byName;
    return a.riskId.localeCompare(b.riskId);
  });
}

function isApplicableInclusion(inclusion: FrpsInventoryInclusion): boolean {
  return inclusion !== 'NOT_INCLUDED';
}

/** FRPS principal só entre riscos aplicáveis (INCLUDED/PARTIAL). */
export function resolvePrimaryFrpsRisk(
  risks: FrpsTechnicalReportRiskRef[],
  frpsById?: Map<string, FrpsTechnicalReportRisk>,
): FrpsTechnicalReportRiskRef | null {
  const applicable = frpsById?.size
    ? risks.filter((risk) => {
        const meta = frpsById.get(risk.riskId);
        return meta ? isApplicableInclusion(meta.inventoryInclusion) : false;
      })
    : risks;
  const sorted = sortRisks(applicable);
  return sorted[0] ?? null;
}

function sortValidatedEntries(
  entries: FrpsReportValidatedEntry[],
): FrpsReportValidatedEntry[] {
  return [...entries].sort((a, b) => {
    const nameA = a.kind === 'full' ? a.item.name : a.name;
    const nameB = b.kind === 'full' ? b.item.name : b.name;
    return comparePt(nameA, nameB);
  });
}

function sortPendingItems(
  items: FrpsTechnicalReportPendingItem[],
): FrpsTechnicalReportPendingItem[] {
  return [...items].sort((a, b) => {
    const typeDiff =
      ITEM_TYPE_ORDER[a.itemType] - ITEM_TYPE_ORDER[b.itemType];
    if (typeDiff !== 0) return typeDiff;
    return comparePt(a.name, b.name);
  });
}

function emptyCounts(): FrpsReportGroupCounts {
  return {
    validatedSources: 0,
    validatedAdministrative: 0,
    validatedEngineering: 0,
    pending: 0,
  };
}

function createGroup(
  risk: Pick<FrpsTechnicalReportRisk, 'riskId' | 'riskName' | 'inventoryInclusion'>,
): FrpsExplainabilityReportGroup {
  return {
    riskId: risk.riskId,
    riskName: risk.riskName,
    inventoryInclusion: risk.inventoryInclusion,
    counts: emptyCounts(),
    sources: [],
    administrative: [],
    engineering: [],
    pending: [],
  };
}

function pushValidatedEntry(
  group: FrpsExplainabilityReportGroup,
  entry: FrpsReportValidatedEntry,
  itemType: FrpsTechnicalReportItemType,
): void {
  if (itemType === 'GENERATE_SOURCE') {
    group.sources.push(entry);
    group.counts.validatedSources += 1;
    return;
  }
  if (itemType === 'REC_MED_ADMIN') {
    group.administrative.push(entry);
    group.counts.validatedAdministrative += 1;
    return;
  }
  group.engineering.push(entry);
  group.counts.validatedEngineering += 1;
}

/**
 * Agrupa o relatório técnico por FRPS (eixo principal).
 * Inventário: usa `frps[]` da API; não reconstrói inclusão por ausência de items.
 */
export function buildFrpsExplainabilityReportGroups(params: {
  items: FrpsTechnicalReportValidatedItem[];
  pendingItems: FrpsTechnicalReportPendingItem[];
  frps?: FrpsTechnicalReportRisk[];
}): FrpsExplainabilityReportGroupsResult {
  const frpsMeta = params.frps ?? [];
  const hasFrpsMeta = frpsMeta.length > 0;
  const frpsById = new Map(frpsMeta.map((row) => [row.riskId, row]));
  const groupsByRiskId = new Map<string, FrpsExplainabilityReportGroup>();

  for (const meta of frpsMeta) {
    groupsByRiskId.set(meta.riskId, createGroup(meta));
  }

  const ensureApplicableGroup = (
    risk: FrpsTechnicalReportRiskRef,
  ): FrpsExplainabilityReportGroup | null => {
    if (hasFrpsMeta) {
      const group = groupsByRiskId.get(risk.riskId);
      if (!group || !isApplicableInclusion(group.inventoryInclusion)) {
        return null;
      }
      return group;
    }
    let group = groupsByRiskId.get(risk.riskId);
    if (!group) {
      group = createGroup({
        riskId: risk.riskId,
        riskName: risk.riskName,
        inventoryInclusion: 'INCLUDED',
      });
      groupsByRiskId.set(risk.riskId, group);
    }
    return group;
  };

  const filterApplicableRisks = (
    risks: FrpsTechnicalReportRiskRef[],
  ): FrpsTechnicalReportRiskRef[] => {
    if (!hasFrpsMeta) return sortRisks(risks);
    return sortRisks(
      risks.filter((risk) => {
        const meta = frpsById.get(risk.riskId);
        return meta ? isApplicableInclusion(meta.inventoryInclusion) : false;
      }),
    );
  };

  for (const item of params.items) {
    const primary = resolvePrimaryFrpsRisk(
      item.risks,
      hasFrpsMeta ? frpsById : undefined,
    );
    if (!primary) continue;

    const applicableRisks = filterApplicableRisks(item.risks);
    for (const risk of applicableRisks) {
      const group = ensureApplicableGroup(risk);
      if (!group) continue;

      if (risk.riskId === primary.riskId) {
        pushValidatedEntry(group, { kind: 'full', item }, item.itemType);
      } else {
        pushValidatedEntry(
          group,
          {
            kind: 'reference',
            itemKey: item.itemKey,
            name: item.name,
            itemType: item.itemType,
            primaryFrpsName: primary.riskName,
          },
          item.itemType,
        );
      }
    }
  }

  const pendingWithoutFrps: FrpsTechnicalReportPendingItem[] = [];

  for (const pending of params.pendingItems) {
    const risks = pending.risks ?? [];
    if (!risks.length) {
      pendingWithoutFrps.push(pending);
      continue;
    }

    const applicableRisks = filterApplicableRisks(risks);
    if (!applicableRisks.length) continue;

    for (const risk of applicableRisks) {
      const group = ensureApplicableGroup(risk);
      if (!group) continue;
      group.pending.push(pending);
      group.counts.pending += 1;
    }
  }

  const groups = [...groupsByRiskId.values()]
    .sort((a, b) => {
      const byName = comparePt(a.riskName, b.riskName);
      if (byName !== 0) return byName;
      return a.riskId.localeCompare(b.riskId);
    })
    .map((group) => {
      if (group.inventoryInclusion === 'NOT_INCLUDED') {
        return {
          ...group,
          counts: emptyCounts(),
          sources: [],
          administrative: [],
          engineering: [],
          pending: [],
        };
      }
      return {
        ...group,
        sources: sortValidatedEntries(group.sources),
        administrative: sortValidatedEntries(group.administrative),
        engineering: sortValidatedEntries(group.engineering),
        pending: sortPendingItems(group.pending),
      };
    });

  return {
    groups,
    pendingWithoutFrps: sortPendingItems(pendingWithoutFrps),
    frpsSummary: groups.map((group) => ({
      riskId: group.riskId,
      riskName: group.riskName,
      inventoryInclusion: group.inventoryInclusion,
      validatedSources: group.counts.validatedSources,
      validatedAdministrative: group.counts.validatedAdministrative,
      validatedEngineering: group.counts.validatedEngineering,
      pending: group.counts.pending,
    })),
  };
}
