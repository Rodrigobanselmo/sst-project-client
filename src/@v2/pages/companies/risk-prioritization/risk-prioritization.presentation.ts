import {
  PrioritizationMatrixOrientation,
  RiskPrioritizationBrowseResult,
  RiskPrioritizationCell,
  RiskPrioritizationUnitKind,
} from '@v2/services/security/risk-prioritization/risk-prioritization.types';

import { cellKey, indexPrioritizationCells } from './risk-prioritization.util';

export type { PrioritizationMatrixOrientation };

export type PrioritizationRiskState = 'REAL' | 'RESIDUAL';

export type VisiblePrioritizationClassification = {
  abbreviation: string;
  label: string;
  color: string | null;
  level: number;
  isQuantity: boolean;
  isPrioritized: boolean;
};

const TYPE_ORDER = ['FIS', 'QUI', 'BIO', 'ERG', 'ACI', 'OUTROS'] as const;

const TYPE_GROUP_LABEL: Record<(typeof TYPE_ORDER)[number], string> = {
  FIS: 'Físicos',
  QUI: 'Químicos',
  BIO: 'Biológicos',
  ERG: 'Ergonômicos',
  ACI: 'Acidentes',
  OUTROS: 'Outros',
};

const TYPE_ACCENT: Record<(typeof TYPE_ORDER)[number], string> = {
  FIS: 'risk.fis',
  QUI: 'risk.qui',
  BIO: 'risk.bio',
  ERG: 'risk.erg',
  ACI: 'risk.aci',
  OUTROS: 'risk.outros',
};

export type PresentedPrioritizationColumn = {
  id: string;
  label: string;
  groupKey: string;
  groupLabel: string;
  groupCode: string;
  accent?: string;
};

export type PresentedPrioritizationRow = {
  id: string;
  label: string;
  groupKey: string;
  groupLabel: string;
};

export type PresentedPrioritizationMatrix = {
  orientation: PrioritizationMatrixOrientation;
  cornerLabel: string;
  rows: PresentedPrioritizationRow[];
  columns: PresentedPrioritizationColumn[];
  columnGroups: Array<{
    key: string;
    label: string;
    code: string;
    accent?: string;
    columns: PresentedPrioritizationColumn[];
  }>;
  cell: (rowId: string, columnId: string) => RiskPrioritizationCell | undefined;
  riskName: (rowId: string, columnId: string) => string;
};

export function displayedPrioritizationOrientation(
  stored: PrioritizationMatrixOrientation | null | undefined,
): PrioritizationMatrixOrientation {
  return stored === 'RISKS_IN_ROWS' ? 'RISKS_IN_ROWS' : 'UNITS_IN_ROWS';
}

/** Real uses the current cell. Residual uses only the persisted snapshot. */
export function visiblePrioritizationClassification(
  cell: RiskPrioritizationCell,
  riskState: PrioritizationRiskState,
): VisiblePrioritizationClassification | null {
  if (riskState !== 'RESIDUAL') {
    return {
      abbreviation: cell.abbreviation,
      label: cell.label,
      color: cell.color,
      level: cell.level,
      isQuantity: cell.isQuantity,
      isPrioritized: cell.isPrioritized,
    };
  }
  if (!cell.residual?.abbreviation) return null;
  return {
    abbreviation: cell.residual.abbreviation,
    label: cell.residual.label,
    color: cell.residual.color,
    level: cell.residual.level,
    isQuantity: false,
    isPrioritized: cell.residual.level >= 4,
  };
}

export function legendForPrioritizationState(
  data: Pick<RiskPrioritizationBrowseResult, 'legend' | 'residualLegend'>,
  riskState: PrioritizationRiskState,
) {
  return riskState === 'RESIDUAL' ? data.residualLegend ?? [] : data.legend;
}

/** Opening the screen never writes. A click writes only when the stored value changes. */
export function prioritizationOrientationToPersist(params: {
  event: 'open' | 'select';
  stored: PrioritizationMatrixOrientation | null | undefined;
  selected?: PrioritizationMatrixOrientation;
}): PrioritizationMatrixOrientation | null {
  if (params.event !== 'select' || !params.selected) return null;
  if (params.stored === params.selected) return null;
  return params.selected;
}

