export type RiskPrioritizationUnitKind = 'REAL_GSE' | 'UNITARY_FALLBACK';

export type RiskPrioritizationOriginKind =
  | 'GSE'
  | 'CHARACTERIZATION'
  | 'HIERARCHY';

export type RiskPrioritizationOpenOrigin =
  | { kind: 'GSE'; id: string }
  | { kind: 'CHARACTERIZATION'; id: string; workspaceId: string };

export type RiskPrioritizationOrigin = {
  riskFactorDataId: string;
  riskFactorId: string;
  homogeneousGroupId: string;
  originKind: RiskPrioritizationOriginKind;
  originId: string;
  originName: string;
  originTypeLabel: string;
  resolutionSource: string;
  isDeterminant: boolean;
  openOrigin: RiskPrioritizationOpenOrigin | null;
};

export type RiskPrioritizationCell = {
  rowId: string;
  riskId: string;
  abbreviation: string;
  label: string;
  color: string | null;
  level: number;
  isQuantity: boolean;
  probability: number | null;
  severity: number | null;
  isPrioritized: boolean;
  matrixSource: 'SYSTEM' | 'CUSTOM' | null;
  matrixVersionId: string | null;
  origins: RiskPrioritizationOrigin[];
};

export type RiskPrioritizationLegendEntry = {
  abbreviation: string;
  label: string;
  color: string | null;
  matrixSource: 'SYSTEM' | 'CUSTOM';
};

export type RiskPrioritizationBrowseResult = {
  workspaceId: string;
  rows: Array<{
    id: string;
    label: string;
    kind: RiskPrioritizationUnitKind;
  }>;
  columns: Array<{ riskId: string; name: string; typeCode: string | null }>;
  cells: RiskPrioritizationCell[];
  legend: RiskPrioritizationLegendEntry[];
  meta: {
    unitCount: number;
    riskCount: number;
    cellCount: number;
    originCount: number;
  };
};

export type BrowseRiskPrioritizationParams = {
  companyId: string;
  workspaceId: string;
};
