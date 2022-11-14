import { StatusEnum } from 'project/enum/status.enum';

export interface IStatusOption {
  value: StatusEnum;
  name: string;
  color: string;
}
export interface IStatusOptions extends Record<StatusEnum, IStatusOption> {}

export const statusOptionsConstant = {
  [StatusEnum.ACTIVE]: {
    value: StatusEnum.ACTIVE,
    name: 'Ativo',
    color: 'success.main',
  },
  [StatusEnum.DONE]: {
    value: StatusEnum.DONE,
    name: 'Finalizado',
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
  [StatusEnum.ERROR]: {
    value: StatusEnum.ERROR,
    name: 'Erro',
    color: 'error.main',
  },
  [StatusEnum.EXPIRED]: {
    value: StatusEnum.EXPIRED,
    name: 'Expirado',
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
  [StatusEnum.PROCESSING]: {
    value: StatusEnum.PROCESSING,
    name: 'Processando',
    color: 'warning.main',
  },
  [StatusEnum.INVALID]: {
    value: StatusEnum.INVALID,
    name: 'inválido',
    color: 'error.main',
  },
} as IStatusOptions;

export const statusOptionsConstantExam = {
  [StatusEnum.DONE]: {
    value: StatusEnum.DONE,
    name: 'Realizado',
    color: 'success.main',
  },
  [StatusEnum.CANCELED]: {
    value: StatusEnum.CANCELED,
    name: 'Cancelado',
    color: 'error.main',
  },
  [StatusEnum.ERROR]: {
    value: StatusEnum.ERROR,
    name: 'Erro',
    color: 'error.main',
  },
  [StatusEnum.EXPIRED]: {
    value: StatusEnum.EXPIRED,
    name: 'Expirado',
    color: 'error.main',
  },
  [StatusEnum.PENDING]: {
    value: StatusEnum.PENDING,
    name: 'Pedido de Agenda',
    color: 'warning.main',
  },
  [StatusEnum.PROCESSING]: {
    value: StatusEnum.PROCESSING,
    name: 'Agendado',
    color: 'warning.main',
  },
  [StatusEnum.INACTIVE]: {
    value: StatusEnum.INACTIVE,
    name: 'Faltou',
    color: 'error.main',
  },
} as IStatusOptions;

export const statusOptionsConstantESocial = {
  [StatusEnum.DONE]: {
    value: StatusEnum.DONE,
    name: 'Transmitido',
    color: 'success.main',
  },
  [StatusEnum.INVALID]: {
    value: StatusEnum.INVALID,
    name: 'Rejeitado',
    color: 'error.main',
  },
  [StatusEnum.ERROR]: {
    value: StatusEnum.ERROR,
    name: 'Erro',
    color: 'error.main',
  },
  [StatusEnum.PROCESSING]: {
    value: StatusEnum.PROCESSING,
    name: 'Processando',
    color: 'warning.main',
  },
  [StatusEnum.TRANSMITTED]: {
    value: StatusEnum.TRANSMITTED,
    name: 'Gerado',
    color: 'grey.500',
  },
  [StatusEnum.MODIFIED]: {
    value: StatusEnum.MODIFIED,
    name: 'A retificar',
    color: 'info.main',
  },
  [StatusEnum.CANCELED]: {
    value: StatusEnum.CANCELED,
    name: 'A excluir',
    color: 'info.main',
  },
} as IStatusOptions;
