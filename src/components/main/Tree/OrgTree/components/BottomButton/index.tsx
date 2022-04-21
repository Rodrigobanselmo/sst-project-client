import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { selectGhoOpen, setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRiskAddInit,
  setRiskAddInit,
} from 'store/reducers/hierarchy/riskAddSlice';

import SGhoIcon from 'assets/icons/SGhoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { SFlexButton } from './styles';

export const BottomButton: FC = () => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const isRiskOpen = useAppSelector(selectRiskAddInit);

  return (
    <SFlex
      sx={{
        bottom: 20,
        right: 30,
        position: 'absolute',
      }}
    >
      <STooltip placement="top" title="Adicionar Fatores de Risco">
        <SFlexButton
          onClick={() => {
            if (!isGhoOpen) dispatch(setGhoOpen());
            dispatch(setRiskAddInit());
          }}
          active={isRiskOpen ? 1 : 0}
          gap={4}
          px={5}
          py={2}
          pr={6}
          center
        >
          <Icon sx={{ color: 'gray.500' }} component={SRiskFactorIcon} />
          <SText>Fatores de Risco</SText>
        </SFlexButton>
      </STooltip>
      <STooltip placement="top" title="Grupo homogênio de exposição">
        <SFlexButton
          active={isGhoOpen ? 1 : 0}
          onClick={() => {
            if (isRiskOpen) dispatch(setRiskAddInit());
            dispatch(setGhoOpen());
          }}
          gap={3}
          px={5}
          py={2}
          pr={6}
          center
        >
          <Icon component={SGhoIcon} />
          <SText>G.H.E</SText>
        </SFlexButton>
      </STooltip>
    </SFlex>
  );
};
