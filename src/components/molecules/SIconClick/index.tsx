import { FC } from 'react';
import { RiCloseFill } from 'react-icons/ri';

import { Icon } from '@mui/material';

import SIconButton from '../../atoms/SIconButton';
import { SIconClickProps } from './types';

export const SIconClick: FC<{ children?: any } & SIconClickProps> = ({
  ...props
}) => {
  return (
    <SIconButton {...props}>
      <Icon component={RiCloseFill} />
    </SIconButton>
  );
};
