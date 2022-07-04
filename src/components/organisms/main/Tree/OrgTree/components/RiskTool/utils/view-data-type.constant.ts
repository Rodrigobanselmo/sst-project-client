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
  placeholder: string;
}

interface IViewsDataOptions extends Record<ViewsDataEnum, IViewsDataOption> {}

export const viewsDataOptionsConstant: IViewsDataOptions = {
  [ViewsDataEnum.HIERARCHY]: {
    value: ViewsDataEnum.HIERARCHY,
    name: 'por cargos, setores...',
    placeholder: 'pesquisar por cargos, seto...',
  },
  [ViewsDataEnum.ENVIRONMENT]: {
    value: ViewsDataEnum.ENVIRONMENT,
    name: 'por ambientes de trabalho',
    placeholder: 'pesquisar por ambientes...',
  },
  [ViewsDataEnum.CHARACTERIZATION]: {
    value: ViewsDataEnum.CHARACTERIZATION,
    name: 'pela mão de obra',
    placeholder: 'pesquisar por mão de obra...',
  },
  [ViewsDataEnum.EMPLOYEE]: {
    value: ViewsDataEnum.EMPLOYEE,
    name: 'por empregados',
    placeholder: 'pesquisar por ...',
  },
  [ViewsDataEnum.GSE]: {
    value: ViewsDataEnum.GSE,
    name: "por GSE's",
    placeholder: 'pesquisar por GSE...',
  },
};
