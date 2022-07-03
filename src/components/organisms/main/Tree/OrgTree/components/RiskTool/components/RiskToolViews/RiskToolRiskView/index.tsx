import React, { FC } from 'react';

import { ViewsDataEnum } from '../../../utils/view-data-type.constant';
import { RiskToolRiskGhoView } from './Gho';
import { RiskToolRiskHierarchyView } from './Hierarchy';
import { RiskToolRiskViewProps } from './types';

export const RiskToolRiskView: FC<RiskToolRiskViewProps> = (props) => {
  if (props.viewDataType === ViewsDataEnum.HIERARCHY)
    return <RiskToolRiskHierarchyView {...props} />;

  return <RiskToolRiskGhoView {...props} />;
};
