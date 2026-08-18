import { STableColumnsProps } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';

export enum ChemicalProductColumnsEnum {
  TRADE_NAME = 'TRADE_NAME',
  MANUFACTURER = 'MANUFACTURER',
  TYPE = 'TYPE',
  INGREDIENTS = 'INGREDIENTS',
  FISPQ = 'FISPQ',
  EMPLOYEES = 'EMPLOYEES',
  STATUS = 'STATUS',
  ACTIONS = 'ACTIONS',
}

type ChemicalProductColumnMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const ChemicalProductColumnMap: Record<
  ChemicalProductColumnsEnum,
  ChemicalProductColumnMapValue
> = {
  [ChemicalProductColumnsEnum.TRADE_NAME]: {
    label: 'Nome comercial',
    alwaysVisible: true,
  },
  [ChemicalProductColumnsEnum.MANUFACTURER]: { label: 'Fabricante' },
  [ChemicalProductColumnsEnum.TYPE]: { label: 'Tipo' },
  [ChemicalProductColumnsEnum.INGREDIENTS]: { label: 'Componentes' },
  [ChemicalProductColumnsEnum.FISPQ]: { label: 'FISPQ vigente' },
  [ChemicalProductColumnsEnum.EMPLOYEES]: { label: 'Empregados' },
  [ChemicalProductColumnsEnum.STATUS]: { label: 'Status' },
  [ChemicalProductColumnsEnum.ACTIONS]: {
    label: 'Ações',
    alwaysVisible: true,
  },
};

export const chemicalProductColumns = Object.entries(ChemicalProductColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));

export const getHiddenChemicalProductColumn = (
  hiddenColumns: Record<ChemicalProductColumnsEnum, boolean>,
  column: ChemicalProductColumnsEnum,
) => {
  return column in hiddenColumns
    ? hiddenColumns[column] && !ChemicalProductColumnMap[column].alwaysVisible
    : ChemicalProductColumnMap[column].startHidden;
};
