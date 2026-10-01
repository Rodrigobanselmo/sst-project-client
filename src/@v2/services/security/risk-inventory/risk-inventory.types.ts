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
  /** Display text resolved from the risk catalog. Missing text is shown as an em dash. */
  technicalValues?: Partial<Record<RiskInventoryExtraColumnKey, string>>;
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
  /**
   * ORIGIN is shown only when true. Other hideable columns are hidden only when false.
   * Structural columns ignore this flag.
   */
  visible?: boolean;
};

export const RISK_INVENTORY_EXTRA_COLUMN_KEYS = [
  'cas',
  'propagation',
  'unit',
  'nr15lt',
  'twa',
  'stel',
  'ipvs',
  'pv',
  'pe',
  'carnogenicityACGIH',
  'carnogenicityLinach',
  'symptoms',
] as const;

export type RiskInventoryExtraColumnKey = (typeof RISK_INVENTORY_EXTRA_COLUMN_KEYS)[number];

export type RiskInventoryExtraColumnSetting = {
  key: RiskInventoryExtraColumnKey;
  orientation: RiskInventoryColumnOrientation;
  headerOrientation?: RiskInventoryColumnOrientation;
  headerLabel?: string;
  widthWeight?: number;
  /** Absent means visible. `false` hides only this extra column. */
  visible?: boolean;
};

export type RiskInventoryOrderKey = RiskInventoryColumnKey | RiskInventoryExtraColumnKey;

export type RiskInventoryColumnsPreference = {
  version: 1;
  columns: RiskInventoryColumnSetting[];
  extraColumns?: RiskInventoryExtraColumnSetting[];
  /** Keys only. Absent means canonical natives, then extras. */
  columnOrder?: RiskInventoryOrderKey[];
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
