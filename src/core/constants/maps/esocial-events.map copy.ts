import { EmployeeESocialEventActionEnum } from 'project/enum/esocial-event-action.enum';

export interface IESocialEventAction {
  value: EmployeeESocialEventActionEnum;
  label: string;
  name: string;
}
interface IESocialEvents
  extends Record<EmployeeESocialEventActionEnum, IESocialEventAction> {}

export const eSocialEventActionMap = {
  [EmployeeESocialEventActionEnum.EXCLUDE]: {
    value: EmployeeESocialEventActionEnum.EXCLUDE,
    label: 'Exclusão',
    name: 'Exclusão',
  },
  [EmployeeESocialEventActionEnum.MODIFY]: {
    value: EmployeeESocialEventActionEnum.MODIFY,
    label: 'Retificado',
    name: 'Retificado',
  },
  [EmployeeESocialEventActionEnum.SEND]: {
    value: EmployeeESocialEventActionEnum.SEND,
    label: 'Envio',
    name: 'Envio',
  },
} as IESocialEvents;
