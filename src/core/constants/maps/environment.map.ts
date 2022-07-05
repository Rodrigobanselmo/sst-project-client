import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

export interface IEnvironmentType {
  value: EnvironmentTypeEnum;
  name: string;
  description: string;
}
interface IEnvironmentMap
  extends Record<EnvironmentTypeEnum, IEnvironmentType> {}

export const environmentMap: IEnvironmentMap = {
  [EnvironmentTypeEnum.ADMINISTRATIVE]: {
    value: EnvironmentTypeEnum.ADMINISTRATIVE,
    name: 'Administrativo',
    description:
      'Nos ambientes administrativos são executadas atividades diversas pouco relacionadas com riscos físicos, químicos e biológicos.',
  },
  [EnvironmentTypeEnum.OPERATION]: {
    value: EnvironmentTypeEnum.OPERATION,
    name: 'Operacional',
    description: 'Ambientes Operacionais',
  },
  [EnvironmentTypeEnum.SUPPORT]: {
    value: EnvironmentTypeEnum.SUPPORT,
    name: 'Apoio',
    description: 'Ambientes de Apoio',
  },
  [EnvironmentTypeEnum.GENERAL]: {
    value: EnvironmentTypeEnum.GENERAL,
    name: 'Visão Geral',
    description:
      'Visão geral da empresa, setores, etc. (Exemplo: fachada ou planta baixa da empresa)',
  },
};
