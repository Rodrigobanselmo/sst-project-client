import { STableColumnsProps } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';

import type { EsocialTable27Item } from '@v2/services/esocial/esocial-table-27/service/esocial-table-27.types';

export enum EsocialTable27ColumnEnum {
  CODE = 'CODE',
  NAME = 'NAME',
}

type ColumnConfig = {
  label: string;
  sortable: boolean;
  startHidden?: boolean;
  getSortValue: (row: EsocialTable27Item) => string;
};

export const esocialTable27ColumnMap: Record<
  EsocialTable27ColumnEnum,
  ColumnConfig
> = {
  [EsocialTable27ColumnEnum.CODE]: {
    label: 'Código',
    sortable: true,
    getSortValue: (row) => row.code,
  },
  [EsocialTable27ColumnEnum.NAME]: {
    label: 'Procedimento',
    sortable: true,
    getSortValue: (row) => row.name,
  },
};

export const esocialTable27Columns: STableColumnsProps[] = Object.entries(
  esocialTable27ColumnMap,
).map(([value, { label, startHidden }]) => ({ value, label, startHidden }));

export type EsocialTable27OrderBy = {
  field: EsocialTable27ColumnEnum;
  order: 'asc' | 'desc';
};

export function sortEsocialTable27(
  rows: EsocialTable27Item[],
  orderBy: EsocialTable27OrderBy | null,
): EsocialTable27Item[] {
  if (!orderBy) return rows;

  const getValue = esocialTable27ColumnMap[orderBy.field].getSortValue;
  const factor = orderBy.order === 'asc' ? 1 : -1;

  return [...rows].sort(
    (a, b) =>
      String(getValue(a)).localeCompare(String(getValue(b)), 'pt-BR', {
        sensitivity: 'base',
        numeric: true,
      }) * factor,
  );
}
