import { RISK_TECHNICAL_PHYSICAL_COLUMNS } from '@v2/pages/companies/risk-technical-data/risk-technical-data.presentation';
import {
  RISK_INVENTORY_EXTRA_COLUMN_KEYS,
  RISK_INVENTORY_OPTIONAL_COLUMN_KEYS,
  RISK_INVENTORY_OPTIONAL_DOCX_RENDERERS_READY,
  RiskInventoryColumnKey,
  RiskInventoryColumnOrientation,
  RiskInventoryColumnsPreference,
  RiskInventoryConfigurableColumnKey,
  RiskInventoryColumnSetting,
  RiskInventoryEpi,
  RiskInventoryExtraColumnKey,
  RiskInventoryExtraColumnSetting,
  RiskInventoryOptionalColumnKey,
  RiskInventoryOptionalColumnSetting,
  RiskInventoryOrderKey,
  RiskInventoryPresentation,
  RiskInventoryProbabilityCriteria,
  RiskInventoryRow,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import { chanceOfContactMap } from 'core/constants/maps/probability/chance-of-contact.map';
import { frequencyMap } from 'core/constants/maps/probability/frequency.map';
import { historyOccurrencesMap } from 'core/constants/maps/probability/history-occurrences.map';
import { measuresMap } from 'core/constants/maps/probability/measures.map';
import { SeverityEnum } from 'project/enum/severity.enums';

export const INVENTORY_EMPTY = '—';

export function formatInventoryLines(values: string[] | null | undefined): string {
  const lines = (values || []).map((value) => value.trim()).filter(Boolean);
  return lines.length ? lines.join('\n') : INVENTORY_EMPTY;
}

export function formatInventoryEpis(epis: RiskInventoryEpi[] | null | undefined): string {
  const lines = (epis || [])
    .map((epi) => {
      const equipment = epi.equipment?.trim();
      const ca = epi.ca?.trim();
      if (equipment && ca) return `${equipment} (CA ${ca})`;
      return equipment || (ca ? `CA ${ca}` : '');
    })
    .filter(Boolean);
  return lines.length ? lines.join('\n') : INVENTORY_EMPTY;
}

/**
 * Qualitative P only. A quantitative evaluation must not show the RFD
 * probability integer as if it were the matrix axis.
 */
export function inventoryProbabilityText(row: Pick<
  RiskInventoryRow,
  'isQuantity' | 'qualitativeProbability' | 'persistedProbability'
>): string {
  if (row.isQuantity) return INVENTORY_EMPTY;
  if (row.qualitativeProbability == null) return INVENTORY_EMPTY;
  return String(row.qualitativeProbability);
}

export function inventoryProbabilityHint(row: Pick<RiskInventoryRow, 'isQuantity'>): string | null {
  if (!row.isQuantity) return null;
  return 'Avaliação quantitativa. A probabilidade da matriz não se aplica; o nível da medição está no Risco Real.';
}

export function inventoryResidualProbabilityText(
  row: Pick<RiskInventoryRow, 'residual'>,
): string {
  if (row.residual.probability == null) return INVENTORY_EMPTY;
  return String(row.residual.probability);
}

export function inventoryPresentationText(
  presentation: RiskInventoryPresentation | null | undefined,
): string {
  const label = presentation?.label?.trim();
  const abbreviation = presentation?.abbreviation?.trim();
  if (label && abbreviation && abbreviation !== label) return `${abbreviation} · ${label}`;
  return label || abbreviation || INVENTORY_EMPTY;
}

/** One default title per column, shared by the screen and APR_GROUP v2. */
export const INVENTORY_CONFIGURABLE_COLUMNS: Array<{
  key: RiskInventoryConfigurableColumnKey;
  label: string;
}> = [
  { key: 'TYPE', label: 'Tipo' },
  { key: 'HAZARD', label: 'Perigo ou Fator de Risco Ocupacional (P/FRO)' },
  { key: 'DAMAGE', label: 'Risco' },
  { key: 'GENERATING_SOURCE', label: 'Fonte Geradora ou Circunstância de Risco' },
  { key: 'EPI', label: 'EPI' },
  { key: 'ENGINEERING', label: 'EPC/ENG.' },
  { key: 'ADMINISTRATIVE', label: 'ADM' },
  { key: 'SEVERITY', label: 'S' },
  { key: 'PROBABILITY', label: 'P' },
  { key: 'REAL_RISK', label: 'RO' },
  { key: 'RECOMMENDATIONS', label: 'Recomendações' },
  { key: 'PROBABILITY_RESIDUAL', label: 'P' },
  { key: 'RESIDUAL_RISK', label: 'RO' },
];

export const INVENTORY_ORIGIN_COLUMN = { key: 'ORIGIN' as const, label: 'Origem' };

/** Columns the dialog may hide. Structural columns stay visible. */
export const INVENTORY_HIDEABLE_COLUMN_KEYS = [
  'ORIGIN',
  'GENERATING_SOURCE',
  'EPI',
  'ENGINEERING',
  'ADMINISTRATIVE',
  'RECOMMENDATIONS',
  'PROBABILITY_RESIDUAL',
] as const;

const INVENTORY_HIDEABLE_KEYS = new Set<string>(INVENTORY_HIDEABLE_COLUMN_KEYS);

export function inventoryColumnCanHide(
  key: RiskInventoryColumnKey,
): key is (typeof INVENTORY_HIDEABLE_COLUMN_KEYS)[number] {
  return INVENTORY_HIDEABLE_KEYS.has(key);
}

/** Dialog order. ORIGIN sits after Tipo and is not one of the 13 required keys. */
export const INVENTORY_DIALOG_COLUMNS: Array<{ key: RiskInventoryColumnKey; label: string }> = [
  INVENTORY_CONFIGURABLE_COLUMNS[0],
  INVENTORY_ORIGIN_COLUMN,
  ...INVENTORY_CONFIGURABLE_COLUMNS.slice(1),
];

export function inventoryDefaultColumnLabel(key: RiskInventoryColumnKey): string {
  if (key === 'ORIGIN') return INVENTORY_ORIGIN_COLUMN.label;
  return INVENTORY_CONFIGURABLE_COLUMNS.find((column) => column.key === key)!.label;
}

/**
 * ORIGIN is shown only when `visible` is true.
 * Other hideable columns are hidden only when `visible` is false.
 * Structural columns stay visible even if a stored flag says otherwise.
 */
export function inventoryColumnVisible(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryColumnKey,
): boolean {
  if (!inventoryColumnCanHide(key)) return true;
  const visible = preference?.columns.find((column) => column.key === key)?.visible;
  if (key === 'ORIGIN') return visible === true;
  return visible !== false;
}

/** ORIGIN is shown only when the effective preference marks it visible. */
export function inventoryOriginVisible(
  preference: RiskInventoryColumnsPreference | null | undefined,
): boolean {
  return inventoryColumnVisible(preference, 'ORIGIN');
}

export function inventoryOriginText(unit: { name: string; originType: string | null }): string {
  const name = unit.name.trim();
  const typeLabel = unit.originType?.trim() || 'GSE';
  return name ? `${name}\n(${typeLabel})` : typeLabel;
}

/** Width role controls alignment and the vertical stack. The column share comes from its weight. */
export type InventoryColumnWidthRole = 'mark' | 'token' | 'text';

const INVENTORY_COLUMN_WIDTH_ROLE: Record<RiskInventoryColumnKey, InventoryColumnWidthRole> = {
  ORIGIN: 'text',
  TYPE: 'token',
  HAZARD: 'text',
  DAMAGE: 'text',
  GENERATING_SOURCE: 'text',
  EPI: 'text',
  ENGINEERING: 'text',
  ADMINISTRATIVE: 'text',
  SEVERITY: 'mark',
  PROBABILITY: 'mark',
  REAL_RISK: 'token',
  RECOMMENDATIONS: 'text',
  PROBABILITY_RESIDUAL: 'mark',
  RESIDUAL_RISK: 'token',
};

/** Canonical relative weights. The same integers used by the APR_GROUP inventory grid. */
export const INVENTORY_CANONICAL_WIDTH_WEIGHT: Record<RiskInventoryConfigurableColumnKey, number> = {
  TYPE: 2,
  HAZARD: 7,
  DAMAGE: 14,
  GENERATING_SOURCE: 7,
  EPI: 5,
  ENGINEERING: 7,
  ADMINISTRATIVE: 7,
  SEVERITY: 1,
  PROBABILITY: 1,
  REAL_RISK: 2,
  RECOMMENDATIONS: 8,
  PROBABILITY_RESIDUAL: 1,
  RESIDUAL_RISK: 2,
};

export const INVENTORY_WIDTH_WEIGHT_MIN = 1;
export const INVENTORY_WIDTH_WEIGHT_MAX = 100;
/**
 * Pixel size of one canonical weight point. Used only to size the fixed table
 * floor below. It is not multiplied by the user's absolute weight sum.
 */
export const INVENTORY_WIDTH_FLOOR_PX = 20;

const INVENTORY_STACK_VERTICAL_PX = {
  mark: 32,
  token: 44,
} as const;

/**
 * Structural screen header only. These bands are not column preferences.
 * Canonical spans follow the 13 screen columns: no Origem, and no second S.
 */
export const INVENTORY_HEADER_GROUPS = [
  {
    id: 'occupation',
    label: 'Severidade (S) × Probabilidade (P) = RISCO OCUPACIONAL (RO):',
    colSpan: 4,
  },
  {
    id: 'real',
    label: 'RISCO REAL (Puro/Inerente)',
    colSpan: 6,
  },
  {
    id: 'residual',
    label: 'RISCO RESIDUAL',
    colSpan: 3,
  },
] as const;

const INVENTORY_SCREEN_GROUP_COLUMNS = [
  {
    id: 'occupation' as const,
    label: INVENTORY_HEADER_GROUPS[0].label,
    columns: ['type', 'origin', 'hazard', 'damage', 'source'],
  },
  {
    id: 'real' as const,
    label: INVENTORY_HEADER_GROUPS[1].label,
    columns: ['epi', 'epc', 'adm', 'severity', 'probability', 'real'],
  },
  {
    id: 'residual' as const,
    label: INVENTORY_HEADER_GROUPS[2].label,
    columns: ['recs', 'pAfter', 'residual'],
  },
];

/** Band spans follow the columns actually drawn. An empty band is omitted. */
export function inventoryHeaderGroups(visibleColumnIds: readonly string[]) {
  const visible = new Set(visibleColumnIds);
  return INVENTORY_SCREEN_GROUP_COLUMNS.map((group) => ({
    id: group.id,
    label: group.label,
    colSpan: group.columns.filter((column) => visible.has(column)).length,
  })).filter((group) => group.colSpan > 0);
}

/** Physical/chemical Dados Técnicos defaults for the 12 inventory extras. exams is excluded. */
export const INVENTORY_EXTRA_COLUMNS: Array<
  Omit<(typeof RISK_TECHNICAL_PHYSICAL_COLUMNS)[number], 'key'> & { key: RiskInventoryExtraColumnKey }
> = RISK_INVENTORY_EXTRA_COLUMN_KEYS.map((key) => {
  const column = RISK_TECHNICAL_PHYSICAL_COLUMNS.find((item) => item.key === key);
  if (!column) throw new Error(`Coluna extra sem catálogo: ${key}`);
  if (key === 'symptoms') return { ...column, key, headerLabel: 'Efeitos e Sintomas' };
  return { ...column, key };
});

const INVENTORY_EXTRA_COLUMN_BY_KEY = Object.fromEntries(
  INVENTORY_EXTRA_COLUMNS.map((column) => [column.key, column]),
) as Record<RiskInventoryExtraColumnKey, (typeof INVENTORY_EXTRA_COLUMNS)[number]>;

export function inventoryExtraColumns(
  preference: RiskInventoryColumnsPreference | null | undefined,
): RiskInventoryExtraColumnSetting[] {
  return preference?.extraColumns ?? [];
}

export function inventoryVisibleExtraColumns(
  preference: RiskInventoryColumnsPreference | null | undefined,
): RiskInventoryExtraColumnSetting[] {
  return inventoryExtraColumns(preference).filter((column) => column.visible !== false);
}

export function inventoryExtraColumnLabel(column: RiskInventoryExtraColumnSetting): string {
  return column.headerLabel || INVENTORY_EXTRA_COLUMN_BY_KEY[column.key].headerLabel;
}

export function inventoryExtraColumnWidthWeight(column: RiskInventoryExtraColumnSetting): number {
  return column.widthWeight ?? INVENTORY_EXTRA_COLUMN_BY_KEY[column.key].widthWeight;
}

export function inventoryExtraColumnOrientation(
  column: RiskInventoryExtraColumnSetting,
): RiskInventoryColumnOrientation {
  return column.orientation;
}

export function inventoryExtraColumnHeaderOrientation(
  column: RiskInventoryExtraColumnSetting,
): RiskInventoryColumnOrientation {
  return column.headerOrientation ?? column.orientation;
}

export function inventoryExtraDefaultSetting(key: RiskInventoryExtraColumnKey): RiskInventoryExtraColumnSetting {
  const column = INVENTORY_EXTRA_COLUMN_BY_KEY[key];
  return {
    key,
    orientation: column.orientation,
    ...(column.headerOrientation ? { headerOrientation: column.headerOrientation } : {}),
    widthWeight: column.widthWeight,
    visible: true,
    includeInDocx: true,
  };
}

export const INVENTORY_OPTIONAL_COLUMNS: Array<{
  key: RiskInventoryOptionalColumnKey;
  headerLabel: string;
  widthWeight: number;
  orientation: RiskInventoryColumnOrientation;
  headerOrientation?: RiskInventoryColumnOrientation;
}> = [
  {
    key: 'employeeCountGho',
    headerLabel: 'Trabalhadores abrangidos',
    widthWeight: 2,
    orientation: 'HORIZONTAL',
    headerOrientation: 'VERTICAL',
  },
  {
    key: 'employeeCountTotal',
    headerLabel: 'Trabalhadores no estabelecimento',
    widthWeight: 2,
    orientation: 'HORIZONTAL',
    headerOrientation: 'VERTICAL',
  },
  {
    key: 'minDurationEO',
    headerLabel: 'Duração da exposição',
    widthWeight: 3,
    orientation: 'HORIZONTAL',
    headerOrientation: 'VERTICAL',
  },
  {
    key: 'minDurationJT',
    headerLabel: 'Duração da jornada',
    widthWeight: 3,
    orientation: 'HORIZONTAL',
    headerOrientation: 'VERTICAL',
  },
  { key: 'frequency', headerLabel: 'Frequência da exposição', widthWeight: 8, orientation: 'HORIZONTAL' },
  { key: 'chancesOfHappening', headerLabel: 'Possibilidade de ocorrência', widthWeight: 5, orientation: 'HORIZONTAL' },
  { key: 'history', headerLabel: 'Histórico de ocorrências', widthWeight: 7, orientation: 'HORIZONTAL' },
  {
    key: 'medsImplemented',
    headerLabel: 'Medidas de prevenção implementadas',
    widthWeight: 10,
    orientation: 'HORIZONTAL',
  },
];

const INVENTORY_OPTIONAL_COLUMN_BY_KEY = Object.fromEntries(
  INVENTORY_OPTIONAL_COLUMNS.map((column) => [column.key, column]),
) as Record<RiskInventoryOptionalColumnKey, (typeof INVENTORY_OPTIONAL_COLUMNS)[number]>;

export function inventoryOptionalColumns(
  preference: RiskInventoryColumnsPreference | null | undefined,
): RiskInventoryOptionalColumnSetting[] {
  return preference?.optionalColumns ?? [];
}

export function inventoryVisibleOptionalColumns(
  preference: RiskInventoryColumnsPreference | null | undefined,
): RiskInventoryOptionalColumnSetting[] {
  return inventoryOptionalColumns(preference).filter((column) => column.visible === true);
}

export function inventoryOptionalColumnLabel(column: RiskInventoryOptionalColumnSetting): string {
  return column.headerLabel || INVENTORY_OPTIONAL_COLUMN_BY_KEY[column.key].headerLabel;
}

export function inventoryOptionalColumnWidthWeight(column: RiskInventoryOptionalColumnSetting): number {
  return column.widthWeight ?? INVENTORY_OPTIONAL_COLUMN_BY_KEY[column.key].widthWeight;
}

export function inventoryOptionalColumnOrientation(
  column: RiskInventoryOptionalColumnSetting,
): RiskInventoryColumnOrientation {
  return column.orientation;
}

export function inventoryOptionalColumnHeaderOrientation(
  column: RiskInventoryOptionalColumnSetting,
): RiskInventoryColumnOrientation {
  return column.headerOrientation ?? column.orientation;
}

export function inventoryOptionalDefaultSetting(
  key: RiskInventoryOptionalColumnKey,
): RiskInventoryOptionalColumnSetting {
  const column = INVENTORY_OPTIONAL_COLUMN_BY_KEY[key];
  return {
    key,
    orientation: column.orientation,
    ...(column.headerOrientation ? { headerOrientation: column.headerOrientation } : {}),
    widthWeight: column.widthWeight,
    visible: true,
    includeInDocx: false,
  };
}

const SEVERITY_LABEL_MAPS: Record<
  'frequency' | 'chancesOfHappening' | 'history' | 'medsImplemented',
  Record<SeverityEnum, { value: SeverityEnum; name: string }>
> = {
  frequency: frequencyMap,
  chancesOfHappening: chanceOfContactMap,
  history: historyOccurrencesMap,
  medsImplemented: measuresMap,
};

function severityLabel(
  map: Record<SeverityEnum, { value: SeverityEnum; name: string }>,
  value: number | null | undefined,
): string {
  if (value == null) return INVENTORY_EMPTY;
  const option = map[value as SeverityEnum];
  if (!option) return INVENTORY_EMPTY;
  return option.name.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

export function inventoryOptionalCriteriaText(
  row: Pick<RiskInventoryRow, 'isQuantity' | 'probabilityCriteria'>,
  key: RiskInventoryOptionalColumnKey,
): string {
  if (row.isQuantity) return INVENTORY_EMPTY;
  const criteria = row.probabilityCriteria;
  if (!criteria) return INVENTORY_EMPTY;

  if (key === 'employeeCountGho' || key === 'employeeCountTotal') {
    const value = criteria[key];
    if (value == null) return INVENTORY_EMPTY;
    return String(value);
  }
  if (key === 'minDurationEO' || key === 'minDurationJT') {
    const value = criteria[key];
    if (value == null) return INVENTORY_EMPTY;
    return `${value} min`;
  }
  return severityLabel(SEVERITY_LABEL_MAPS[key], criteria[key]);
}

/**
 * Native bands stay as they are. DADOS TÉCNICOS is appended only when at least
 * one extra column is visible, and it spans only those columns.
 */
export function inventoryTableHeaderGroups(
  visibleColumnIds: readonly string[],
  extraCount: number,
) {
  const groups: Array<{ id: string; label: string; colSpan: number }> = inventoryHeaderGroups(visibleColumnIds);
  if (extraCount > 0) {
    groups.push({ id: 'technical', label: 'DADOS TÉCNICOS', colSpan: extraCount });
  }
  return groups;
}

/** Organizable natives in the historical table order. The second residual S is not here. */
export const INVENTORY_CANONICAL_COLUMN_ORDER = [
  'TYPE',
  'ORIGIN',
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
] as const satisfies readonly RiskInventoryOrderKey[];

const INVENTORY_NATIVE_ORDER_INDEX = new Map<string, number>(
  INVENTORY_CANONICAL_COLUMN_ORDER.map((key, index) => [key, index]),
);
const INVENTORY_EXTRA_ORDER_KEYS = new Set<string>(RISK_INVENTORY_EXTRA_COLUMN_KEYS);

export type InventoryColumnFamily = 'occupation' | 'real' | 'residual' | 'criteria' | 'technical';

const INVENTORY_OCCUPATION_KEYS = new Set<string>(['TYPE', 'ORIGIN', 'HAZARD', 'DAMAGE', 'GENERATING_SOURCE']);
const INVENTORY_REAL_KEYS = new Set<string>([
  'EPI',
  'ENGINEERING',
  'ADMINISTRATIVE',
  'SEVERITY',
  'PROBABILITY',
  'REAL_RISK',
]);
const INVENTORY_RESIDUAL_KEYS = new Set<string>(['RECOMMENDATIONS', 'PROBABILITY_RESIDUAL', 'RESIDUAL_RISK']);
const INVENTORY_OPTIONAL_ORDER_KEYS = new Set<string>(RISK_INVENTORY_OPTIONAL_COLUMN_KEYS);

const INVENTORY_FAMILY_LABEL: Record<InventoryColumnFamily, string> = {
  occupation: INVENTORY_HEADER_GROUPS[0].label,
  real: INVENTORY_HEADER_GROUPS[1].label,
  residual: INVENTORY_HEADER_GROUPS[2].label,
  criteria: 'CRITÉRIOS DE PROBABILIDADE',
  technical: 'DADOS TÉCNICOS',
};

export function inventoryColumnFamily(key: string): InventoryColumnFamily {
  if (INVENTORY_OCCUPATION_KEYS.has(key)) return 'occupation';
  if (INVENTORY_REAL_KEYS.has(key)) return 'real';
  if (INVENTORY_RESIDUAL_KEYS.has(key)) return 'residual';
  if (INVENTORY_OPTIONAL_ORDER_KEYS.has(key)) return 'criteria';
  return 'technical';
}

/**
 * Logical order, including hidden columns. Without columnOrder the natives stay
 * canonical, then optionals, then extras. A missing native is inserted after the
 * last placed native that canonically precedes it.
 */
export function resolveInventoryColumnOrder(
  preference: RiskInventoryColumnsPreference | null | undefined,
): RiskInventoryOrderKey[] {
  const extras = preference?.extraColumns ?? [];
  const optionals = preference?.optionalColumns ?? [];
  const extraKeys = new Set(extras.map((column) => column.key));
  const optionalKeys = new Set(optionals.map((column) => column.key));
  const stored = preference?.columnOrder ?? [];
  if (!stored.length) {
    return [
      ...INVENTORY_CANONICAL_COLUMN_ORDER,
      ...optionals.map((column) => column.key),
      ...extras.map((column) => column.key),
    ];
  }

  const seen = new Set<string>();
  const ordered: RiskInventoryOrderKey[] = [];
  stored.forEach((key) => {
    if (typeof key !== 'string' || seen.has(key)) return;
    const native = INVENTORY_NATIVE_ORDER_INDEX.has(key);
    const optional = optionalKeys.has(key as RiskInventoryOptionalColumnKey);
    const extra = extraKeys.has(key as RiskInventoryExtraColumnKey);
    if (!native && !optional && !extra) return;
    seen.add(key);
    ordered.push(key);
  });

  INVENTORY_CANONICAL_COLUMN_ORDER.forEach((native) => {
    if (seen.has(native)) return;
    const canonIndex = INVENTORY_NATIVE_ORDER_INDEX.get(native) ?? 0;
    let insertAt = 0;
    for (let index = 0; index < ordered.length; index += 1) {
      const currentCanon = INVENTORY_NATIVE_ORDER_INDEX.get(ordered[index]);
      if (currentCanon !== undefined && currentCanon < canonIndex) insertAt = index + 1;
    }
    ordered.splice(insertAt, 0, native);
    seen.add(native);
  });

  optionals.forEach((column) => {
    if (seen.has(column.key)) return;
    ordered.push(column.key);
    seen.add(column.key);
  });

  extras.forEach((column) => {
    if (seen.has(column.key)) return;
    ordered.push(column.key);
    seen.add(column.key);
  });

  return ordered;
}

export function inventoryOrderColumnVisible(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: string,
): boolean {
  if (INVENTORY_OPTIONAL_ORDER_KEYS.has(key)) {
    const optional = preference?.optionalColumns?.find((column) => column.key === key);
    return Boolean(optional) && optional?.visible === true;
  }
  if (INVENTORY_EXTRA_ORDER_KEYS.has(key)) {
    const extra = preference?.extraColumns?.find((column) => column.key === key);
    return Boolean(extra) && extra?.visible !== false;
  }
  if (!INVENTORY_NATIVE_ORDER_INDEX.has(key)) return false;
  return inventoryColumnVisible(preference, key as RiskInventoryColumnKey);
}

/**
 * Effective Word inclusion for UI/tooltips. Mirrors API legacy fallback.
 * Optional DOCX capacity stays false while renderers are not ready.
 */
export function inventoryOrderColumnIncludedInDocx(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: string,
): boolean {
  if (INVENTORY_OPTIONAL_ORDER_KEYS.has(key)) {
    if (!RISK_INVENTORY_OPTIONAL_DOCX_RENDERERS_READY) return false;
    const optional = preference?.optionalColumns?.find((column) => column.key === key);
    if (!optional) return false;
    return optional.includeInDocx === true;
  }
  if (INVENTORY_EXTRA_ORDER_KEYS.has(key)) {
    const extra = preference?.extraColumns?.find((column) => column.key === key);
    if (!extra) return false;
    if (typeof extra.includeInDocx === 'boolean') return extra.includeInDocx;
    return extra.visible !== false;
  }
  if (!INVENTORY_NATIVE_ORDER_INDEX.has(key)) return false;
  const native = preference?.columns.find((column) => column.key === key);
  if (typeof native?.includeInDocx === 'boolean') return native.includeInDocx;
  return inventoryColumnVisible(preference, key as RiskInventoryColumnKey);
}

/** Screen-visible column that is excluded from Word. */
export function inventoryOrderColumnScreenOnly(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: string,
): boolean {
  return inventoryOrderColumnVisible(preference, key) && !inventoryOrderColumnIncludedInDocx(preference, key);
}

export const INVENTORY_SCREEN_ONLY_HINT = 'Visível na tela · Não incluída no Word';

export type InventoryHeaderRun = {
  id: InventoryColumnFamily;
  family: InventoryColumnFamily;
  label: string;
  colSpan: number;
};

/** Bands follow the visible sequence. The same family reopens after an interruption. */
export function inventoryHeaderRuns(keys: readonly string[]): InventoryHeaderRun[] {
  const runs: InventoryHeaderRun[] = [];
  keys.forEach((key) => {
    const family = inventoryColumnFamily(key);
    const last = runs[runs.length - 1];
    if (last && last.family === family) last.colSpan += 1;
    else runs.push({ id: family, family, label: INVENTORY_FAMILY_LABEL[family], colSpan: 1 });
  });
  return runs;
}

/**
 * Include/remove only. A missing order stays missing. A saved order drops removed
 * extras/optionals and appends newly included ones. It does not follow list order.
 */
export function reconcileInventoryColumnOrder(
  columnOrder: readonly string[] | undefined,
  extraKeys: readonly string[],
  optionalKeys: readonly string[] = [],
): string[] | undefined {
  if (!columnOrder?.length) return undefined;
  const includedExtras = new Set(extraKeys);
  const includedOptionals = new Set(optionalKeys);
  const seen = new Set<string>();
  const next: string[] = [];
  columnOrder.forEach((key) => {
    if (seen.has(key)) return;
    const keepNative = INVENTORY_NATIVE_ORDER_INDEX.has(key);
    const keepOptional = INVENTORY_OPTIONAL_ORDER_KEYS.has(key) && includedOptionals.has(key);
    const keepExtra = INVENTORY_EXTRA_ORDER_KEYS.has(key) && includedExtras.has(key);
    if (!keepNative && !keepOptional && !keepExtra) return;
    seen.add(key);
    next.push(key);
  });
  optionalKeys.forEach((key) => {
    if (seen.has(key) || !INVENTORY_OPTIONAL_ORDER_KEYS.has(key)) return;
    seen.add(key);
    next.push(key);
  });
  extraKeys.forEach((key) => {
    if (seen.has(key) || !INVENTORY_EXTRA_ORDER_KEYS.has(key)) return;
    seen.add(key);
    next.push(key);
  });
  return next;
}

/** The 13 native columns plus Origem, in the shape the system snapshot requires. */
export function inventoryNativeColumnSettings(
  preference: RiskInventoryColumnsPreference | null | undefined,
): RiskInventoryColumnSetting[] {
  return INVENTORY_DIALOG_COLUMNS.map((column) => {
    const orientation = inventoryColumnDraftOrientation(preference, column.key);
    const title = inventoryColumnDraftHeaderChoice(preference, column.key);
    const headerLabel = inventoryColumnDraftHeaderLabel(preference, column.key).trim();
    const widthWeight = inventoryColumnWidthWeight(preference, column.key);
    const setting = {
      key: column.key,
      orientation,
      widthWeight,
      ...(title === 'SAME' ? {} : { headerOrientation: title }),
      ...(headerLabel ? { headerLabel } : {}),
    };
    if (!inventoryColumnCanHide(column.key)) return setting;
    return { ...setting, visible: inventoryColumnVisible(preference, column.key) };
  });
}

const SCREEN_COLUMN_KEY = {
  origin: 'ORIGIN',
  type: 'TYPE',
  hazard: 'HAZARD',
  damage: 'DAMAGE',
  source: 'GENERATING_SOURCE',
  epi: 'EPI',
  epc: 'ENGINEERING',
  adm: 'ADMINISTRATIVE',
  severity: 'SEVERITY',
  probability: 'PROBABILITY',
  real: 'REAL_RISK',
  recs: 'RECOMMENDATIONS',
  pAfter: 'PROBABILITY_RESIDUAL',
  residual: 'RESIDUAL_RISK',
} as const;

/** Canonical inventory layout used when the workspace has no saved column. */
const INVENTORY_CANONICAL_CONTENT_VERTICAL = new Set<RiskInventoryConfigurableColumnKey>([
  'TYPE',
  'EPI',
  'REAL_RISK',
  'RESIDUAL_RISK',
]);

const INVENTORY_CANONICAL_HEADER_VERTICAL = new Set<RiskInventoryConfigurableColumnKey>(['TYPE']);

function inventoryCanonicalContentOrientation(key: RiskInventoryColumnKey): RiskInventoryColumnOrientation {
  if (key === 'ORIGIN') return 'HORIZONTAL';
  return INVENTORY_CANONICAL_CONTENT_VERTICAL.has(key) ? 'VERTICAL' : 'HORIZONTAL';
}

function inventoryCanonicalHeaderOrientation(key: RiskInventoryColumnKey): RiskInventoryColumnOrientation {
  if (key === 'ORIGIN') return 'HORIZONTAL';
  return INVENTORY_CANONICAL_HEADER_VERTICAL.has(key) ? 'VERTICAL' : 'HORIZONTAL';
}

/** Content orientation. A missing preference or a missing key uses the canonical layout. */
export function inventoryColumnOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryColumnKey,
): RiskInventoryColumnOrientation {
  if (preference == null) return inventoryCanonicalContentOrientation(key);
  return preference.columns.find((column) => column.key === key)?.orientation ?? inventoryCanonicalContentOrientation(key);
}

export function inventoryScreenColumnOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  columnId: keyof typeof SCREEN_COLUMN_KEY,
): RiskInventoryColumnOrientation {
  return inventoryColumnOrientation(preference, SCREEN_COLUMN_KEY[columnId]);
}

