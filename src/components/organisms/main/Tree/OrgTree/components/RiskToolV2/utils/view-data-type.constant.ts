/* eslint-disable quotes */
export enum ViewsDataEnum {
  GSE = 'GSE',
  HIERARCHY = 'SIMPLE_BY_GROUP',
  EMPLOYEE = 'EMPLOYEE',
  ENVIRONMENT = 'CHARACTERIZATION', // Merged with WORKSTATION
  CHARACTERIZATION = 'CHARACTERIZATION',
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
  [ViewsDataEnum.CHARACTERIZATION]: {
    value: ViewsDataEnum.CHARACTERIZATION,
    name: 'por ambientes e atividades',
    short: 'Ambientes / Atividades',
    placeholder: 'pesquisar por ambientes e atividades...',
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
