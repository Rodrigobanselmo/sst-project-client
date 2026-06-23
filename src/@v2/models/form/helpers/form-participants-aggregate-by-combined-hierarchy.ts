import { getFormParticipantEstablishmentLabel } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment';
import { getFormParticipantHierarchyLabelByType } from '@v2/models/form/helpers/form-participant-hierarchy-display';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export type CombinedHierarchyLevelKind =
  | 'ESTABLISHMENT'
  | HierarchyTypeEnum.DIRECTORY
  | HierarchyTypeEnum.MANAGEMENT
  | HierarchyTypeEnum.SECTOR
  | HierarchyTypeEnum.SUB_SECTOR;

export type CombinedHierarchyLevelConfig = {
  kind: CombinedHierarchyLevelKind;
  missingLabel: string;
};

export type CombinedHierarchyAggregateRow = {
  groupLabel: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

export type CombinedHierarchyGroupMetrics = {
  label: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

export type CombinedHierarchyNestedGroup = CombinedHierarchyGroupMetrics & {
  key: string;
  depth: number;
  subgroups: CombinedHierarchyNestedGroup[];
  leaves: CombinedHierarchyGroupMetrics[];
};

function compareLabels(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

export function resolveCombinedHierarchyLevelLabel(
  row: FormParticipantsBrowseResultModel,
  level: CombinedHierarchyLevelConfig,
): string {
  if (level.kind === 'ESTABLISHMENT') {
    return getFormParticipantEstablishmentLabel(row);
  }

  return getFormParticipantHierarchyLabelByType(
    row,
    level.kind,
    level.missingLabel,
  );
}

export function buildCombinedHierarchyGroupLabel(
  row: FormParticipantsBrowseResultModel,
  levels: CombinedHierarchyLevelConfig[],
): string {
  return levels
    .map((level) => resolveCombinedHierarchyLevelLabel(row, level))
    .join(' / ');
}

function computeGroupMetrics(
  groupRows: FormParticipantsBrowseResultModel[],
): Omit<CombinedHierarchyGroupMetrics, 'label'> {
  const total = groupRows.length;
  const responded = groupRows.filter((row) => row.hasResponded).length;
  const notResponded = Math.max(0, total - responded);
  const responseRatePercent =
    total > 0 ? Math.round((responded / total) * 1000) / 10 : 0;

  return {
    total,
    responded,
    notResponded,
    responseRatePercent,
  };
}

function buildLeavesForLevel(
  rows: FormParticipantsBrowseResultModel[],
  level: CombinedHierarchyLevelConfig,
): CombinedHierarchyGroupMetrics[] {
  const map = new Map<string, FormParticipantsBrowseResultModel[]>();

  for (const row of rows) {
    const label = resolveCombinedHierarchyLevelLabel(row, level);
    const list = map.get(label) ?? [];
    list.push(row);
    map.set(label, list);
  }

  return Array.from(map.entries())
    .sort(([labelA], [labelB]) => compareLabels(labelA, labelB))
    .map(([label, groupRows]) => ({
      label,
      ...computeGroupMetrics(groupRows),
    }));
}

function buildNestedGroups(
  rows: FormParticipantsBrowseResultModel[],
  levels: CombinedHierarchyLevelConfig[],
  depth: number,
  parentKey: string,
): CombinedHierarchyNestedGroup[] {
  if (rows.length === 0 || levels.length === 0) return [];

  const [currentLevel, ...remainingLevels] = levels;
  const groups = new Map<string, FormParticipantsBrowseResultModel[]>();

  for (const row of rows) {
    const label = resolveCombinedHierarchyLevelLabel(row, currentLevel);
    const list = groups.get(label) ?? [];
    list.push(row);
    groups.set(label, list);
  }

  return Array.from(groups.entries())
    .sort(([labelA], [labelB]) => compareLabels(labelA, labelB))
    .map(([label, groupRows]) => {
      const key = parentKey ? `${parentKey}>>${label}` : label;
      const metrics = computeGroupMetrics(groupRows);

      if (remainingLevels.length === 1) {
        return {
          key,
          depth,
          label,
          ...metrics,
          subgroups: [],
          leaves: buildLeavesForLevel(groupRows, remainingLevels[0]),
        };
      }

      return {
        key,
        depth,
        label,
        ...metrics,
        subgroups: buildNestedGroups(
          groupRows,
          remainingLevels,
          depth + 1,
          key,
        ),
        leaves: [],
      };
    });
}

export function buildCombinedHierarchyNestedAggregates(
  rows: FormParticipantsBrowseResultModel[],
  levels: CombinedHierarchyLevelConfig[],
): CombinedHierarchyNestedGroup[] {
  if (levels.length < 2) {
    if (levels.length === 0) return [];

    const leaves = buildLeavesForLevel(rows, levels[0]);
    return leaves.map((leaf) => ({
      key: leaf.label,
      depth: 0,
      label: leaf.label,
      total: leaf.total,
      responded: leaf.responded,
      notResponded: leaf.notResponded,
      responseRatePercent: leaf.responseRatePercent,
      subgroups: [],
      leaves: [],
    }));
  }

  return buildNestedGroups(rows, levels, 0, '');
}

export function buildCombinedHierarchyAggregates(
  rows: FormParticipantsBrowseResultModel[],
  levels: CombinedHierarchyLevelConfig[],
): CombinedHierarchyAggregateRow[] {
  const map = new Map<
    string,
    { groupLabel: string; total: number; responded: number }
  >();

  for (const row of rows) {
    const label = buildCombinedHierarchyGroupLabel(row, levels);
    const current = map.get(label) ?? { groupLabel: label, total: 0, responded: 0 };
    current.total += 1;
    if (row.hasResponded) current.responded += 1;
    map.set(label, current);
  }

  return Array.from(map.values())
    .map((group) => {
      const notResponded = Math.max(0, group.total - group.responded);
      const responseRatePercent =
        group.total > 0
          ? Math.round((group.responded / group.total) * 1000) / 10
          : 0;

      return {
        groupLabel: group.groupLabel,
        total: group.total,
        responded: group.responded,
        notResponded,
        responseRatePercent,
      };
    })
    .sort((a, b) => compareLabels(a.groupLabel, b.groupLabel));
}

export function flattenCombinedHierarchyNestedLeaves(
  groups: CombinedHierarchyNestedGroup[],
): CombinedHierarchyGroupMetrics[] {
  const leaves: CombinedHierarchyGroupMetrics[] = [];

  const visit = (group: CombinedHierarchyNestedGroup) => {
    if (group.leaves.length > 0) {
      leaves.push(...group.leaves);
      return;
    }

    if (group.subgroups.length === 0 && group.total > 0) {
      leaves.push({
        label: group.label,
        total: group.total,
        responded: group.responded,
        notResponded: group.notResponded,
        responseRatePercent: group.responseRatePercent,
      });
      return;
    }

    group.subgroups.forEach(visit);
  };

  groups.forEach(visit);
  return leaves;
}
