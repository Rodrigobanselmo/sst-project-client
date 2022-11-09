import { EmployeeESocialEventTypeEnum } from 'project/enum/esocial-event-type.enum';

export interface IESocialEvent {
  value: EmployeeESocialEventTypeEnum;
  label: string;
  name: string;
}
interface IESocialEvents
  extends Record<EmployeeESocialEventTypeEnum, IESocialEvent> {}

export const eSocialEventMap = {
  [EmployeeESocialEventTypeEnum.EXAM_2220]: {
    value: EmployeeESocialEventTypeEnum.EXAM_2220,
    label: '2220//(Monitoramento)',
    name: 'S-2220',
  },
  [EmployeeESocialEventTypeEnum.CAT_2210]: {
    value: EmployeeESocialEventTypeEnum.CAT_2210,
    label: '2210//(CAT)',
    name: 'S-2210',
  },
  [EmployeeESocialEventTypeEnum.RISK_2240]: {
    value: EmployeeESocialEventTypeEnum.RISK_2240,
    label: '2240//(Ag. Nocivos)',
    name: 'S-2240',
  },
} as IESocialEvents;

export const esocialEventOptionsList = [
  eSocialEventMap[EmployeeESocialEventTypeEnum.CAT_2210],
  eSocialEventMap[EmployeeESocialEventTypeEnum.EXAM_2220],
  eSocialEventMap[EmployeeESocialEventTypeEnum.RISK_2240],
];
