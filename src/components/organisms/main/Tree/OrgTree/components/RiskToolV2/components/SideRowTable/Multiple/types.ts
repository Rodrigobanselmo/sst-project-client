import { ViewsDataEnum } from '../../../utils/view-data-type.constant';

export interface SideTableMultipleProps {
  viewDataType: ViewsDataEnum;
  riskGroupId: string;
  isRepresentAll?: boolean;
}
