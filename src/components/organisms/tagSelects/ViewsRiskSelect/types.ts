import { ISTagSelectProps } from 'components/molecules/STagSelect/types';
import { ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';

export interface IViewsRiskSelectProps extends Partial<ISTagSelectProps> {
  viewType: ViewTypeEnum;
}