/**
 * Title orientation. A saved column without headerOrientation follows its content.
 * A missing preference or a missing key uses the canonical title, which can differ from the content.
 */
export function inventoryColumnHeaderOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryColumnKey,
): RiskInventoryColumnOrientation {
  if (preference == null) return inventoryCanonicalHeaderOrientation(key);
  const saved = preference.columns.find((column) => column.key === key);
  if (!saved) return inventoryCanonicalHeaderOrientation(key);
  return saved.headerOrientation ?? saved.orientation;
}

/** Screen title text. A missing headerLabel keeps the screen's own default. */
export function inventoryScreenColumnHeaderLabel(
  preference: RiskInventoryColumnsPreference | null | undefined,
  columnId: keyof typeof SCREEN_COLUMN_KEY,
  fallback: string,
): string {
  if (preference == null) return fallback;
  return preference.columns.find((column) => column.key === SCREEN_COLUMN_KEY[columnId])?.headerLabel || fallback;
}

export function inventoryColumnDraftHeaderLabel(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryColumnKey,
): string {
  return preference?.columns.find((column) => column.key === key)?.headerLabel ?? '';
}

export function inventoryScreenColumnHeaderOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  columnId: keyof typeof SCREEN_COLUMN_KEY,
): RiskInventoryColumnOrientation {
  return inventoryColumnHeaderOrientation(preference, SCREEN_COLUMN_KEY[columnId]);
}

