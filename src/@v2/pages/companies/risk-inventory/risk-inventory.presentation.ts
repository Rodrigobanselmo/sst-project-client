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

export const INVENTORY_CONFIGURABLE_COLUMNS: Array<{
  key: RiskInventoryConfigurableColumnKey;
  label: string;
}> = [
  { key: 'TYPE', label: 'Tipo' },
  { key: 'HAZARD', label: 'Fator de risco' },
  { key: 'DAMAGE', label: 'Risco / dano' },
  { key: 'GENERATING_SOURCE', label: 'Fonte geradora' },
  { key: 'EPI', label: 'EPI' },
  { key: 'ENGINEERING', label: 'EPC / ENG' },
  { key: 'ADMINISTRATIVE', label: 'ADM' },
  { key: 'SEVERITY', label: 'S' },
  { key: 'PROBABILITY', label: 'P' },
  { key: 'REAL_RISK', label: 'Risco real' },
  { key: 'RECOMMENDATIONS', label: 'Recomendações' },
  { key: 'PROBABILITY_RESIDUAL', label: 'P residual' },
  { key: 'RESIDUAL_RISK', label: 'Risco residual' },
];

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

const WORD_HISTORICAL_VERTICAL = new Set<RiskInventoryConfigurableColumnKey>([
  'TYPE',
  'REAL_RISK',
  'RESIDUAL_RISK',
]);

/** Screen default is horizontal whenever the workspace has no saved preference or that key is absent. */
export function inventoryColumnOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryConfigurableColumnKey,
): RiskInventoryColumnOrientation {
  if (preference == null) return 'HORIZONTAL';
  return preference.columns.find((column) => column.key === key)?.orientation ?? 'HORIZONTAL';
}

export function inventoryScreenColumnOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  columnId: keyof typeof SCREEN_COLUMN_KEY,
): RiskInventoryColumnOrientation {
  return inventoryColumnOrientation(preference, SCREEN_COLUMN_KEY[columnId]);
}

/** Screen title. A missing header choice follows the content orientation. Null stays horizontal. */
export function inventoryColumnHeaderOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryConfigurableColumnKey,
): RiskInventoryColumnOrientation {
  if (preference == null) return 'HORIZONTAL';
  const saved = preference.columns.find((column) => column.key === key);
  if (!saved) return 'HORIZONTAL';
  return saved.headerOrientation ?? saved.orientation;
}

export function inventoryScreenColumnHeaderOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  columnId: keyof typeof SCREEN_COLUMN_KEY,
): RiskInventoryColumnOrientation {
  return inventoryColumnHeaderOrientation(preference, SCREEN_COLUMN_KEY[columnId]);
}

export type InventoryTitleChoice = 'SAME' | RiskInventoryColumnOrientation;

/** Dialog title control. Absent headerOrientation is shown as Igual and is not saved. */
export function inventoryColumnDraftHeaderChoice(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryConfigurableColumnKey,
): InventoryTitleChoice {
  return preference?.columns.find((column) => column.key === key)?.headerOrientation ?? 'SAME';
}

/**
 * Draft shown in the dialog. It is not persisted until Salvar.
 * Missing keys follow the Word historical default so saving the draft does not flatten those Word columns.
 */
export function inventoryColumnDraftOrientation(
  preference: RiskInventoryColumnsPreference | null | undefined,
  key: RiskInventoryConfigurableColumnKey,
): RiskInventoryColumnOrientation {
  const saved = preference?.columns.find((column) => column.key === key);
  if (saved) return saved.orientation;
  return WORD_HISTORICAL_VERTICAL.has(key) ? 'VERTICAL' : 'HORIZONTAL';
}

/**
 * rotate(-90deg) reads from the bottom upward.
 * The in-flow box keeps a fixed size so the table row cannot follow the raw string length.
 */
export const INVENTORY_VERTICAL_READING = 'bottom-to-top' as const;
export const INVENTORY_VERTICAL_ROTATION = 'rotate(-90deg)' as const;
/** Vertical run of one wrapped line. Caps the row height. */
export const INVENTORY_VERTICAL_LINE_PX = 140;
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
