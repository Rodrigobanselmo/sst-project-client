import {
  RiskTechnicalColumnKey,
  RiskTechnicalColumnOrientation,
  RiskTechnicalColumnsPreference,
  RiskTechnicalDataRisk,
  RiskTechnicalDataType,
} from '@v2/services/security/risk-technical-data/risk-technical-data.types';

export const RISK_TECHNICAL_DATA_INK = '#1A202C';
export const RISK_TECHNICAL_DATA_GRID = '#E2E8F0';
export const RISK_TECHNICAL_DATA_SURFACE = '#FFFFFF';
export const RISK_TECHNICAL_DATA_BAND = '#F7F8FA';
export const RISK_TECHNICAL_WIDTH_WEIGHT_MIN = 1;
export const RISK_TECHNICAL_WIDTH_WEIGHT_MAX = 100;

export type RiskTechnicalDataGroup = 'PHYSICAL_CHEMICAL' | 'OTHER';

export type RiskTechnicalTitleChoice = 'SAME' | RiskTechnicalColumnOrientation;

export type RiskTechnicalColumnAlign = 'left' | 'center';

export type RiskTechnicalColumn = {
  key: RiskTechnicalColumnKey;
  headerLabel: string;
  widthWeight: number;
  orientation: RiskTechnicalColumnOrientation;
  headerOrientation?: RiskTechnicalColumnOrientation;
};

const PHYSICAL_CHEMICAL_TYPES: RiskTechnicalDataType[] = ['FIS', 'QUI'];
const OTHER_FACTOR_TYPES: RiskTechnicalDataType[] = ['BIO', 'ERG', 'ACI', 'OUTROS'];

const column = (
  key: RiskTechnicalColumnKey,
  headerLabel: string,
  widthWeight: number,
  orientation: RiskTechnicalColumnOrientation,
  headerOrientation?: RiskTechnicalColumnOrientation,
): RiskTechnicalColumn => ({
  key,
  headerLabel,
  widthWeight,
  orientation,
  ...(headerOrientation ? { headerOrientation } : {}),
});

export const RISK_TECHNICAL_PHYSICAL_COLUMNS: RiskTechnicalColumn[] = [
  column('type', 'Tipo', 1, 'VERTICAL'),
  column('factor', 'Fator de risco', 10, 'HORIZONTAL'),
  column('cas', 'N° CAS', 2, 'VERTICAL'),
  column('propagation', 'Propagação', 2, 'VERTICAL'),
  column('unit', 'Unidade', 3, 'HORIZONTAL', 'VERTICAL'),
  column('nr15lt', 'NR-15 LT', 3, 'HORIZONTAL', 'VERTICAL'),
  column('twa', 'ACGIH TWA', 3, 'HORIZONTAL', 'VERTICAL'),
  column('stel', 'ACGIH STEL', 3, 'HORIZONTAL', 'VERTICAL'),
  column('ipvs', 'IPVS/IDLH', 3, 'HORIZONTAL', 'VERTICAL'),
  column('pv', 'PV', 2, 'VERTICAL'),
  column('pe', 'PE', 2, 'HORIZONTAL'),
  column('carnogenicityACGIH', 'Carcinogenicidade ACGIH', 2, 'VERTICAL'),
  column('carnogenicityLinach', 'Carcinogenicidade LINACH', 2, 'VERTICAL'),
  column('exams', 'Exames', 10, 'HORIZONTAL'),
  column('severity', 'Severidade', 2, 'HORIZONTAL', 'VERTICAL'),
  column('symptoms', 'Riscos', 16, 'HORIZONTAL'),
  column('effects', 'Efeitos', 16, 'HORIZONTAL'),
];

export const RISK_TECHNICAL_OTHER_COLUMNS: RiskTechnicalColumn[] = [
  column('type', 'Tipo', 1, 'VERTICAL'),
  column('factor', 'Fator de risco', 14, 'HORIZONTAL'),
  column('propagation', 'Propagação', 2, 'HORIZONTAL', 'VERTICAL'),
  column('exams', 'Exames', 10, 'HORIZONTAL'),
  column('severity', 'Severidade', 2, 'HORIZONTAL', 'VERTICAL'),
  column('symptoms', 'Riscos', 21, 'HORIZONTAL'),
  column('effects', 'Efeitos', 21, 'HORIZONTAL'),
];

const RISK_TECHNICAL_CENTERED_COLUMNS = new Set<RiskTechnicalColumnKey>([
  'type',
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
  'severity',
]);

export function riskTechnicalColumns(group: RiskTechnicalDataGroup): RiskTechnicalColumn[] {
  return group === 'PHYSICAL_CHEMICAL'
    ? RISK_TECHNICAL_PHYSICAL_COLUMNS
    : RISK_TECHNICAL_OTHER_COLUMNS;
}

export function shouldLoadRiskTechnicalData(params: {
  queryEnabled: boolean;
  isAllEstablishments: boolean;
  workspaceId?: string;
}): boolean {
  return params.queryEnabled && !params.isAllEstablishments && Boolean(params.workspaceId);
}

export function riskTechnicalGroup(type: RiskTechnicalDataType): RiskTechnicalDataGroup | null {
  if (PHYSICAL_CHEMICAL_TYPES.includes(type)) return 'PHYSICAL_CHEMICAL';
  if (OTHER_FACTOR_TYPES.includes(type)) return 'OTHER';
  return null;
}

