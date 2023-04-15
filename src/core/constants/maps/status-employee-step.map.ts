import { StatusEmployeeStepEnum } from 'project/enum/statusEmployeeStep.enum';

export interface IStatusEmployeeStepOption {
  value: StatusEmployeeStepEnum;
  name: string;
  color: string;
}
export interface IStatusEmployeeStepOptions
  extends Record<StatusEmployeeStepEnum, IStatusEmployeeStepOption> {}

export const statusEmployeeStepMap = {
  [StatusEmployeeStepEnum.ADMISSION]: {
    value: StatusEmployeeStepEnum.ADMISSION,
    name: 'Ativo',
    color: 'success.main',
  },
  [StatusEmployeeStepEnum.IN_ADMISSION]: {
    value: StatusEmployeeStepEnum.IN_ADMISSION,
    name: 'Em admissão',
    color: 'info.main',
  },
  [StatusEmployeeStepEnum.DEMISSION]: {
    value: StatusEmployeeStepEnum.DEMISSION,
    name: 'Demitido',
    color: 'error.main',
  },
  [StatusEmployeeStepEnum.IN_DEMISSION]: {
    value: StatusEmployeeStepEnum.IN_DEMISSION,
    name: 'Em demissão',
    color: 'error.main',
  },
  [StatusEmployeeStepEnum.IN_TRANS]: {
    value: StatusEmployeeStepEnum.IN_TRANS,
    name: 'Em Transferência',
    color: 'success.main',
  },
} as IStatusEmployeeStepOptions;