export const INVENTORY_ORIGIN_WIDTH_WEIGHT = 6;

export function inventoryColumnWidthWeight(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryColumnKey,
): number {
  const saved = preference?.columns.find((column) => column.key === key)?.widthWeight;
  if (key === 'ORIGIN') return saved ?? INVENTORY_ORIGIN_WIDTH_WEIGHT;
  return saved ?? INVENTORY_CANONICAL_WIDTH_WEIGHT[key];
}

export function inventoryWidthPercent(weight: number, totalWeight: number): number {
  if (totalWeight <= 0) return 0;
  return (weight / totalWeight) * 100;
}

const INVENTORY_CANONICAL_WEIGHT_TOTAL = Object.values(INVENTORY_CANONICAL_WIDTH_WEIGHT).reduce(
  (sum, weight) => sum + weight,
  0,
);

/**
 * Fixed readability floor for the 13-column table. Proportional weight sets
 * share it: scaling every weight leaves this width unchanged.
 */
export function inventoryTableMinWidth(weights: number[]): number {
  if (weights.length === 0 || weights.some((weight) => weight <= 0)) return 0;
  return INVENTORY_CANONICAL_WEIGHT_TOTAL * INVENTORY_WIDTH_FLOOR_PX;
}

export function inventoryScreenColumnLayout(
  preference: RiskInventoryColumnsPreference | null | undefined,
  columnId: keyof typeof SCREEN_COLUMN_KEY,
): {
  role: InventoryColumnWidthRole;
  weight: number;
  stackPx: number;
  align: 'left' | 'center';
} {
  const role = INVENTORY_COLUMN_WIDTH_ROLE[SCREEN_COLUMN_KEY[columnId]];
  return {
    role,
    weight: inventoryColumnWidthWeight(preference, SCREEN_COLUMN_KEY[columnId]),
    stackPx: role === 'text' ? INVENTORY_VERTICAL_STACK_PX : INVENTORY_STACK_VERTICAL_PX[role],
    align: role === 'text' ? 'left' : 'center',
  };
}

