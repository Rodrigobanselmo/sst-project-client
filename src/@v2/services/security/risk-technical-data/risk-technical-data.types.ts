export type RiskTechnicalDataType = 'FIS' | 'QUI' | 'BIO' | 'ERG' | 'ACI' | 'OUTROS';

export type RiskTechnicalDataGroup = 'PHYSICAL_CHEMICAL' | 'OTHER';

export type RiskTechnicalColumnOrientation = 'HORIZONTAL' | 'VERTICAL';

export type RiskTechnicalColumnsSource = 'workspace' | 'global' | 'canonical';

export type RiskTechnicalColumnKey =
  | 'type'
  | 'factor'
  | 'cas'
  | 'propagation'
  | 'unit'
  | 'nr15lt'
  | 'twa'
  | 'stel'
  | 'ipvs'
  | 'pv'
  | 'pe'
  | 'carnogenicityACGIH'
  | 'carnogenicityLinach'
  | 'exams'
  | 'severity'
  | 'symptoms'
  | 'effects';

export type RiskTechnicalColumnSetting = {
  key: RiskTechnicalColumnKey;
  orientation: RiskTechnicalColumnOrientation;
  headerOrientation?: RiskTechnicalColumnOrientation;
  widthWeight: number;
};

export type RiskTechnicalColumnsPreference = {
  version: 1;
  columns: RiskTechnicalColumnSetting[];
};

export type RiskTechnicalFamilyColumns = {
  preference: RiskTechnicalColumnsPreference | null;
  source: RiskTechnicalColumnsSource;
};

export type RiskTechnicalDataSubtype = {
  id: number;
  name: string;
};

export type RiskTechnicalDataRisk = {
  id: string;
  name: string;
  type: RiskTechnicalDataType;
  subTypes: RiskTechnicalDataSubtype[];
  cas: string | null;
  propagation: string[];
  unit: string | null;
  nr15lt: string | null;
  twa: string | null;
  stel: string | null;
  ipvs: string | null;
  pv: string | null;
  pe: string | null;
  carnogenicityACGIH: string | null;
  carnogenicityLinach: string | null;
  exams: string[];
  severity: number;
  symptoms: string | null;
  healthRisk: string | null;
};

export type RiskTechnicalData = {
  risks: RiskTechnicalDataRisk[];
  columns: {
    physicalChemical: RiskTechnicalFamilyColumns;
    other: RiskTechnicalFamilyColumns;
  };
};

export type BrowseRiskTechnicalDataParams = {
  companyId: string;
  workspaceId: string;
};
