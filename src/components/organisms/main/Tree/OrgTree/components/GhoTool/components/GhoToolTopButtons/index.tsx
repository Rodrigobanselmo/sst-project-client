/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import { useRouter } from 'next/router';
import { setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';

import { GhoToolTopProps } from './types';

export const GhoToolTopButtons: FC<GhoToolTopProps> = ({ handleSelectGHO }) => {
  const dispatch = useAppDispatch();
  const { asPath, push } = useRouter();

  const handleCloseRisk = () => {
    push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
  };

  return (
    <SFlex align="center" gap="1" mb={2}>
      <SIconButton onClick={handleCloseRisk} size="small">
        <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
      </SIconButton>
      <SText fontSize="0.9rem" color="GrayText">
        Grupo similar de exposição
      </SText>
    </SFlex>
  );
};
