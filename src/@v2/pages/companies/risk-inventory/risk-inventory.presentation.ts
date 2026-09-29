import {
  RiskInventoryColumnOrientation,
  RiskInventoryColumnsPreference,
  RiskInventoryConfigurableColumnKey,
  RiskInventoryEpi,
  RiskInventoryPresentation,
  RiskInventoryRow,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

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

export function inventoryDefaultColumnLabel(key: RiskInventoryConfigurableColumnKey): string {
  return INVENTORY_CONFIGURABLE_COLUMNS.find((column) => column.key === key)!.label;
}

/** Width role controls alignment and the vertical stack. The column share comes from its weight. */
export type InventoryColumnWidthRole = 'mark' | 'token' | 'text';

const INVENTORY_COLUMN_WIDTH_ROLE: Record<RiskInventoryConfigurableColumnKey, InventoryColumnWidthRole> = {
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
 * Spans follow the 13 screen columns: no Origem, and no second S.
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

const SCREEN_COLUMN_KEY = {
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

function inventoryCanonicalContentOrientation(
  key: RiskInventoryConfigurableColumnKey,
): RiskInventoryColumnOrientation {
  return INVENTORY_CANONICAL_CONTENT_VERTICAL.has(key) ? 'VERTICAL' : 'HORIZONTAL';
}

function inventoryCanonicalHeaderOrientation(
  key: RiskInventoryConfigurableColumnKey,
): RiskInventoryColumnOrientation {
  return INVENTORY_CANONICAL_HEADER_VERTICAL.has(key) ? 'VERTICAL' : 'HORIZONTAL';
}

/** Content orientation. A missing preference or a missing key uses the canonical layout. */
export function inventoryColumnOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryConfigurableColumnKey,
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
  key: RiskInventoryConfigurableColumnKey,
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
  key: RiskInventoryConfigurableColumnKey,
): string {
  return preference?.columns.find((column) => column.key === key)?.headerLabel ?? '';
}

export function inventoryScreenColumnHeaderOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  columnId: keyof typeof SCREEN_COLUMN_KEY,
): RiskInventoryColumnOrientation {
  return inventoryColumnHeaderOrientation(preference, SCREEN_COLUMN_KEY[columnId]);
}

export function inventoryColumnWidthWeight(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryConfigurableColumnKey,
): number {
  const saved = preference?.columns.find((column) => column.key === key)?.widthWeight;
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
  key: RiskInventoryConfigurableColumnKey,
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
  key: RiskInventoryConfigurableColumnKey,
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
