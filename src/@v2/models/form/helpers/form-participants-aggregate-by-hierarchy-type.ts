import { getFormParticipantHierarchyLabelByType } from '@v2/models/form/helpers/form-participant-hierarchy-display';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export type HierarchyTypeAggregateRow = {
  groupLabel: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

export function buildHierarchyTypeAggregates(
  rows: FormParticipantsBrowseResultModel[],
  type: HierarchyTypeEnum,
  missingLabel: string,
): HierarchyTypeAggregateRow[] {
  const map = new Map<
    string,
    { groupLabel: string; total: number; responded: number }
  >();

  for (const row of rows) {
    const label = getFormParticipantHierarchyLabelByType(row, type, missingLabel);
    const cur = map.get(label) ?? { groupLabel: label, total: 0, responded: 0 };
    cur.total += 1;
    if (row.hasResponded) cur.responded += 1;
    map.set(label, cur);
  }

  return Array.from(map.values())
    .map((g) => {
      const notResponded = Math.max(0, g.total - g.responded);
      const responseRatePercent =
        g.total > 0 ? Math.round((g.responded / g.total) * 1000) / 10 : 0;
      return {
        groupLabel: g.groupLabel,
        total: g.total,
        responded: g.responded,
        notResponded,
        responseRatePercent,
      };
    })
    .sort((a, b) =>
      a.groupLabel.localeCompare(b.groupLabel, 'pt-BR', {
        sensitivity: 'base',
      }),
    );
}
