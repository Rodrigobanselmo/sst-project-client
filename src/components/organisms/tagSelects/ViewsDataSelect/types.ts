import { ISTagSelectProps } from 'components/molecules/STagSelect/types';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

export interface IViewsRiskSelectProps extends Partial<ISTagSelectProps> {
  viewDataType: ViewsDataEnum;
}
