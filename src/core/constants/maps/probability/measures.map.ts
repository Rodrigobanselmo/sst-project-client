import { SeverityEnum } from 'project/enum/severity.enums';

export interface IMeasuresOption {
  value: SeverityEnum;
  name: string;
}
interface IMeasuresOptions extends Record<SeverityEnum, IMeasuresOption> {}

export const measuresMap = {
  [SeverityEnum.LOW]: {
    value: SeverityEnum.LOW,
    name: 'EPC + ADM + EPI \n + Treinamentos',
  },
  [SeverityEnum.MEDIUM_LOW]: {
    value: SeverityEnum.MEDIUM_LOW,
    name: 'EPC + ADM \n + Treinamentos',
  },
  [SeverityEnum.MEDIUM]: {
    value: SeverityEnum.MEDIUM,
    name: 'EPC + EPI \n + Treinamentos',
  },
  [SeverityEnum.MEDIUM_HIGH]: {
    value: SeverityEnum.MEDIUM_HIGH,
    name: 'EPI + Treinamentos',
  },
  [SeverityEnum.HIGH]: {
    value: SeverityEnum.HIGH,
    name: 'Sem Medidas de Prevenção',
  },
} as IMeasuresOptions;
