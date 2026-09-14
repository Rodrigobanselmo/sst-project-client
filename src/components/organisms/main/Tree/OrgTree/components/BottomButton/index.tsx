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
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { ORG_MULTI_WORKSPACE_DISABLED_HINT } from 'core/utils/org-workspace-query';

import { SFlexButton } from './styles';

export const BottomButton: FC = () => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const { query, push } = useRouter();
  const { workspaceId: tabWorkspaceId } = useTabWorkspaceId();
  const isOrgMultiWorkspace = useOrgMultiWorkspaceMode();

  const handleOpenEntityRisks = useCallback(() => {
    if (isOrgMultiWorkspace) return;
    const companyId = query.companyId;
    if (typeof companyId !== 'string' || !companyId) return;

    dispatch(setGhoOpen(false));

    void push(
      getCharacterizationEntityRisksHref({
        companyId,
        tabWorkspaceId,
      }),
    );
  }, [dispatch, isOrgMultiWorkspace, push, query.companyId, tabWorkspaceId]);

  return (
    <SFlex
      sx={{
        bottom: 20,
        right: 30,
        position: 'absolute',
      }}
    >
      <STooltip
        placement="top"
        title={
          isOrgMultiWorkspace
            ? ORG_MULTI_WORKSPACE_DISABLED_HINT
            : 'Ir para Vínculo de Riscos'
        }
      >
        <SFlexButton
          onClick={isOrgMultiWorkspace ? undefined : handleOpenEntityRisks}
          active={0}
          gap={4}
          px={5}
          py={2}
          pr={6}
          center
          sx={
            isOrgMultiWorkspace
              ? { opacity: 0.5, cursor: 'not-allowed' }
              : undefined
          }
        >
          <Icon sx={{ color: 'gray.500' }} component={SRiskFactorIcon} />
          <SText>Fatores de Risco</SText>
        </SFlexButton>
      </STooltip>
      <STooltip
        placement="top-start"
        title={
          isOrgMultiWorkspace
            ? ORG_MULTI_WORKSPACE_DISABLED_HINT
            : 'Grupo homogênio de exposição'
        }
      >
        <SFlexButton
          active={isGhoOpen && !isOrgMultiWorkspace ? 1 : 0}
          onClick={
            isOrgMultiWorkspace
              ? undefined
              : () => {
                  dispatch(setGhoState({ hierarchies: [], data: null }));
                  dispatch(setGhoOpen());
                  dispatch(setGhoSearch(''));
                  dispatch(setGhoSearchSelect(''));
                }
          }
          gap={3}
          px={5}
          py={2}
          pr={6}
          center
          sx={
            isOrgMultiWorkspace
              ? { opacity: 0.5, cursor: 'not-allowed' }
              : undefined
          }
        >
          <Icon component={SGhoIcon} />
          <SText>GSE</SText>
        </SFlexButton>
      </STooltip>
    </SFlex>
  );
};
