import React, { FC } from 'react';

import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
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
      icon={CircleOutlinedIcon}
      iconProps={{
        sx: {
          color: statusOptionsConstant[selected].color,
          fontSize: '18px',
        },
      }}
      {...props}
    />
  );
};
