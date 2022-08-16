import { ViewsRiskEnum } from 'core/enums/views-risk.enum';

export interface IViewsRiskOption {
  value: ViewsRiskEnum;
  name: string;
}
interface IViewsRiskOptions extends Record<ViewsRiskEnum, IViewsRiskOption> {}

export const viewsRiskOptionsConstant: IViewsRiskOptions = {
  [ViewsRiskEnum.SIMPLE_BY_RISK]: {
    value: ViewsRiskEnum.SIMPLE_BY_RISK,
    name: 'Visualização por risco',
  },
  [ViewsRiskEnum.SIMPLE_BY_GROUP]: {
    value: ViewsRiskEnum.SIMPLE_BY_GROUP,
    name: 'Visualização básica',
  },
  [ViewsRiskEnum.MULTIPLE]: {
    value: ViewsRiskEnum.MULTIPLE,
    name: 'Visualização avançada',
  },
};
