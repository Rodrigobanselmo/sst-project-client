import React, { FC } from 'react';

import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import { STagSelect } from 'components/molecules/STagSelect';

import { statusOptionsConstant } from 'core/constants/maps/status-options.constant';
import { dateToString } from 'core/utils/date/date-format';

import { IStatusSelectProps } from './types';

export const StatusSelect: FC<IStatusSelectProps> = ({
  selected,
  statusOptions,
  expiresDate,
  ...props
}) => {
  return (
    <STagSelect
      options={statusOptions.map((key) => ({
        ...statusOptionsConstant[key],
        iconColor: statusOptionsConstant[key].color,
      }))}
      tooltipTitle={
        expiresDate
          ? ` expiração: ${dateToString(expiresDate, 'DD/MM/YYYY HH:mm')}`
          : statusOptionsConstant[selected].name
      }
      text={statusOptionsConstant[selected].name}
      large
      icon={CircleTwoToneIcon}
      iconProps={{
        sx: {
          color: statusOptionsConstant[selected].color,
          fontSize: '15px',
        },
      }}
      {...props}
    />
  );
};
