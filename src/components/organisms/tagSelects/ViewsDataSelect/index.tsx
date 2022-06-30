import React, { FC } from 'react';

import GridViewIcon from '@mui/icons-material/GridView';
import { STagSelect } from 'components/molecules/STagSelect';
import {
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

import { IViewsRiskSelectProps } from './types';

export const ViewsDataSelect: FC<IViewsRiskSelectProps> = ({ ...props }) => {
  return (
    <STagSelect
      options={[
        ViewsDataEnum.HIERARCHY,
        ViewsDataEnum.ENVIRONMENT,
        ViewsDataEnum.WORKSTATION,
        ViewsDataEnum.EMPLOYEE,
        ViewsDataEnum.GSE,
      ].map((key) => ({
        ...viewsDataOptionsConstant[key],
      }))}
      text={'Trocar Seleção'}
      large
      icon={GridViewIcon}
      iconProps={{
        sx: {
          fontSize: '14px',
          color: 'warning.dark',
        },
      }}
      {...props}
    />
  );
};
