import { CHARACTERIZATION_WIZARD_STEP } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';
import { RiskPrioritizationCell, RiskPrioritizationOrigin } from '@v2/services/security/risk-prioritization/risk-prioritization.types';
import { GSE_WIZARD_STEP } from 'components/organisms/modals/ModalAddGHO/gse-wizard-steps';
import { resolveGseEffectiveOriginAction } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/open-gse-effective-origin.util';
import { ModalEnum } from 'core/enums/modal.enums';

export function cellKey(rowId: string, riskId: string): string {
  return `${rowId}::${riskId}`;
}

export function indexPrioritizationCells(
  cells: RiskPrioritizationCell[],
): Map<string, RiskPrioritizationCell> {
  const map = new Map<string, RiskPrioritizationCell>();
  for (const cell of cells) {
    map.set(cellKey(cell.rowId, cell.riskId), cell);
  }
  return map;
}

export function sortPrioritizationOrigins(
  origins: RiskPrioritizationOrigin[],
): RiskPrioritizationOrigin[] {
  return [...origins].sort((a, b) => {
    if (a.isDeterminant !== b.isDeterminant) {
      return a.isDeterminant ? -1 : 1;
    }
    const name = a.originName.localeCompare(b.originName, 'pt-BR');
    if (name !== 0) return name;
    return a.riskFactorDataId.localeCompare(b.riskFactorDataId);
  });
}

export function isOriginNavigable(origin: RiskPrioritizationOrigin): boolean {
  return Boolean(origin.openOrigin);
}

export type PrioritizationCellClick =
  | { type: 'none' }
  | { type: 'open-origin'; origin: RiskPrioritizationOrigin }
  | { type: 'select-origins'; origins: RiskPrioritizationOrigin[] };

export function resolvePrioritizationCellClick(
  cell: RiskPrioritizationCell | undefined,
): PrioritizationCellClick {
  if (!cell || !cell.origins.length) return { type: 'none' };
  if (cell.origins.length === 1) {
    const origin = cell.origins[0]!;
    if (!isOriginNavigable(origin)) return { type: 'none' };
    return { type: 'open-origin', origin };
  }
  return {
    type: 'select-origins',
    origins: sortPrioritizationOrigins(cell.origins),
  };
}

export function buildPrioritizationCellTooltip(params: {
  riskName: string;
  cell: RiskPrioritizationCell;
}): string {
  const kind = params.cell.isQuantity ? 'Quantitativo' : 'Qualitativo';
  const originCount = params.cell.origins.length;
  const originLabel =
    originCount === 1 ? '1 origem' : `${originCount} origens`;
  return [
    params.riskName,
    `${params.cell.abbreviation} — ${params.cell.label}`,
    `Nível ${params.cell.level} · ${kind}`,
    originLabel,
  ].join('\n');
}

export function normalizeCssColor(color?: string | null): string | undefined {
  if (!color) return undefined;
  const trimmed = color.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('#')) return trimmed;
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

export function contrastTextColor(background?: string | null): string {
  const hex = String(normalizeCssColor(background) || '').replace('#', '');
  if (hex.length !== 6) return '#1A202C';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1A202C' : '#FFFFFF';
}

export type OpenPrioritizationOriginResult =
  | { type: 'characterization'; href: string }
  | {
      type: 'gse';
      modal: ModalEnum.GHO_ADD;
      payload: {
        id: string;
        layout: 'page';
        initialWizardStep: number;
      };
    }
  | null;

export function resolvePrioritizationOriginNavigation(params: {
  origin: RiskPrioritizationOrigin;
  companyId?: string;
}): OpenPrioritizationOriginResult {
  if (!params.origin.openOrigin) return null;
  const action = resolveGseEffectiveOriginAction({
    openOrigin: params.origin.openOrigin,
    companyId: params.companyId,
  });
  if (!action) return null;
  if (action.type === 'characterization') {
    return action;
  }
  return {
    type: 'gse',
    modal: action.modal,
    payload: {
      id: action.payload.id,
      layout: 'page',
      initialWizardStep: GSE_WIZARD_STEP.RISKS,
    },
  };
}

export const PRIORITIZATION_CHARACTERIZATION_WIZARD_STEP =
  CHARACTERIZATION_WIZARD_STEP.RISKS;

export type PrioritizationViewState =
  | 'need-workspace'
  | 'loading'
  | 'error'
  | 'empty'
  | 'grid';

export function resolvePrioritizationViewState(params: {
  workspaceId?: string;
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
}): PrioritizationViewState {
  if (!params.workspaceId) return 'need-workspace';
  if (params.isLoading) return 'loading';
  if (params.isError) return 'error';
  if (!params.hasData) return 'empty';
  return 'grid';
}
