import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { ActionPlanColumnsEnum } from '../enums/action-plan-columns.enum';

type ActionPlanTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const ActionPlanColumnMap: Record<
  ActionPlanColumnsEnum,
  ActionPlanTypeMapValue
> = {
  [ActionPlanColumnsEnum.CHECK_BOX]: { label: '', alwaysVisible: true },
  [ActionPlanColumnsEnum.ORIGIN]: { label: 'Origem', alwaysVisible: true },
  [ActionPlanColumnsEnum.RISK]: { label: 'Risco' },
  [ActionPlanColumnsEnum.GENERATE_SOURCE]: { label: 'Fonte de Geração' },
  [ActionPlanColumnsEnum.LEVEL]: { label: 'Nível' },
  [ActionPlanColumnsEnum.RECOMMENDATION]: { label: 'Recomendação' },
  [ActionPlanColumnsEnum.STATUS]: { label: 'Status' },
  [ActionPlanColumnsEnum.RESPONSIBLE]: { label: 'Responsável' },
  [ActionPlanColumnsEnum.CREATED_AT]: { label: 'Criado', startHidden: true },
  [ActionPlanColumnsEnum.UPDATED_AT]: {
    label: 'Atualizado',
    startHidden: true,
  },
  [ActionPlanColumnsEnum.DIRECTORY]: { label: 'Diretório', startHidden: true },
  [ActionPlanColumnsEnum.MANAGEMENT]: { label: 'Gerência', startHidden: true },
  [ActionPlanColumnsEnum.SECTOR]: { label: 'Setor', startHidden: true },
  [ActionPlanColumnsEnum.SUB_SECTOR]: { label: 'Subsetor', startHidden: true },
  [ActionPlanColumnsEnum.OFFICE]: { label: 'Cargo' },
  [ActionPlanColumnsEnum.SUB_OFFICE]: {
    label: 'Cargo Desenvolvido',
    startHidden: true,
  },
  [ActionPlanColumnsEnum.VALID_DATE]: {label: 'Prazo',
  }
};

export const actionPlanColumns = Object.entries(ActionPlanColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