/** Header box only. Short titles stay short so the cell can center them. Capped at the header limit. */
export function inventoryVerticalHeaderBoxPx(text: string): number {
  const estimated = Math.ceil(text.trim().length * 7.5 + 8);
  return Math.min(INVENTORY_VERTICAL_HEADER_LINE_PX, Math.max(20, estimated));
}

export type InventoryTitleChoice = 'SAME' | RiskInventoryColumnOrientation;

/**
 * Dialog title control.
 * A saved column without headerOrientation stays Igual and follows that saved content.
 * With no saved column, Igual is used only when the canonical title matches the canonical content.
 * EPI and the two RO columns show Horizontal, because their canonical content is vertical.
 */
export function inventoryColumnDraftHeaderChoice(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryColumnKey,
): InventoryTitleChoice {
  const saved = preference?.columns.find((column) => column.key === key);
  if (saved?.headerOrientation) return saved.headerOrientation;
  if (saved) return 'SAME';
  const header = inventoryCanonicalHeaderOrientation(key);
  if (header === inventoryCanonicalContentOrientation(key)) return 'SAME';
  return header;
}

/**
 * Draft shown in the dialog. It is not persisted until Salvar.
 * A missing column shows the canonical content orientation.
 */
export function inventoryColumnDraftOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryColumnKey,
): RiskInventoryColumnOrientation {
  const saved = preference?.columns.find((column) => column.key === key);
  if (saved) return saved.orientation;
  return inventoryCanonicalContentOrientation(key);
}

