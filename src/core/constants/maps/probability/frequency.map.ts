import { SeverityEnum } from 'project/enum/severity.enums';

export interface IFrequencyOption {
  value: SeverityEnum;
  name: string;
}
interface IFrequencyOptions extends Record<SeverityEnum, IFrequencyOption> {}

export const frequencyMap = {
  [SeverityEnum.LOW]: {
    value: SeverityEnum.LOW,
    name: 'Rara (> 15 dias)',
  },
  [SeverityEnum.MEDIUM_LOW]: {
    value: SeverityEnum.MEDIUM_LOW,
    name: 'Exporádica (Quizenal)',
  },
  [SeverityEnum.MEDIUM]: {
    value: SeverityEnum.MEDIUM,
    name: 'Ocasional \n (1 ou 2 /Semana)',
  },
  [SeverityEnum.MEDIUM_HIGH]: {
    value: SeverityEnum.MEDIUM_HIGH,
    name: 'Praticamente habitual (Quase todos os dias)',
  },
  [SeverityEnum.HIGH]: {
    value: SeverityEnum.HIGH,
    name: 'Habitual (Diária)',
  },
} as IFrequencyOptions;
