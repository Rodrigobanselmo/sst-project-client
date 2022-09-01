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
  options = statusOptionsConstant,
  ...props
}) => {
  return (
    <STagSelect
      options={statusOptions.map((key) => ({
        ...options[key],
        iconColor: options[key].color,
      }))}
      tooltipTitle={
        selected
          ? expiresDate
            ? ` expiração: ${dateToString(expiresDate, 'DD/MM/YYYY HH:mm')}`
            : options[selected].name
          : ''
      }
      text={selected ? options[selected].name : ''}
      large
      icon={CircleTwoToneIcon}
      iconProps={{
        sx: {
          color: selected ? options[selected].color : undefined,
          fontSize: '15px',
        },
      }}
      {...props}
    />
  );
};
