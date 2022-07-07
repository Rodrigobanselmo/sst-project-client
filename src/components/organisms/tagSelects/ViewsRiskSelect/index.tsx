import React, { FC, useState } from 'react';

import GridViewIcon from '@mui/icons-material/GridView';
import { STagSelect } from 'components/molecules/STagSelect';

import { viewsRiskOptionsConstant } from 'core/constants/maps/views-risk-options.map';
import { ViewsRiskEnum } from 'core/enums/views-risk.enum';

import { IViewsRiskSelectProps } from './types';

export const ViewsRiskSelect: FC<IViewsRiskSelectProps> = ({
  handleSelectMenu,
  viewType,
  ...props
}) => {
  const [selectedText, setSelectedText] = useState(
    viewsRiskOptionsConstant[viewType]?.name || '',
  );

  const onSelect = (
    option: any,
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
  ) => {
    setSelectedText(option.name);
    handleSelectMenu?.(option, e);
  };

  return (
    <STagSelect
      options={[
        ViewsRiskEnum.SIMPLE_BY_GROUP,
        ViewsRiskEnum.SIMPLE_BY_RISK,
        ViewsRiskEnum.MULTIPLE,
      ].map((key) => ({
        ...viewsRiskOptionsConstant[key],
      }))}
      text={selectedText}
      large
      handleSelectMenu={onSelect}
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
