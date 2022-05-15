import React, { FC } from 'react';

import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import { STagSelect } from 'components/molecules/STagSelect';

import { statusOptionsConstant } from 'core/constants/status-options.constant';

import { IStatusSelectProps } from './types';
export const StatusSelect: FC<IStatusSelectProps> = ({
  selected,
  statusOptions,
  ...props
}) => {
  return (
    <STagSelect
      options={statusOptions.map((key) => ({
        ...statusOptionsConstant[key],
        iconColor: statusOptionsConstant[key].color,
      }))}
      text={statusOptionsConstant[selected].name}
      large
      icon={CircleTwoToneIcon}
      iconProps={{
        sx: {
          color: statusOptionsConstant[selected].color,
          fontSize: '14px',
        },
      }}
      {...props}
    />
  );
};
