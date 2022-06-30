/* eslint-disable quotes */
export enum ViewsDataEnum {
  GSE = 'GSE',
  HIERARCHY = 'SIMPLE_BY_GROUP',
  EMPLOYEE = 'EMPLOYEE',
  ENVIRONMENT = 'ENVIRONMENT',
  WORKSTATION = 'WORKSTATION',
}

export interface IViewsDataOption {
  value: ViewsDataEnum;
  name: string;
}

interface IViewsDataOptions extends Record<ViewsDataEnum, IViewsDataOption> {}

export const viewsDataOptionsConstant: IViewsDataOptions = {
  [ViewsDataEnum.HIERARCHY]: {
    value: ViewsDataEnum.HIERARCHY,
    name: 'por cargos, setores...',
  },
  [ViewsDataEnum.ENVIRONMENT]: {
    value: ViewsDataEnum.ENVIRONMENT,
    name: 'por ambientes de trabalho',
  },
  [ViewsDataEnum.WORKSTATION]: {
    value: ViewsDataEnum.WORKSTATION,
    name: 'por postos de trabalho',
  },
  [ViewsDataEnum.EMPLOYEE]: {
    value: ViewsDataEnum.EMPLOYEE,
    name: 'por empregados',
  },
  [ViewsDataEnum.GSE]: {
    value: ViewsDataEnum.GSE,
    name: "por GSE's",
  },
};
