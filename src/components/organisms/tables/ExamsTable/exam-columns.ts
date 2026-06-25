import { STableColumnsProps } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';

import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';

export enum ExamColumnEnum {
  NAME = 'NAME',
  ANALYSES = 'ANALYSES',
  MATERIAL = 'MATERIAL',
  ORIGIN = 'ORIGIN',
  STATUS = 'STATUS',
}

type ColumnConfig = {
  label: string;
  sortable: boolean;
  /** Backend orderBy field (server-side sort). Absent => not sortable on server. */
  sortField?: NonNullable<IQueryExam['orderBy']>;
  startHidden?: boolean;
};

export const examColumnMap: Record<ExamColumnEnum, ColumnConfig> = {
  [ExamColumnEnum.NAME]: { label: 'Nome', sortable: true, sortField: 'name' },
  [ExamColumnEnum.ANALYSES]: {
    label: 'Análise',
    sortable: true,
    sortField: 'analyses',
  },
  [ExamColumnEnum.MATERIAL]: {
    label: 'Material',
    sortable: true,
    sortField: 'material',
  },
  // Origin is a computed field; not sortable server-side.
  [ExamColumnEnum.ORIGIN]: { label: 'Origem', sortable: false },
  [ExamColumnEnum.STATUS]: { label: 'Status', sortable: true, sortField: 'status' },
};

export const examColumns: STableColumnsProps[] = Object.entries(examColumnMap).map(
  ([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }),
);
