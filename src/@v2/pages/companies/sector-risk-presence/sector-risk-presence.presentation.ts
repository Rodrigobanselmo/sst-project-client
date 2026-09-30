import { SectorRiskPresence } from '@v2/services/security/sector-risk-presence/sector-risk-presence.types';

export type SectorRiskPresenceOrientation = 'RISKS_IN_ROWS' | 'SECTORS_IN_ROWS';

export const SECTOR_RISK_PRESENCE_INK = '#1A202C';
export const SECTOR_RISK_PRESENCE_GRID = '#E2E8F0';
export const SECTOR_RISK_PRESENCE_SURFACE = '#FFFFFF';
export const SECTOR_RISK_PRESENCE_BAND = '#F7F8FA';
export const SECTOR_RISK_PRESENCE_MARK = '●';
export const SECTOR_RISK_PRESENCE_LEGEND = '● Presença do fator de risco no setor';

/** Same muted ticks as the homologated DOCX. Read from the label prefix only. */
const CATEGORY_ACCENT: Record<string, string> = {
  FIS: '#7A8CA3',
  QUI: '#8D7B6A',
  BIO: '#6F8068',
  ERG: '#7D7388',
  ACI: '#6E7882',
};

export type SectorRiskPresenceAxisItem = {
  id: string;
  label: string;
  accent?: string;
};

export type PresentedSectorRiskPresence = {
  rows: SectorRiskPresenceAxisItem[];
  columns: SectorRiskPresenceAxisItem[];
  cells: boolean[][];
};

export function sectorRiskPresenceAccent(label?: string): string | undefined {
  const code = label?.match(/^\(([A-Z]+)/)?.[1];
  return code ? CATEGORY_ACCENT[code] : undefined;
}

export function presentSectorRiskPresence(
  data: SectorRiskPresence,
  orientation: SectorRiskPresenceOrientation,
): PresentedSectorRiskPresence {
  const risks = new Map(data.risks.map((risk) => [risk.id, risk]));
  const sectors = new Map(data.sectors.map((sector) => [sector.id, sector]));
  const presences = new Set(
    data.presences.map((presence) => `${presence.riskId}:${presence.sectorId}`),
  );
  const risksInRows = orientation === 'RISKS_IN_ROWS';
  const rowIds = risksInRows ? data.riskOrder.rows : data.sectorOrder;
  const columnIds = risksInRows ? data.sectorOrder : data.riskOrder.columns;

  const axisItem = (id: string, asRisk: boolean): SectorRiskPresenceAxisItem => {
    if (asRisk) {
      const risk = risks.get(id);
      const label = risk?.label || '';
      return { id, label, accent: sectorRiskPresenceAccent(label) };
    }
    return { id, label: sectors.get(id)?.name || '' };
  };

  const rows = rowIds.map((id) => axisItem(id, risksInRows));
  const columns = columnIds.map((id) => axisItem(id, !risksInRows));
  const cells = rows.map((row) =>
    columns.map((column) => {
      const riskId = risksInRows ? row.id : column.id;
      const sectorId = risksInRows ? column.id : row.id;
      return presences.has(`${riskId}:${sectorId}`);
    }),
  );

  return { rows, columns, cells };
}
