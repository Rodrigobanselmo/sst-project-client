import React, { FC } from 'react';

import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import { STagSelect } from 'components/molecules/STagSelect';

import { statusOptionsConstant } from 'core/constants/maps/status-options.constant';
import { dateToString } from 'core/utils/date/date-format';

import { IStatusSelectProps } from './types';

export const StatusSelect: FC<{ children?: any } & IStatusSelectProps> = ({
  selected,
  statusOptions,
  expiresDate,
  options = statusOptionsConstant as any,
  ...props
}) => {
  return (
    <STagSelect
      options={statusOptions.map((key) => ({
        ...options[key],
        iconColor: options[key]?.color,
      }))}
      tooltipTitle={
        selected
          ? expiresDate
            ? ` expiração: ${dateToString(expiresDate, 'DD/MM/YYYY HH:mm')}`
            : // : options[selected]?.name
              ''
          : ''
      }
      text={selected ? options[selected]?.name : ''}
      large
      icon={CircleTwoToneIcon}
      {...props}
      iconProps={{
        ...props.iconProps,
        sx: {
          color: selected ? options[selected]?.color : undefined,
          fontSize: '15px',
          ...props.iconProps?.sx,
        },
      }}
    />
  );
};
