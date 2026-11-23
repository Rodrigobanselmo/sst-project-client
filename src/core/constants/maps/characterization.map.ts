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
      'Use para caracterizar um ponto específico do espaço físico ocupado pelo trabalhador, como uma bancada, estação de computador ou posto de operação de máquina, incluindo sua disposição e condições de uso.',
  },
  [CharacterizationTypeEnum.ACTIVITIES]: {
    value: CharacterizationTypeEnum.ACTIVITIES,
    type: '',
    name: 'Atividade',
    description:
      'Use para caracterizar o trabalho realizado, como varrição de ruas, coleta de resíduos ou manutenção de equipamentos, que pode ocorrer em um ou mais ambientes.',
  },
  [CharacterizationTypeEnum.EQUIPMENT]: {
    value: CharacterizationTypeEnum.EQUIPMENT,
    type: '',
    name: 'Equipamento',
    description:
      'Use para caracterizar o recurso técnico utilizado no trabalho, como máquina, veículo, ferramenta, plataforma ou sonda, descrevendo suas características, componentes e condições de uso.',
  },
  [CharacterizationTypeEnum.ADMINISTRATIVE]: {
    value: CharacterizationTypeEnum.ADMINISTRATIVE,
    type: '',
    name: 'Ambiente Administrativo',
    description:
      'Use para caracterizar o espaço físico destinado ao trabalho administrativo, como escritórios, salas de reunião ou recepção, descrevendo sua disposição, instalações e condições ambientais.',
  },
  [CharacterizationTypeEnum.OPERATION]: {
    value: CharacterizationTypeEnum.OPERATION,
    type: '',
    name: 'Ambiente Operacional',
    description:
      'Use para caracterizar o espaço físico onde o trabalho é realizado, como galpões, oficinas, áreas de produção, armazenamento ou circulação, descrevendo sua disposição, instalações e condições ambientais.',
  },
  [CharacterizationTypeEnum.SUPPORT]: {
    value: CharacterizationTypeEnum.SUPPORT,
    type: '',
    name: 'Ambiente de Apoio',
    description:
      'Use para caracterizar o espaço físico de suporte aos trabalhadores ou à operação, como vestiários, refeitórios, sanitários, áreas de convivência ou salas de apoio, descrevendo suas instalações e condições de uso.',
  },
  [CharacterizationTypeEnum.GENERAL]: {
    value: CharacterizationTypeEnum.GENERAL,
    type: '',
    name: 'Visão Geral',
    description:
      'Use para apresentar o conjunto do estabelecimento ou unidade, sua finalidade, localização, organização dos espaços e infraestrutura geral. No documento, este item compõe a seção de ambientes.',
  },
};

export const CHARACTERIZATION_TYPE_HELP_TEXT =
  'Escolha conforme o objeto da descrição: o conjunto do estabelecimento (Visão Geral), um espaço físico (Ambiente), um ponto específico desse espaço (Posto de Trabalho), o trabalho realizado (Atividade) ou um recurso técnico (Equipamento). Esses tipos organizam a caracterização do PGR e sua apresentação nos documentos.';