function typeOrderIndex(typeCode: string | null): number {
  if (!typeCode) return TYPE_ORDER.length + 1;
  const index = TYPE_ORDER.indexOf(typeCode as (typeof TYPE_ORDER)[number]);
  return index === -1 ? TYPE_ORDER.length : index;
}

function kindLabel(kind: RiskPrioritizationUnitKind): string {
  return kind === 'REAL_GSE' ? 'GSE' : 'Elemento Caracterizado';
}

function kindCode(kind: RiskPrioritizationUnitKind): string {
  return kind === 'REAL_GSE' ? 'GSE' : 'EL';
}

function riskGroup(typeCode: string | null): {
  groupKey: string;
  groupLabel: string;
  groupCode: string;
  accent?: string;
} {
  const known = typeCode && TYPE_GROUP_LABEL[typeCode as keyof typeof TYPE_GROUP_LABEL];
  return {
    groupKey: typeCode || 'none',
    groupLabel: known || (typeCode ? typeCode : '—'),
    groupCode: typeCode || '—',
    accent: typeCode ? TYPE_ACCENT[typeCode as keyof typeof TYPE_ACCENT] : undefined,
  };
}

function sortRisks<T extends { name: string; typeCode: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const type = typeOrderIndex(a.typeCode) - typeOrderIndex(b.typeCode);
    if (type !== 0) return type;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

function groupColumns(columns: PresentedPrioritizationColumn[]) {
  const groups: PresentedPrioritizationMatrix['columnGroups'] = [];
  for (const column of columns) {
    const last = groups[groups.length - 1];
    if (last && last.key === column.groupKey) {
      last.columns.push(column);
      continue;
    }
    groups.push({
      key: column.groupKey,
      label: column.groupLabel,
      code: column.groupCode,
      accent: column.accent,
      columns: [column],
    });
  }
  return groups;
}

export function presentPrioritizationMatrix(
  data: Pick<RiskPrioritizationBrowseResult, 'rows' | 'columns' | 'cells'>,
  orientation: PrioritizationMatrixOrientation,
): PresentedPrioritizationMatrix {
  const byKey = indexPrioritizationCells(data.cells);
  const riskById = new Map(data.columns.map((column) => [column.riskId, column.name]));
  const unitById = new Map(data.rows.map((row) => [row.id, row.label]));

  if (orientation === 'RISKS_IN_ROWS') {
    const rows: PresentedPrioritizationRow[] = sortRisks(data.columns).map((column) => {
      const group = riskGroup(column.typeCode);
      return {
        id: column.riskId,
        label: column.name,
        groupKey: group.groupKey,
        groupLabel: group.groupLabel,
      };
    });
    const columns: PresentedPrioritizationColumn[] = data.rows.map((row) => ({
      id: row.id,
      label: row.label,
      groupKey: row.kind,
      groupLabel: kindLabel(row.kind),
      groupCode: kindCode(row.kind),
    }));
    return {
      orientation,
      cornerLabel: 'Riscos',
      rows,
      columns,
      columnGroups: groupColumns(columns),
      cell: (rowId, columnId) => byKey.get(cellKey(columnId, rowId)),
      riskName: (rowId) => riskById.get(rowId) || '',
    };
  }

  const rows: PresentedPrioritizationRow[] = data.rows.map((row) => ({
    id: row.id,
    label: row.label,
    groupKey: row.kind,
    groupLabel: kindLabel(row.kind),
  }));
  const columns: PresentedPrioritizationColumn[] = sortRisks(data.columns).map((column) => {
    const group = riskGroup(column.typeCode);
    return {
      id: column.riskId,
      label: column.name,
      ...group,
    };
  });
  return {
    orientation,
    cornerLabel: 'GSE / Elemento',
    rows,
    columns,
    columnGroups: groupColumns(columns),
    cell: (rowId, columnId) => byKey.get(cellKey(rowId, columnId)),
    riskName: (_rowId, columnId) => riskById.get(columnId) || unitById.get(_rowId) || '',
  };
}
