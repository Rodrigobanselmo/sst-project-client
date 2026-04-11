import { getFormParticipantSectorLabel } from '@v2/models/form/helpers/form-participant-hierarchy-display';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

export type SectorAggregateRow = {
  sectorLabel: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

export function buildSectorAggregates(
  rows: FormParticipantsBrowseResultModel[],
): SectorAggregateRow[] {
  const map = new Map<
    string,
    { sectorLabel: string; total: number; responded: number }
  >();

  for (const row of rows) {
    const label = getFormParticipantSectorLabel(row);
    const cur = map.get(label) ?? { sectorLabel: label, total: 0, responded: 0 };
    cur.total += 1;
    if (row.hasResponded) cur.responded += 1;
    map.set(label, cur);
  }

  return Array.from(map.values())
    .map((g) => {
      const notResponded = Math.max(0, g.total - g.responded);
      const responseRatePercent =
        g.total > 0
          ? Math.round((g.responded / g.total) * 1000) / 10
          : 0;
      return {
        sectorLabel: g.sectorLabel,
        total: g.total,
        responded: g.responded,
        notResponded,
        responseRatePercent,
      };
    })
    .sort((a, b) =>
      a.sectorLabel.localeCompare(b.sectorLabel, 'pt-BR', {
        sensitivity: 'base',
      }),
    );
}
