/* eslint-disable quotes */
export enum ViewsDataEnum {
  GSE = 'GSE',
  HIERARCHY = 'SIMPLE_BY_GROUP',
  EMPLOYEE = 'EMPLOYEE',
  ENVIRONMENT = 'ENVIRONMENT',
  CHARACTERIZATION = 'WORKSTATION',
}

export interface IViewsDataOption {
  value: ViewsDataEnum;
  name: string;
  short: string;
  placeholder: string;
}

interface IViewsDataOptions extends Record<ViewsDataEnum, IViewsDataOption> {}

export const viewsDataOptionsConstant: IViewsDataOptions = {
  [ViewsDataEnum.HIERARCHY]: {
    value: ViewsDataEnum.HIERARCHY,
    name: 'por cargos, setores...',
    short: 'Cargo',
    placeholder: 'pesquisar por cargos, seto...',
  },
  [ViewsDataEnum.ENVIRONMENT]: {
    value: ViewsDataEnum.ENVIRONMENT,
    name: 'por ambientes de trabalho',
    short: 'Ambiente',
    placeholder: 'pesquisar por ambientes...',
  },
  [ViewsDataEnum.CHARACTERIZATION]: {
    value: ViewsDataEnum.CHARACTERIZATION,
    name: 'pela mão de obra',
    short: 'Posto de trabalho / atividade',
    placeholder: 'pesquisar por mão de obra...',
  },
  [ViewsDataEnum.EMPLOYEE]: {
    value: ViewsDataEnum.EMPLOYEE,
    name: 'por funcionário',
    short: 'Funcionário',
    placeholder: 'pesquisar por ...',
  },
  [ViewsDataEnum.GSE]: {
    value: ViewsDataEnum.GSE,
    name: "por GSE's",
    short: 'GSE',
    placeholder: 'pesquisar por GSE...',
  },
};
