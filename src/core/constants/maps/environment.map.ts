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
      'Nos ambientes administrativos são executadas atividades diversas sem relação direta com o processo produtivo e pouco relacionadas com riscos físicos, químicos e biológicos, mas é possível encontrar alguns fatores de riscos ergonômicos e até mesmo de acidentes, no entanto de baixa severidade.',
  },
  [EnvironmentTypeEnum.OPERATION]: {
    value: EnvironmentTypeEnum.OPERATION,
    name: 'Operacional',
    description:
      'Nos ambientes operacionais são executadas atividades que resultam no produto ou serviço fim da empresa, ou seja, onde ocorre o processo produtivo, normalmente são os ambientes de maior concentração de Fatores de Riscos e Perigos envolvendo quase sempre exposições primárias e secundárias.',
  },
  [EnvironmentTypeEnum.SUPPORT]: {
    value: EnvironmentTypeEnum.SUPPORT,
    name: 'Apoio',
    description:
      'Nos ambientes de apoio são executadas atividades que dão suporte às atividades operacionais da empresa, normalmente envolvem Fatores de Riscos e Perigos característicos ao que é executado nos seus posto de trabalho gerando exposições primárias, são exemplos os seguintes ambientes: Oficinas diversa, laboratórios, estações de tratamento (efluentes), pátios de resíduos, etc.',
  },
  [EnvironmentTypeEnum.GENERAL]: {
    value: EnvironmentTypeEnum.GENERAL,
    name: 'Visão Geral',
    description:
      'Nos ambientes considerados gerais são aqueles que não possuem uma destinação específica e certamente são isentos de riscos próprios, envolve áreas comuns de circulação e normalmente sem restrição de acesso ao público, tais como: Fachada da empresa, Roll de entrada, ambientes de espera, pátios, áreas de recreação, etc.',
  },
};
