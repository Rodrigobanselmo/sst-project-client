import { FC } from 'react';

import { Icon } from '@mui/material';
import { RiCloseFill } from '@react-icons/all-files/ri/RiCloseFill';

import SIconButton from '../../atoms/SIconButton';
import { SIconClickProps } from './types';

export const SIconClick: FC<SIconClickProps> = ({ ...props }) => {
  return (
    <SIconButton {...props}>
      <Icon component={RiCloseFill} />
    </SIconButton>
  );
};
