import React, { FC } from 'react';

import GridViewIcon from '@mui/icons-material/GridView';
import { STagSelect } from 'components/molecules/STagSelect';

import { viewsRiskOptionsConstant } from 'core/constants/maps/views-risk-options.map';
import { ViewsRiskEnum } from 'core/enums/views-risk.enum';

import { IViewsRiskSelectProps } from './types';

export const ViewsRiskSelect: FC<IViewsRiskSelectProps> = ({ ...props }) => {
  return (
    <STagSelect
      options={[
        ViewsRiskEnum.SIMPLE_BY_GROUP,
        ViewsRiskEnum.SIMPLE_BY_RISK,
        ViewsRiskEnum.MULTIPLE,
      ].map((key) => ({
        ...viewsRiskOptionsConstant[key],
      }))}
      text={'Trocar View'}
      large
      icon={GridViewIcon}
      iconProps={{
        sx: {
          fontSize: '14px',
          color: 'info.main',
        },
      }}
      {...props}
    />
  );
};
