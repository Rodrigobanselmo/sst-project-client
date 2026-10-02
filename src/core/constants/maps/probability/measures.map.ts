import { SeverityEnum } from 'project/enum/severity.enums';

export interface IMeasuresOption {
  value: SeverityEnum;
  name: string;
}
interface IMeasuresOptions extends Record<SeverityEnum, IMeasuresOption> {}

export const measuresMap = {
  [SeverityEnum.LOW]: {
    value: SeverityEnum.LOW,
    name: 'EPC + ADM + EPI',
  },
  [SeverityEnum.MEDIUM_LOW]: {
    value: SeverityEnum.MEDIUM_LOW,
    name: 'EPC + ADM',
  },
  [SeverityEnum.MEDIUM]: {
    value: SeverityEnum.MEDIUM,
    name: 'EPC + EPI ou ADM + EPI',
  },
  [SeverityEnum.MEDIUM_HIGH]: {
    value: SeverityEnum.MEDIUM_HIGH,
    name: 'Apenas uma medida de controle: EPC, ADM ou EPI',
  },
  [SeverityEnum.HIGH]: {
    value: SeverityEnum.HIGH,
    name: 'Sem Medidas de Prevenção',
  },
} as IMeasuresOptions;
