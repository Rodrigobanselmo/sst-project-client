export type SectorRiskPresenceRisk = {
  id: string;
  label: string;
  typeOrder: number;
};

export type SectorRiskPresenceSector = {
  id: string;
  name: string;
};

export type SectorRiskPresenceOriginKind = 'GSE' | 'HIERARCHY' | 'CHARACTERIZATION';

export type SectorRiskPresenceOrigin = {
  id: string;
  label: string;
  name: string;
  typeLabel: string;
  kind: SectorRiskPresenceOriginKind;
  ghoType: string | null;
  ghoName: string;
  hierarchyName?: string;
};

export type SectorRiskPresence = {
  risks: SectorRiskPresenceRisk[];
  sectors: SectorRiskPresenceSector[];
  presences: { riskId: string; sectorId: string; originIds: string[] }[];
  origins: SectorRiskPresenceOrigin[];
  riskOrder: { rows: string[]; columns: string[] };
  sectorOrder: string[];
};

export type BrowseSectorRiskPresenceParams = {
  companyId: string;
  workspaceId: string;
};
