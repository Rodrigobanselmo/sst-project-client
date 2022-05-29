import { StatusEnum } from 'project/enum/status.enum';

export interface IStatusOption {
  value: StatusEnum;
  name: string;
  color: string;
}
interface IStatusOptions extends Record<StatusEnum, IStatusOption> {}

export const statusOptionsConstant = {
  [StatusEnum.ACTIVE]: {
    value: StatusEnum.ACTIVE,
    name: 'Ativo',
    color: 'success.main',
  },
  [StatusEnum.CANCELED]: {
    value: StatusEnum.CANCELED,
    name: 'Cancelado',
    color: 'error.main',
  },
  [StatusEnum.INACTIVE]: {
    value: StatusEnum.INACTIVE,
    name: 'Inativo',
    color: 'error.main',
  },
  [StatusEnum.PENDING]: {
    value: StatusEnum.PENDING,
    name: 'Pendente',
    color: 'warning.main',
  },
  [StatusEnum.PROGRESS]: {
    value: StatusEnum.PROGRESS,
    name: 'Progresso',
    color: 'info.main',
  },
} as IStatusOptions;
