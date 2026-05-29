import { getFormParticipantSectorLabel } from '@v2/models/form/helpers/form-participant-hierarchy-display';
import {
  buildSectorAggregates,
  type SectorAggregateRow,
} from '@v2/models/form/helpers/form-participants-aggregate-by-sector';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

export type HierarchyGroupForParticipants = {
  id: string;
  name: string;
  hierarchyIds: string[];
};

export const FORM_PARTICIPANT_UNGROUPED_HIERARCHY_GROUP_LABEL =
  'Sem agrupamento configurado';

export type HierarchyGroupAggregateRow = {
  label: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

export type SectorWithHierarchyGroupBlock = {
  groupLabel: string;
  groupId?: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
  sectors: SectorAggregateRow[];
};

export function getParticipantHierarchyIds(
  row: FormParticipantsBrowseResultModel,
): Set<string> {
  const ids = new Set<string>();
  if (row.hierarchyId) {
    ids.add(row.hierarchyId);
  }
  for (const h of row.hierarchies) {
    if (h.id) {
      ids.add(h.id);
    }
  }
  return ids;
}

export function resolveParticipantHierarchyGroup(
  row: FormParticipantsBrowseResultModel,
  groups: HierarchyGroupForParticipants[],
): HierarchyGroupForParticipants | null {
  if (!groups.length) {
    return null;
  }

  const participantIds = getParticipantHierarchyIds(row);

  for (const group of groups) {
    if (group.hierarchyIds.some((id) => participantIds.has(id))) {
      return group;
    }
  }

  return null;
}

function computeTotals(rows: FormParticipantsBrowseResultModel[]) {
  const total = rows.length;
  const responded = rows.filter((r) => r.hasResponded).length;
  const notResponded = Math.max(0, total - responded);
  const responseRatePercent =
    total > 0 ? Math.round((responded / total) * 1000) / 10 : 0;

  return { total, responded, notResponded, responseRatePercent };
}

function toAggregateRow(
  label: string,
  rows: FormParticipantsBrowseResultModel[],
): HierarchyGroupAggregateRow {
  return {
    label,
    ...computeTotals(rows),
  };
}

function sortByLabel<T extends { label?: string; groupLabel?: string }>(
  items: T[],
  labelKey: 'label' | 'groupLabel',
): T[] {
  return [...items].sort((a, b) =>
    (labelKey === 'label' ? a.label! : a.groupLabel!).localeCompare(
      labelKey === 'label' ? b.label! : b.groupLabel!,
      'pt-BR',
      { sensitivity: 'base' },
    ),
  );
}

/**
 * Agrupamento plano: uma linha por agrupamento configurado + uma linha por setor sem grupo.
 * Sem grupos cadastrados, equivale ao agrupado por setor.
 */
export function buildHierarchyGroupAggregates(
  rows: FormParticipantsBrowseResultModel[],
  groups: HierarchyGroupForParticipants[],
): HierarchyGroupAggregateRow[] {
  if (!groups.length) {
    return buildSectorAggregates(rows).map((s) => ({
      label: s.sectorLabel,
      total: s.total,
      responded: s.responded,
      notResponded: s.notResponded,
      responseRatePercent: s.responseRatePercent,
    }));
  }

  const groupRows = new Map<string, FormParticipantsBrowseResultModel[]>();
  for (const g of groups) {
    groupRows.set(g.id, []);
  }

  const ungroupedBySector = new Map<
    string,
    FormParticipantsBrowseResultModel[]
  >();

  for (const row of rows) {
    const match = resolveParticipantHierarchyGroup(row, groups);
    if (match) {
      groupRows.get(match.id)!.push(row);
    } else {
      const sectorLabel = getFormParticipantSectorLabel(row);
      const list = ungroupedBySector.get(sectorLabel) ?? [];
      list.push(row);
      ungroupedBySector.set(sectorLabel, list);
    }
  }

  const result: HierarchyGroupAggregateRow[] = [];

  for (const group of groups) {
    const bucket = groupRows.get(group.id) ?? [];
    if (bucket.length === 0) {
      continue;
    }
    result.push(toAggregateRow(group.name, bucket));
  }

  for (const [sectorLabel, sectorRows] of ungroupedBySector) {
    result.push(toAggregateRow(sectorLabel, sectorRows));
  }

  return sortByLabel(result, 'label');
}

/**
 * Agrupamento aninhado: bloco por agrupamento com sublinhas por setor;
 * setores sem grupo em bloco dedicado.
 */
export function buildSectorWithHierarchyGroupAggregates(
  rows: FormParticipantsBrowseResultModel[],
  groups: HierarchyGroupForParticipants[],
): SectorWithHierarchyGroupBlock[] {
  if (!groups.length) {
    const sectors = buildSectorAggregates(rows);
    if (sectors.length === 0) {
      return [];
    }

    const totals = computeTotals(rows);
    return [
      {
        groupLabel: FORM_PARTICIPANT_UNGROUPED_HIERARCHY_GROUP_LABEL,
        ...totals,
        sectors,
      },
    ];
  }

  const blocks = new Map<
    string,
    { label: string; rows: FormParticipantsBrowseResultModel[] }
  >();
  for (const g of groups) {
    blocks.set(g.id, { label: g.name, rows: [] });
  }

  const ungroupedRows: FormParticipantsBrowseResultModel[] = [];

  for (const row of rows) {
    const match = resolveParticipantHierarchyGroup(row, groups);
    if (match) {
      blocks.get(match.id)!.rows.push(row);
    } else {
      ungroupedRows.push(row);
    }
  }

  const result: SectorWithHierarchyGroupBlock[] = [];

  for (const group of groups) {
    const bucket = blocks.get(group.id);
    if (!bucket || bucket.rows.length === 0) {
      continue;
    }

    result.push({
      groupId: group.id,
      groupLabel: bucket.label,
      ...computeTotals(bucket.rows),
      sectors: buildSectorAggregates(bucket.rows),
    });
  }

  if (ungroupedRows.length > 0) {
    result.push({
      groupLabel: FORM_PARTICIPANT_UNGROUPED_HIERARCHY_GROUP_LABEL,
      ...computeTotals(ungroupedRows),
      sectors: buildSectorAggregates(ungroupedRows),
    });
  }

  return sortByLabel(result, 'groupLabel');
}
