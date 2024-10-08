import React, { FC } from 'react';

import GridViewIcon from '@mui/icons-material/GridView';
import { STagSelect } from 'components/molecules/STagSelect';
import {
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

import { IViewsRiskSelectProps } from './types';

export const ViewsDataSelect: FC<
  { children?: any } & IViewsRiskSelectProps
> = ({ handleSelectMenu, viewDataType, ...props }) => {
  const selectedText = viewsDataOptionsConstant[viewDataType]?.name || '';

  const onSelect = (
    option: any,
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
  ) => {
    handleSelectMenu?.(option, e);
  };
  return (
    <STagSelect
      options={[
        ViewsDataEnum.HIERARCHY,
        ViewsDataEnum.ENVIRONMENT,
        ViewsDataEnum.CHARACTERIZATION,
        ViewsDataEnum.EMPLOYEE,
        ViewsDataEnum.GSE,
      ].map((key) => ({
        ...viewsDataOptionsConstant[key],
      }))}
      text={selectedText}
      large
      icon={GridViewIcon}
      handleSelectMenu={onSelect}
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