export function risksForTechnicalGroup(
  risks: RiskTechnicalDataRisk[],
  group: RiskTechnicalDataGroup,
): RiskTechnicalDataRisk[] {
  return risks.filter((risk) => riskTechnicalGroup(risk.type) === group);
}

const lines = (values: string[]): string => values.map((value) => value.trim()).filter(Boolean).join('\n');

const text = (value: string | null | undefined): string => value?.trim() || '';

export function riskTechnicalCellText(
  risk: RiskTechnicalDataRisk,
  key: RiskTechnicalColumnKey,
): string {
  switch (key) {
    case 'factor':
      return text(risk.name);
    case 'cas':
      return text(risk.cas);
    case 'propagation':
      return lines(risk.propagation);
    case 'unit':
      return text(risk.unit);
    case 'nr15lt':
      return text(risk.nr15lt);
    case 'twa':
      return text(risk.twa);
    case 'stel':
      return text(risk.stel);
    case 'ipvs':
      return text(risk.ipvs);
    case 'pv':
      return text(risk.pv);
    case 'pe':
      return text(risk.pe);
    case 'carnogenicityACGIH':
      return text(risk.carnogenicityACGIH);
    case 'carnogenicityLinach':
      return text(risk.carnogenicityLinach);
    case 'exams':
      return lines(risk.exams);
    case 'severity':
      return risk.severity > 0 ? String(risk.severity) : '';
    case 'symptoms':
      return text(risk.symptoms);
    case 'effects':
      return text(risk.healthRisk);
    default:
      return '';
  }
}

export type RiskTechnicalColumnLayout = {
  key: RiskTechnicalColumnKey;
  headerLabel: string;
  weight: number;
  percent: number;
  contentOrientation: RiskTechnicalColumnOrientation;
  headerOrientation: RiskTechnicalColumnOrientation;
  align: RiskTechnicalColumnAlign;
};

const savedColumn = (preference: RiskTechnicalColumnsPreference | null | undefined, key: RiskTechnicalColumnKey) =>
  preference?.columns.find((column) => column.key === key);

export function riskTechnicalColumnWeight(
  columns: RiskTechnicalColumn[],
  preference: RiskTechnicalColumnsPreference | null | undefined,
  key: RiskTechnicalColumnKey,
): number {
  return savedColumn(preference, key)?.widthWeight ?? columns.find((column) => column.key === key)?.widthWeight ?? 1;
}

export function riskTechnicalColumnContentOrientation(
  columns: RiskTechnicalColumn[],
  preference: RiskTechnicalColumnsPreference | null | undefined,
  key: RiskTechnicalColumnKey,
): RiskTechnicalColumnOrientation {
  return savedColumn(preference, key)?.orientation ?? columns.find((column) => column.key === key)?.orientation ?? 'HORIZONTAL';
}

export function riskTechnicalColumnHeaderOrientation(
  columns: RiskTechnicalColumn[],
  preference: RiskTechnicalColumnsPreference | null | undefined,
  key: RiskTechnicalColumnKey,
): RiskTechnicalColumnOrientation {
  const saved = savedColumn(preference, key);
  if (saved?.headerOrientation) return saved.headerOrientation;
  if (saved) return saved.orientation;
  const canonical = columns.find((column) => column.key === key);
  return canonical?.headerOrientation ?? canonical?.orientation ?? 'HORIZONTAL';
}

export function riskTechnicalTitleChoice(
  columns: RiskTechnicalColumn[],
  preference: RiskTechnicalColumnsPreference | null | undefined,
  key: RiskTechnicalColumnKey,
): RiskTechnicalTitleChoice {
  const saved = savedColumn(preference, key);
  if (saved) return saved.headerOrientation ?? 'SAME';
  const canonical = columns.find((column) => column.key === key);
  if (canonical?.headerOrientation && canonical.headerOrientation !== canonical.orientation) {
    return canonical.headerOrientation;
  }
  return 'SAME';
}

export function riskTechnicalColumnAlign(key: RiskTechnicalColumnKey): RiskTechnicalColumnAlign {
  return RISK_TECHNICAL_CENTERED_COLUMNS.has(key) ? 'center' : 'left';
}

export function riskTechnicalWidthPercent(weight: number, totalWeight: number): number {
  if (totalWeight <= 0) return 0;
  return (weight / totalWeight) * 100;
}

export function riskTechnicalLayouts(
  group: RiskTechnicalDataGroup,
  preference: RiskTechnicalColumnsPreference | null | undefined,
): RiskTechnicalColumnLayout[] {
  const columns = riskTechnicalColumns(group);
  const weights = columns.map((column) => riskTechnicalColumnWeight(columns, preference, column.key));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return columns.map((column, index) => ({
    key: column.key,
    headerLabel: column.headerLabel,
    weight: weights[index],
    percent: riskTechnicalWidthPercent(weights[index], total),
    contentOrientation: riskTechnicalColumnContentOrientation(columns, preference, column.key),
    headerOrientation: riskTechnicalColumnHeaderOrientation(columns, preference, column.key),
    align: riskTechnicalColumnAlign(column.key),
  }));
}
