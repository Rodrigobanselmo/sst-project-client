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
  [AbsenteeismColumnsEnum.AVARAGE_DAYS]: {
    label: 'Taxa',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.TOTAL]: {
    label: 'Atest.',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.TOTAL_DAYS]: {
    label: 'Dias',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.WORKSPACE]: {
    label: 'Estabelecimento',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.DIRECTORY]: {
    label: 'Superintendência',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.MANAGEMENT]: {
    label: 'Diretoria',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.SECTOR]: {
    label: 'Setor',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.SUB_SECTOR]: {
    label: 'Sub setor',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.OFFICE]: {
    label: 'Cargo',
    alwaysVisible: true,
  },
  [AbsenteeismColumnsEnum.SUB_OFFICE]: {
    label: 'Subcargo',
    alwaysVisible: true,
  },
};

export const absenteeismColumns = Object.entries(AbsenteeismColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
