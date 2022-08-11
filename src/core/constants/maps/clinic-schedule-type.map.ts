import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';

export interface IClinicScheduleOption {
  value: ClinicScheduleTypeEnum;
  name: string;
}
interface IClinicScheduleOptions
  extends Record<ClinicScheduleTypeEnum, IClinicScheduleOption> {}

export const clinicScheduleMap = {
  [ClinicScheduleTypeEnum.PHONE]: {
    value: ClinicScheduleTypeEnum.PHONE,
    name: 'Telefone',
  },
  [ClinicScheduleTypeEnum.EMAIL]: {
    value: ClinicScheduleTypeEnum.EMAIL,
    name: 'Email',
  },
  [ClinicScheduleTypeEnum.ONLINE]: {
    value: ClinicScheduleTypeEnum.ONLINE,
    name: 'Online (Sistema)',
  },
  [ClinicScheduleTypeEnum.ASK]: {
    value: ClinicScheduleTypeEnum.ASK,
    name: 'Pedido de Agenda (Sistema)',
  },
  [ClinicScheduleTypeEnum.NONE]: {
    value: ClinicScheduleTypeEnum.NONE,
    name: 'Sem Agendamento',
  },
} as IClinicScheduleOptions;

export const clinicScheduleOptionsList = [
  clinicScheduleMap[ClinicScheduleTypeEnum.PHONE],
  clinicScheduleMap[ClinicScheduleTypeEnum.EMAIL],
  clinicScheduleMap[ClinicScheduleTypeEnum.ONLINE],
  clinicScheduleMap[ClinicScheduleTypeEnum.ASK],
  clinicScheduleMap[ClinicScheduleTypeEnum.NONE],
];
