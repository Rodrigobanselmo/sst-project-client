import { STableColumnsProps } from '../../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { AbsenteeismColumnsEnum } from '../enums/absenteeism-columns.enum';

type AbsenteeismTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const AbsenteeismColumnMap: Record<
  AbsenteeismColumnsEnum,
  AbsenteeismTypeMapValue
> = {
  [AbsenteeismColumnsEnum.NAME]: { label: 'Nome', alwaysVisible: true },
  [AbsenteeismColumnsEnum.TOTAL]: {
    label: 'Total de Atestados',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.TOTAL_DAYS]: {
    label: 'Total de Dias',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.STATUS]: { label: 'Status', alwaysVisible: true },
};

export const absenteeismColumns = Object.entries(AbsenteeismColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
