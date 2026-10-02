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

export type RiskInventoryProbabilityCriteria = {
  employeeCountTotal: number | null;
  employeeCountGho: number | null;
  minDurationJT: number | null;
  minDurationEO: number | null;
  chancesOfHappening: number | null;
  frequency: number | null;
  history: number | null;
  medsImplemented: number | null;
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
  /**
   * Snapshot from the inherent RO winner. Null when quantitative or absent.
   */
  probabilityCriteria: RiskInventoryProbabilityCriteria | null;
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
   * Screen flag. ORIGIN is shown only when true. Other hideable columns are hidden only when false.
   * Structural columns ignore this flag on screen.
   * Independent from `includeInDocx`.
   */
  visible?: boolean;
  /**
   * Word/DOCX inclusion. Independent from `visible`.
   * Absent preserves the historical Word behavior for that column.
   */
  includeInDocx?: boolean;
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
  /** Absent means visible on screen. `false` hides only this extra column on screen. */
  visible?: boolean;
  /**
   * Word/DOCX inclusion. Independent from `visible`.
   * Absent preserves the historical Word behavior (same as screen visibility).
   */
  includeInDocx?: boolean;
};

export const RISK_INVENTORY_OPTIONAL_COLUMN_KEYS = [
  'employeeCountGho',
  'employeeCountTotal',
  'minDurationEO',
  'minDurationJT',
  'frequency',
  'chancesOfHappening',
  'history',
  'medsImplemented',
] as const;

export type RiskInventoryOptionalColumnKey = (typeof RISK_INVENTORY_OPTIONAL_COLUMN_KEYS)[number];

/** Optional DOCX cell renderers are available. */
export const RISK_INVENTORY_OPTIONAL_DOCX_RENDERERS_READY = true;

export type RiskInventoryOptionalColumnSetting = {
  key: RiskInventoryOptionalColumnKey;
  orientation: RiskInventoryColumnOrientation;
  headerOrientation?: RiskInventoryColumnOrientation;
  headerLabel?: string;
  widthWeight?: number;
  /** Absent means not shown on screen (opt-in). `true` shows; `false` hides. */
  visible?: boolean;
  /**
   * Word/DOCX inclusion. Independent from `visible`.
   * Absent means not included. Only `true` exports the optional to Word.
   */
  includeInDocx?: boolean;
};

export type RiskInventoryOrderKey =
  | RiskInventoryColumnKey
  | RiskInventoryExtraColumnKey
  | RiskInventoryOptionalColumnKey;

export type RiskInventoryColumnsPreference = {
  version: 1;
  columns: RiskInventoryColumnSetting[];
  extraColumns?: RiskInventoryExtraColumnSetting[];
  /** Absent or empty means no optional criteria columns (opt-in; none on screen/Word). */
  optionalColumns?: RiskInventoryOptionalColumnSetting[];
  /** Keys only. Absent means canonical natives, then optionals, then extras. */
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
