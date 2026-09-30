export type SectorRiskPresenceRisk = {
  id: string;
  label: string;
  typeOrder: number;
};

export type SectorRiskPresenceSector = {
  id: string;
  name: string;
};

export type SectorRiskPresence = {
  risks: SectorRiskPresenceRisk[];
  sectors: SectorRiskPresenceSector[];
  presences: { riskId: string; sectorId: string }[];
  riskOrder: { rows: string[]; columns: string[] };
  sectorOrder: string[];
};

export type BrowseSectorRiskPresenceParams = {
  companyId: string;
  workspaceId: string;
};
