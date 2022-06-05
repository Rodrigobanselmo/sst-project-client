import { SeverityEnum } from 'project/enum/severity.enums';

export interface IChanceOfContactOption {
  value: SeverityEnum;
  name: string;
}
interface IChanceOfContactOptions
  extends Record<SeverityEnum, IChanceOfContactOption> {}

export const chanceOfContactMap = {
  [SeverityEnum.LOW]: {
    value: SeverityEnum.LOW,
    name: 'Improvável',
  },
  [SeverityEnum.MEDIUM_LOW]: {
    value: SeverityEnum.MEDIUM_LOW,
    name: 'Rara',
  },
  [SeverityEnum.MEDIUM]: {
    value: SeverityEnum.MEDIUM,
    name: 'Possível',
  },
  [SeverityEnum.MEDIUM_HIGH]: {
    value: SeverityEnum.MEDIUM_HIGH,
    name: 'Provável',
  },
  [SeverityEnum.HIGH]: {
    value: SeverityEnum.HIGH,
    name: 'Certa',
  },
} as IChanceOfContactOptions;
