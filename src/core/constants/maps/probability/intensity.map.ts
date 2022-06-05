import { SeverityEnum } from 'project/enum/severity.enums';

export interface IHistoryOccurrencesOption {
  value: SeverityEnum;
  name: string;
}
interface IHistoryOccurrencesOptions
  extends Record<SeverityEnum, IHistoryOccurrencesOption> {}

export const intensityMap = {
  [SeverityEnum.LOW]: {
    value: SeverityEnum.LOW,
    name: 'Muito baixa',
  },
  [SeverityEnum.MEDIUM_LOW]: {
    value: SeverityEnum.MEDIUM_LOW,
    name: 'Baixa',
  },
  [SeverityEnum.MEDIUM]: {
    value: SeverityEnum.MEDIUM,
    name: 'Moderada',
  },
  [SeverityEnum.MEDIUM_HIGH]: {
    value: SeverityEnum.MEDIUM_HIGH,
    name: 'Alta',
  },
  [SeverityEnum.HIGH]: {
    value: SeverityEnum.HIGH,
    name: 'Muito alta',
  },
} as IHistoryOccurrencesOptions;