/**
 * rotate(-90deg) reads from the bottom upward.
 * The in-flow box keeps a fixed size so the table row cannot follow the raw string length.
 */
export const INVENTORY_VERTICAL_READING = 'bottom-to-top' as const;
export const INVENTORY_VERTICAL_ROTATION = 'rotate(-90deg)' as const;
/** Vertical run of one wrapped line. Caps the body row height. */
export const INVENTORY_VERTICAL_LINE_PX = 140;
/** Header titles are short. Caps the header row without using the body box. */
export const INVENTORY_VERTICAL_HEADER_LINE_PX = 104;
/** How many wrapped lines may stack before the rest stays in the tooltip. */
export const INVENTORY_VERTICAL_STACK_PX = 96;

export function inventoryVerticalRiskText(
  presentation: RiskInventoryPresentation | null | undefined,
): string {
  const label = presentation?.label?.trim() || '';
  return label || INVENTORY_EMPTY;
}

export function inventoryPresentationColor(
  presentation: RiskInventoryPresentation | null | undefined,
): string | null {
  const color = presentation?.color?.trim();
  return color || null;
}

export const INVENTORY_SCOPE_LABEL = 'Abrangência:';
export const INVENTORY_EXPOSED_LABEL = 'Quantidade de funcionários expostos:';

export function inventoryUnitScopeText(scope: string[] | null | undefined): string | null {
  const items = (scope || []).map((item) => item.trim()).filter(Boolean);
  return items.length ? items.join(', ') : null;
}

export function inventoryExposedEmployeeText(count: number | null | undefined): string {
  if (count == null || Number.isNaN(count)) return '0';
  return String(count);
}
