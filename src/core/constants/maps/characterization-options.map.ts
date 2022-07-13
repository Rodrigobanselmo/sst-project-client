import { CharacterizationEnum } from 'core/enums/characterization.enums';

export interface ICharacterizationOption {
  value: CharacterizationEnum;
  title: string;
  label: string;
  route: string;
}

interface ICharacterizationOptions
  extends Record<CharacterizationEnum, ICharacterizationOption> {}

export const characterizationOptionsConstant: ICharacterizationOptions = {
  [CharacterizationEnum.ENVIRONMENT]: {
    value: CharacterizationEnum.ENVIRONMENT,
    title: 'Ambientes de Trabalho',
    label: 'Ambientes de Trabalho',
    route: 'ambiente',
  },
  [CharacterizationEnum.ACTIVITIES]: {
    value: CharacterizationEnum.ACTIVITIES,
    title: 'Atividade',
    label: 'Atividade',
    route: 'atividades',
  },
  [CharacterizationEnum.LABOR]: {
    value: CharacterizationEnum.LABOR,
    title: 'Mão de obra',
    label: 'Mão de obra',
    route: 'mão-de-obra',
  },
  [CharacterizationEnum.EQUIPMENT]: {
    value: CharacterizationEnum.EQUIPMENT,
    title: 'Equipamentos',
    label: 'Equipamentos',
    route: 'equipamentos',
  },
  [CharacterizationEnum.WORKSTATION]: {
    value: CharacterizationEnum.WORKSTATION,
    title: 'Posto de Trabalho',
    label: 'Posto de Trabalho',
    route: 'posto-de-trabalho',
  },
};

export const characterizationOptionsList = [
  characterizationOptionsConstant[CharacterizationEnum.ENVIRONMENT],
  characterizationOptionsConstant[CharacterizationEnum.LABOR],
];
