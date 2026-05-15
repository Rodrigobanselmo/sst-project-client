import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

export const FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL = 'Sem estabelecimento';

const NO_ESTABLISHMENT_GROUP_KEY = '__no_establishment__';

export type EstablishmentAggregateRow = {
  establishmentLabel: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

export function getFormParticipantEstablishmentLabel(
  row: FormParticipantsBrowseResultModel,
): string {
  const name = row.workspaceName?.trim();
  if (name) return name;
  return FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL;
}

function getEstablishmentGroupKey(row: FormParticipantsBrowseResultModel): string {
  if (row.workspaceId) return row.workspaceId;
  return NO_ESTABLISHMENT_GROUP_KEY;
}

export function buildEstablishmentAggregates(
  rows: FormParticipantsBrowseResultModel[],
): EstablishmentAggregateRow[] {
  const map = new Map<
    string,
    { establishmentLabel: string; total: number; responded: number }
  >();

  for (const row of rows) {
    const key = getEstablishmentGroupKey(row);
    const label = getFormParticipantEstablishmentLabel(row);
    const cur =
      map.get(key) ?? { establishmentLabel: label, total: 0, responded: 0 };
    cur.total += 1;
    if (row.hasResponded) cur.responded += 1;
    map.set(key, cur);
  }

  return Array.from(map.values())
    .map((g) => {
      const notResponded = Math.max(0, g.total - g.responded);
      const responseRatePercent =
        g.total > 0 ? Math.round((g.responded / g.total) * 1000) / 10 : 0;
      return {
        establishmentLabel: g.establishmentLabel,
        total: g.total,
        responded: g.responded,
        notResponded,
        responseRatePercent,
      };
    })
    .sort((a, b) =>
      a.establishmentLabel.localeCompare(b.establishmentLabel, 'pt-BR', {
        sensitivity: 'base',
      }),
    );
}
