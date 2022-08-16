export enum ViewTypeEnum {
  SIMPLE_BY_RISK = 'SIMPLE_BY_RISK',
  SIMPLE_BY_GROUP = 'SIMPLE_BY_GROUP',
  MULTIPLE = 'MULTIPLE',
}

export interface IViewsRiskOption {
  value: ViewTypeEnum;
  name: string;
}

interface IViewsRiskOptions extends Record<ViewTypeEnum, IViewsRiskOption> {}

export const viewsRiskOptionsConstant: IViewsRiskOptions = {
  [ViewTypeEnum.SIMPLE_BY_RISK]: {
    value: ViewTypeEnum.SIMPLE_BY_RISK,
    name: 'Visualização por risco',
  },
  [ViewTypeEnum.SIMPLE_BY_GROUP]: {
    value: ViewTypeEnum.SIMPLE_BY_GROUP,
    name: 'Visualização por GSE',
  },
  [ViewTypeEnum.MULTIPLE]: {
    value: ViewTypeEnum.MULTIPLE,
    name: 'Visualização avançada',
  },
};
