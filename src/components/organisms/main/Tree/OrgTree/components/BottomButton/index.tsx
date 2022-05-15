import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { useRouter } from 'next/router';
import { selectGhoOpen, setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';

import SGhoIcon from 'assets/icons/SGhoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { SFlexButton } from './styles';

export const BottomButton: FC = () => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const { query, asPath, push } = useRouter();

  const isRiskOpen = query.riskGroupId;

  const handleCloseRisk = () => {
    push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
  };

  const handleRiskData = () => {
    if (!isRiskOpen) push(RoutesEnum.PGR);
    else handleCloseRisk();
  };

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
            handleRiskData();
            dispatch(setGhoOpen(false));
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
      <STooltip placement="top-start" title="Grupo homogênio de exposição">
        <SFlexButton
          active={isGhoOpen ? 1 : 0}
          onClick={() => {
            handleCloseRisk();
            dispatch(setGhoOpen());
          }}
          gap={3}
          px={5}
          py={2}
          pr={6}
          center
        >
          <Icon component={SGhoIcon} />
          <SText>G.S.E</SText>
        </SFlexButton>
      </STooltip>
    </SFlex>
  );
};
