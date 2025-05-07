import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { TaskColumnsEnum } from '../enums/task-columns.enum';

type TaskTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const TaskColumnMap: Record<TaskColumnsEnum, TaskTypeMapValue> = {
  [TaskColumnsEnum.CHECK_BOX]: { label: '', alwaysVisible: true },
  [TaskColumnsEnum.ID]: { label: 'ID', alwaysVisible: true },
  [TaskColumnsEnum.DESCRIPTION]: { label: 'Descrição', alwaysVisible: true },
  [TaskColumnsEnum.PRIORITY]: { label: 'Prioridade' },
  [TaskColumnsEnum.STATUS]: { label: 'Status' },
  [TaskColumnsEnum.RESPONSIBLE]: { label: 'Responsável' },
  [TaskColumnsEnum.END_DATE]: { label: 'Prazo' },
  [TaskColumnsEnum.CREATED_BY]: { label: 'Criação', startHidden: true },
  [TaskColumnsEnum.CREATED_AT]: { label: 'Criado', startHidden: true },
  [TaskColumnsEnum.UPDATED_AT]: { label: 'Atualizado', startHidden: true },
};

export const taskColumns = Object.entries(TaskColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
