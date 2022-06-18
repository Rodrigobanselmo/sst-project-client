import { ViewsRiskEnum } from 'core/enums/views-risk.enum';

export interface IViewsRiskOption {
  value: ViewsRiskEnum;
  name: string;
}
interface IViewsRiskOptions extends Record<ViewsRiskEnum, IViewsRiskOption> {}

export const viewsRiskOptionsConstant: IViewsRiskOptions = {
  [ViewsRiskEnum.SIMPLE_BY_RISK]: {
    value: ViewsRiskEnum.SIMPLE_BY_RISK,
    name: 'Visalização por risco',
  },
  [ViewsRiskEnum.SIMPLE_BY_GROUP]: {
    value: ViewsRiskEnum.SIMPLE_BY_GROUP,
    name: 'Visalização por GSE',
  },
  [ViewsRiskEnum.MULTIPLE]: {
    value: ViewsRiskEnum.MULTIPLE,
    name: 'Visualização avançada',
  },
};
