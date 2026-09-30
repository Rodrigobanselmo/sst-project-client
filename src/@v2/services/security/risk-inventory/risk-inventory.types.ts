export type RiskInventoryUnitKind = 'REAL_GSE' | 'UNITARY_FALLBACK' | 'LEGACY_SLOT';

export type RiskInventoryRealAuthority =
  | 'QUANTITATIVE_LEVEL'
  | 'CUSTOM_SNAPSHOT'
  | 'SYSTEM_MATRIX';

export type RiskInventoryPresentation = {
  label: string;
  abbreviation: string | null;
  color: string | null;
  level: number | null;
  matrixSource: 'SYSTEM' | 'CUSTOM' | null;
  matrixVersionId: string | null;
};

export type RiskInventoryEpi = {
  ca: string;
  equipment: string;
};

export type RiskInventoryRow = {
  riskFactorId: string;
  riskFactorDataIds: string[];
  originHomogeneousGroupIds: string[];
  /** Resolved on the server for this row's homogeneous group. */
  originText: string;
  riskType: string;
  riskTypeLabel: string;
  hazardName: string;
  damage: string | null;
  generatingSources: string[];
  epis: RiskInventoryEpi[];
  engineeringMeasures: string[];
  administrativeMeasures: string[];
  severity: number | null;
  isQuantity: boolean;
  qualitativeProbability: number | null;
  persistedProbability: number | null;
  quantitativeLevel: number | null;
  realRisk: RiskInventoryPresentation & {
    authority: RiskInventoryRealAuthority;
  };
  recommendations: string[];
  residual: {
    source: 'SNAPSHOT' | null;
    probability: number | null;
    presentation: RiskInventoryPresentation | null;
  };
  quantity: {
    noise: boolean;
    heat: boolean;
    chemical: boolean;
    radiation: boolean;
    vibrationWholeBody: boolean;
    vibrationHandArm: boolean;
  } | null;
};

export type RiskInventoryUnit = {
  id: string;
  kind: RiskInventoryUnitKind;
  originType: string | null;
  name: string;
  description: string | null;
  exposedEmployeeCount: number;
  scope: string[];
  epis: RiskInventoryEpi[];
  homogeneousGroupIds: string[];
  sourceElementIds: string[];
  rows: RiskInventoryRow[];
};

export const RISK_INVENTORY_CONFIGURABLE_COLUMN_KEYS = [
  'TYPE',
  'HAZARD',
  'DAMAGE',
  'GENERATING_SOURCE',
  'EPI',
  'ENGINEERING',
  'ADMINISTRATIVE',
  'SEVERITY',
  'PROBABILITY',
  'REAL_RISK',
  'RECOMMENDATIONS',
  'PROBABILITY_RESIDUAL',
  'RESIDUAL_RISK',
] as const;

export type RiskInventoryConfigurableColumnKey = (typeof RISK_INVENTORY_CONFIGURABLE_COLUMN_KEYS)[number];
export type RiskInventoryColumnKey = RiskInventoryConfigurableColumnKey | 'ORIGIN';
export type RiskInventoryColumnOrientation = 'HORIZONTAL' | 'VERTICAL';

export type RiskInventoryColumnSetting = {
  key: RiskInventoryColumnKey;
  orientation: RiskInventoryColumnOrientation;
  headerOrientation?: RiskInventoryColumnOrientation;
  headerLabel?: string;
  widthWeight?: number;
  /** Stored only for ORIGIN. Absent or false hides that column. */
  visible?: boolean;
};

export type RiskInventoryColumnsPreference = {
  version: 1;
  columns: RiskInventoryColumnSetting[];
};

export type RiskInventoryColumnsSource = 'workspace' | 'global' | 'canonical';

export type RiskInventoryBrowseResult = {
  workspaceId: string;
  composition: 'APR_GROUP';
  hasRealGse: boolean;
  units: RiskInventoryUnit[];
  columnPreference: RiskInventoryColumnsPreference | null;
  columnPreferenceSource: RiskInventoryColumnsSource;
};

export type BrowseRiskInventoryParams = {
  companyId: string;
  workspaceId: string;
};
