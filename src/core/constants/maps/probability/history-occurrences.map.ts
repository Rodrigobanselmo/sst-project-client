import { SeverityEnum } from 'project/enum/severity.enums';

export interface IHistoryOccurrencesOption {
  value: SeverityEnum;
  name: string;
}
interface IHistoryOccurrencesOptions
  extends Record<SeverityEnum, IHistoryOccurrencesOption> {}

export const historyOccurrencesMap = {
  [SeverityEnum.LOW]: {
    value: SeverityEnum.LOW,
    name: 'Sem Registro de Ocorrências',
  },
  [SeverityEnum.MEDIUM_LOW]: {
    value: SeverityEnum.MEDIUM_LOW,
    name: 'Ocorre a cada 10 anos',
  },
  [SeverityEnum.MEDIUM]: {
    value: SeverityEnum.MEDIUM,
    name: 'Ocorre a cada 5 anos',
  },
  [SeverityEnum.MEDIUM_HIGH]: {
    value: SeverityEnum.MEDIUM_HIGH,
    name: 'Ocorre a cada dois anos',
  },
  [SeverityEnum.HIGH]: {
    value: SeverityEnum.HIGH,
    name: 'Pelo menos uma ocorrência anual',
  },
} as IHistoryOccurrencesOptions;
