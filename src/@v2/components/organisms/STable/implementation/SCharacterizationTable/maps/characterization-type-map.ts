import { CharacterizationTypeEnum } from '../../../../../../models/security/enums/characterization-type.enum';

type CharacterizationTypeMapValue = {
  rowLabel: string;
};

export const CharacterizationTypeMap: Record<
  CharacterizationTypeEnum,
  CharacterizationTypeMapValue
> = {
  [CharacterizationTypeEnum.GENERAL]: { rowLabel: 'Visão Geral' },
  [CharacterizationTypeEnum.SUPPORT]: { rowLabel: 'Ambiente de Apoio' },
  [CharacterizationTypeEnum.ADMINISTRATIVE]: {
    rowLabel: 'Ambiente Administrativo',
  },
  [CharacterizationTypeEnum.OPERATION]: { rowLabel: 'Ambiente Operacional' },
  [CharacterizationTypeEnum.ACTIVITIES]: { rowLabel: 'Atividade' },
  [CharacterizationTypeEnum.EQUIPMENT]: { rowLabel: 'Equipamento' },
  [CharacterizationTypeEnum.WORKSTATION]: { rowLabel: 'Posto de Trabalho' },
};
