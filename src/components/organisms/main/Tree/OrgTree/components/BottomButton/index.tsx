import React, { FC, useCallback } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { useRouter } from 'next/router';
import {
  selectGhoOpen,
  setGhoOpen,
  setGhoState,
  setGhoSearch,
  setGhoSearchSelect,
} from 'store/reducers/hierarchy/ghoSlice';

import SGhoIcon from 'assets/icons/SGhoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { getCharacterizationEntityRisksHref } from 'core/constants/characterization-navigation.constants';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';

import { SFlexButton } from './styles';

export const BottomButton: FC = () => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const { query, push } = useRouter();
  const { workspaceId: tabWorkspaceId } = useTabWorkspaceId();

  const handleOpenEntityRisks = useCallback(() => {
    const companyId = query.companyId;
    if (typeof companyId !== 'string' || !companyId) return;

    dispatch(setGhoOpen(false));

    void push(
      getCharacterizationEntityRisksHref({
        companyId,
        tabWorkspaceId,
      }),
    );
  }, [dispatch, push, query.companyId, tabWorkspaceId]);

  return (
    <SFlex
      sx={{
        bottom: 20,
        right: 30,
        position: 'absolute',
      }}
    >
      <STooltip placement="top" title="Ir para Vínculo de Riscos">
        <SFlexButton
          onClick={handleOpenEntityRisks}
          active={0}
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
            dispatch(setGhoState({ hierarchies: [], data: null }));
            dispatch(setGhoOpen());
            dispatch(setGhoSearch(''));
            dispatch(setGhoSearchSelect(''));
          }}
          gap={3}
          px={5}
          py={2}
          pr={6}
          center
        >
          <Icon component={SGhoIcon} />
          <SText>GSE</SText>
        </SFlexButton>
      </STooltip>
    </SFlex>
  );
};
