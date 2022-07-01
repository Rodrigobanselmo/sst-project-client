import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

export interface ICharacterizationType {
  value: CharacterizationTypeEnum;
  name: string;
  description: string;
}
interface ICharacterizationMap
  extends Record<CharacterizationTypeEnum, ICharacterizationType> {}

export const characterizationMap: ICharacterizationMap = {
  [CharacterizationTypeEnum.WORKSTATION]: {
    value: CharacterizationTypeEnum.WORKSTATION,
    name: 'Posto de trabalho',
    description:
      'Posto de trabalho (local onde o empregado passa toda a jornada de trabalho)',
  },
  [CharacterizationTypeEnum.ACTIVITIES]: {
    value: CharacterizationTypeEnum.ACTIVITIES,
    name: 'Atividades',
    description: 'Atividades com fatores de risco/perigo inerentes à ela',
  },
  [CharacterizationTypeEnum.EQUIPMENT]: {
    value: CharacterizationTypeEnum.EQUIPMENT,
    name: 'Equipamento',
    description: 'Equipamentos com fatores de risco/perigo inerentes à ele',
  },
};
