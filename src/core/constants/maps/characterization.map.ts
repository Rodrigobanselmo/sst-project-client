import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

export interface ICharacterizationType {
  value: CharacterizationTypeEnum;
  name: string;
  description: string;
  type: string;
}
export interface ICharacterizationMap
  extends Record<CharacterizationTypeEnum, ICharacterizationType> {}

export const characterizationMap: ICharacterizationMap = {
  [CharacterizationTypeEnum.WORKSTATION]: {
    value: CharacterizationTypeEnum.WORKSTATION,
    name: 'Posto de Trabalho',
    type: '',
    description:
      'Use para caracterizar uma posição específica de trabalho, bancada, estação, posto fixo ou local onde uma função é executada de forma individualizada.',
  },
  [CharacterizationTypeEnum.ACTIVITIES]: {
    value: CharacterizationTypeEnum.ACTIVITIES,
    type: '',
    name: 'Atividade',
    description:
      'Use para caracterizar uma tarefa, processo de trabalho, rotina operacional ou conjunto de ações executadas pelos trabalhadores, independentemente de um único local físico.',
  },
  [CharacterizationTypeEnum.EQUIPMENT]: {
    value: CharacterizationTypeEnum.EQUIPMENT,
    type: '',
    name: 'Equipamento',
    description:
      'Use para caracterizar máquinas, equipamentos, veículos, ferramentas, plataformas, sondas ou outros recursos técnicos relevantes para a exposição ocupacional.',
  },
  [CharacterizationTypeEnum.ADMINISTRATIVE]: {
    value: CharacterizationTypeEnum.ADMINISTRATIVE,
    type: '',
    name: 'Ambiente Administrativo',
    description:
      'Use para áreas administrativas, escritórios, salas de apoio administrativo, recepção, áreas de gestão ou espaços de trabalho predominantemente administrativos.',
  },
  [CharacterizationTypeEnum.OPERATION]: {
    value: CharacterizationTypeEnum.OPERATION,
    type: '',
    name: 'Ambiente Operacional',
    description:
      'Use para áreas produtivas, industriais, operacionais, frentes de serviço, áreas de processo, manutenção, armazenamento, circulação operacional ou execução de atividades técnicas.',
  },
  [CharacterizationTypeEnum.SUPPORT]: {
    value: CharacterizationTypeEnum.SUPPORT,
    type: '',
    name: 'Ambiente de Apoio',
    description:
      'Use para áreas de suporte à operação ou aos trabalhadores, como vestiários, refeitórios, almoxarifados, áreas de convivência, sanitários, depósitos, salas de apoio ou estruturas auxiliares.',
  },
  [CharacterizationTypeEnum.GENERAL]: {
    value: CharacterizationTypeEnum.GENERAL,
    type: '',
    name: 'Visão Geral',
    description:
      'Use para uma descrição ampla do estabelecimento, unidade, operação, frente de trabalho, plataforma, sonda ou contexto geral da caracterização. No documento, este item compõe a seção de ambientes.',
  },
};

export const CHARACTERIZATION_TYPE_HELP_TEXT =
  'Escolha o tipo que melhor representa o elemento caracterizado. Esses tipos organizam a caracterização do PGR e influenciam a forma como as informações são apresentadas nos documentos.';
