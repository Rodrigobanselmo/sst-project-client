import { STableColumnsProps } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';

export enum ChemicalUseScenarioColumnsEnum {
  PRODUCT = 'PRODUCT',
  RISK_FACTORS = 'RISK_FACTORS',
  ACTIVITY = 'ACTIVITY',
  SECTOR = 'SECTOR',
  EXPOSURE_GROUP = 'EXPOSURE_GROUP',
  FREQUENCY = 'FREQUENCY',
  DURATION = 'DURATION',
  QUANTITY = 'QUANTITY',
  SOURCE_ROWS = 'SOURCE_ROWS',
  STATUS = 'STATUS',
  ACTIONS = 'ACTIONS',
}

type ChemicalUseScenarioColumnMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const ChemicalUseScenarioColumnMap: Record<
  ChemicalUseScenarioColumnsEnum,
  ChemicalUseScenarioColumnMapValue
> = {
  [ChemicalUseScenarioColumnsEnum.PRODUCT]: {
    label: 'Produto',
    alwaysVisible: true,
  },
  [ChemicalUseScenarioColumnsEnum.RISK_FACTORS]: {
    label: 'Fator(es) de risco desta atividade',
  },
  [ChemicalUseScenarioColumnsEnum.ACTIVITY]: { label: 'Tarefa' },
  [ChemicalUseScenarioColumnsEnum.SECTOR]: { label: 'Setor' },
  [ChemicalUseScenarioColumnsEnum.EXPOSURE_GROUP]: { label: 'GSE' },
  [ChemicalUseScenarioColumnsEnum.FREQUENCY]: { label: 'Freq.' },
  [ChemicalUseScenarioColumnsEnum.DURATION]: { label: 'Duração' },
  [ChemicalUseScenarioColumnsEnum.QUANTITY]: { label: 'Qtd' },
  [ChemicalUseScenarioColumnsEnum.SOURCE_ROWS]: { label: 'Linhas' },
  [ChemicalUseScenarioColumnsEnum.STATUS]: {
    label: 'Status',
    alwaysVisible: true,
  },
  [ChemicalUseScenarioColumnsEnum.ACTIONS]: {
    label: 'Ações',
    alwaysVisible: true,
  },
};

export const chemicalUseScenarioColumns = Object.entries(
  ChemicalUseScenarioColumnMap,
)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));

export const getHiddenChemicalUseScenarioColumn = (
  hiddenColumns: Record<ChemicalUseScenarioColumnsEnum, boolean>,
  column: ChemicalUseScenarioColumnsEnum,
) => {
  return column in hiddenColumns
    ? hiddenColumns[column] &&
        !ChemicalUseScenarioColumnMap[column].alwaysVisible
    : ChemicalUseScenarioColumnMap[column].startHidden;
};
