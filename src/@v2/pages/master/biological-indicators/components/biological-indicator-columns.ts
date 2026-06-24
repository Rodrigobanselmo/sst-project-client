import { STableColumnsProps } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import {
  BIOLOGICAL_INDICATOR_STATUS_LABELS,
  BIOLOGICAL_INDICATOR_TABLE_LABELS,
  BIOLOGICAL_INDICATOR_TYPE_LABELS,
} from '../biological-indicator-labels.util';
import type { BiologicalIndicatorListItem } from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';

export enum BiologicalIndicatorColumnEnum {
  SUBSTANCE = 'SUBSTANCE',
  CAS = 'CAS',
  INDICATOR = 'INDICATOR',
  MATRIX = 'MATRIX',
  COLLECTION_MOMENT = 'COLLECTION_MOMENT',
  TABLE = 'TABLE',
  TYPE = 'TYPE',
  REFERENCE_VALUE = 'REFERENCE_VALUE',
  STATUS = 'STATUS',
  RISK = 'RISK',
  EXAM = 'EXAM',
  PENDENCIES = 'PENDENCIES',
}

type ColumnConfig = {
  label: string;
  sortable: boolean;
  startHidden?: boolean;
  getSortValue?: (row: BiologicalIndicatorListItem) => string | number;
};

const confirmedRisk = (row: BiologicalIndicatorListItem) =>
  row.riskLinks.find((link) => link.isConfirmed) ?? row.riskLinks[0];

const confirmedExam = (row: BiologicalIndicatorListItem) =>
  row.examLinks.find((link) => link.isConfirmed);

export const biologicalIndicatorColumnMap: Record<
  BiologicalIndicatorColumnEnum,
  ColumnConfig
> = {
  [BiologicalIndicatorColumnEnum.SUBSTANCE]: {
    label: 'Substância',
    sortable: true,
    getSortValue: (row) => row.substanceName,
  },
  [BiologicalIndicatorColumnEnum.CAS]: {
    label: 'CAS',
    sortable: true,
    getSortValue: (row) => row.casPrimary ?? row.casNumbers[0] ?? '',
  },
  [BiologicalIndicatorColumnEnum.INDICATOR]: {
    label: 'Indicador biológico',
    sortable: true,
    getSortValue: (row) => row.biologicalIndicatorOriginal,
  },
  [BiologicalIndicatorColumnEnum.MATRIX]: {
    label: 'Matriz',
    sortable: true,
    getSortValue: (row) => row.biologicalMatrix,
  },
  [BiologicalIndicatorColumnEnum.COLLECTION_MOMENT]: {
    label: 'Momento da coleta',
    sortable: true,
    startHidden: true,
    getSortValue: (row) => row.collectionMoment,
  },
  [BiologicalIndicatorColumnEnum.TABLE]: {
    label: 'Quadro',
    sortable: true,
    getSortValue: (row) => BIOLOGICAL_INDICATOR_TABLE_LABELS[row.tableNumber],
  },
  [BiologicalIndicatorColumnEnum.TYPE]: {
    label: 'Tipo',
    sortable: true,
    getSortValue: (row) => BIOLOGICAL_INDICATOR_TYPE_LABELS[row.indicatorType],
  },
  [BiologicalIndicatorColumnEnum.REFERENCE_VALUE]: {
    label: 'Valor de referência',
    sortable: true,
    getSortValue: (row) => row.referenceValue ?? '',
  },
  [BiologicalIndicatorColumnEnum.STATUS]: {
    label: 'Status',
    sortable: true,
    getSortValue: (row) => BIOLOGICAL_INDICATOR_STATUS_LABELS[row.status],
  },
  [BiologicalIndicatorColumnEnum.RISK]: {
    label: 'Risco',
    sortable: true,
    getSortValue: (row) => {
      const link = confirmedRisk(row);
      return link?.riskFactor?.name ?? link?.riskNameSnapshot ?? '';
    },
  },
  [BiologicalIndicatorColumnEnum.EXAM]: {
    label: 'Exame',
    sortable: true,
    getSortValue: (row) => {
      const link = confirmedExam(row);
      return link?.exam?.name ?? link?.examNameSnapshot ?? '';
    },
  },
  [BiologicalIndicatorColumnEnum.PENDENCIES]: {
    label: 'Pendências',
    sortable: true,
    getSortValue: (row) => row.pendencies.length,
  },
};

export const biologicalIndicatorColumns: STableColumnsProps[] = Object.entries(
  biologicalIndicatorColumnMap,
).map(([value, { label, startHidden }]) => ({
  value,
  label,
  startHidden,
}));

export function sortBiologicalIndicators(
  rows: BiologicalIndicatorListItem[],
  orderBy: { field: BiologicalIndicatorColumnEnum; order: 'asc' | 'desc' } | null,
): BiologicalIndicatorListItem[] {
  if (!orderBy) return rows;

  const getValue = biologicalIndicatorColumnMap[orderBy.field].getSortValue;
  if (!getValue) return rows;

  const factor = orderBy.order === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return (valueA - valueB) * factor;
    }

    return (
      String(valueA).localeCompare(String(valueB), 'pt-BR', {
        sensitivity: 'base',
        numeric: true,
      }) * factor
    );
  });
}
