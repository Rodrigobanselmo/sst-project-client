import {
  getFormParticipantEstablishmentLabel,
} from '@v2/models/form/helpers/form-participants-aggregate-by-establishment';
import {
  buildSectorAggregates,
  type SectorAggregateRow,
} from '@v2/models/form/helpers/form-participants-aggregate-by-sector';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

const NO_ESTABLISHMENT_GROUP_KEY = '__no_establishment__';

export type EstablishmentSectorGroup = {
  establishmentLabel: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
  sectors: SectorAggregateRow[];
};

function getEstablishmentGroupKey(row: FormParticipantsBrowseResultModel): string {
  if (row.workspaceId) return row.workspaceId;
  return NO_ESTABLISHMENT_GROUP_KEY;
}

export function buildEstablishmentSectorAggregates(
  rows: FormParticipantsBrowseResultModel[],
): EstablishmentSectorGroup[] {
  const byEstablishment = new Map<string, FormParticipantsBrowseResultModel[]>();

  for (const row of rows) {
    const key = getEstablishmentGroupKey(row);
    const list = byEstablishment.get(key) ?? [];
    list.push(row);
    byEstablishment.set(key, list);
  }

  const groups: EstablishmentSectorGroup[] = [];

  for (const estRows of byEstablishment.values()) {
    if (estRows.length === 0) continue;

    const establishmentLabel = getFormParticipantEstablishmentLabel(estRows[0]);
    const sectors = buildSectorAggregates(estRows);
    const total = estRows.length;
    const responded = estRows.filter((r) => r.hasResponded).length;
    const notResponded = Math.max(0, total - responded);
    const responseRatePercent =
      total > 0 ? Math.round((responded / total) * 1000) / 10 : 0;

    groups.push({
      establishmentLabel,
      total,
      responded,
      notResponded,
      responseRatePercent,
      sectors,
    });
  }

  return groups.sort((a, b) =>
    a.establishmentLabel.localeCompare(b.establishmentLabel, 'pt-BR', {
      sensitivity: 'base',
    }),
  );
}
