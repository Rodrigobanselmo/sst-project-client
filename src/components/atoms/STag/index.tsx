import React, { FC } from 'react';

import SFlex from '../SFlex';
import SText from '../SText';
import { ISTagProps } from './types';

export const STag: FC<{ children?: any } & ISTagProps> = ({
  text,
  action,
  icon: Icon,
  sx,
  ...props
}) => {
  if (action === 'none') return null;

  const color = () => {
    switch (action) {
      case '1':
        return 'scale.low';
      case '2':
        return 'scale.mediumLow';
      case '3':
        return 'scale.medium';
      case '4':
        return 'scale.mediumHigh';
      case '5':
        return 'scale.high';
      case '6':
        return 'common.black';
      case 'add':
        return 'tag.add';
      case 'main':
        return 'primary.main';
      case 'edit':
        return 'tag.edit';
      case 'delete':
        return 'tag.delete';
      case 'success':
        return 'success.dark';
      case 'warning':
        return 'warning.main';
      case 'info':
        return 'info.main';
      case 'error':
        return 'error.main';
      case 'upload':
        return 'info.main';

      default:
        return 'grey.100';
    }
  };

  return (
    <SFlex
      sx={{
        backgroundColor: color(),
        borderRadius: '3px',
        pr: 8,
        pl: 8,
        mr: 2,
        boxShadow: '0px 1px 1px 0px rgb(0 0 0 / 5%)',
        ...sx,
      }}
      center
      {...props}
    >
      <SText
        sx={{
          color: color() !== 'grey.100' ? 'common.white' : 'text.main',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        {text}
      </SText>
      {Icon && <Icon sx={{ fontSize: '18px', color: 'common.white' }} />}
    </SFlex>
  );
};
