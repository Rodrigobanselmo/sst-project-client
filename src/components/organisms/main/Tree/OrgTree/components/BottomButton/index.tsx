import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import { useGseVisualAssistance } from '../GseVisualAssistance/GseVisualAssistance.context';
import { useOrgPanelBusy } from '../../hooks/useOrgPanelBusy';
import {
  nextOrgPanel,
  withoutOrgRiskPanel,
  type OrgPanel,
} from '../../org-panels.model';
import React, { FC, useCallback } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { useRouter } from 'next/router';
import { selectGhoOpen, setGhoState } from 'store/reducers/hierarchy/ghoSlice';

import SGhoIcon from 'assets/icons/SGhoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { getCharacterizationEntityRisksHref } from 'core/constants/characterization-navigation.constants';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { ORG_MULTI_WORKSPACE_DISABLED_HINT } from 'core/utils/org-workspace-query';

import { SFlexButton, gseActiveButtonSx } from './styles';

export const BottomButton: FC = () => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const { query, push, replace, pathname } = useRouter();
  const assistance = useGseVisualAssistance();
  const busy = useOrgPanelBusy();
  const current: OrgPanel = assistance?.active
    ? 'GSE'
    : isGhoOpen
      ? 'ENVIRONMENT'
      : null;
  const openPanel = (requested: Exclude<OrgPanel, null>) => {
    if (busy) return;
    const next = nextOrgPanel(current, requested, false);
    dispatch(
      setGhoState({
        data: null,
        selected: null,
        hierarchies: [],
        search: '',
        searchSelect: '',
        open: next === 'ENVIRONMENT',
      }),
    );
    if (!!assistance?.active !== (next === 'GSE')) assistance?.toggle();
    if (next && query.riskGroupId)
      void replace({ pathname, query: withoutOrgRiskPanel(query) }, undefined, {
        shallow: true,
      });
  };
  const { workspaceId: tabWorkspaceId } = useTabWorkspaceId();
  const isOrgMultiWorkspace = useOrgMultiWorkspaceMode();

  const handleOpenEntityRisks = useCallback(() => {
    if (isOrgMultiWorkspace || busy) return;
    const companyId = query.companyId;
    if (typeof companyId !== 'string' || !companyId) return;

    if (assistance?.active) assistance.toggle();
    dispatch(
      setGhoState({
        open: false,
        data: null,
        selected: null,
        hierarchies: [],
        search: '',
        searchSelect: '',
      }),
    );

    void push(
      getCharacterizationEntityRisksHref({
        companyId,
        tabWorkspaceId,
      }),
    );
  }, [
    dispatch,
    isOrgMultiWorkspace,
    push,
    query.companyId,
    tabWorkspaceId,
    busy,
    assistance,
  ]);

  return (
    <SFlex>
      <STooltip
        placement="top"
        title={
          isOrgMultiWorkspace
            ? ORG_MULTI_WORKSPACE_DISABLED_HINT
            : 'Ir para Vínculo de Riscos'
        }
      >
        <SFlexButton
          onClick={
            isOrgMultiWorkspace || busy ? undefined : handleOpenEntityRisks
          }
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
      <STooltip placement="top-start" title="Assistência Visual de GSEs">
        <SFlexButton
          role="button"
          tabIndex={busy ? -1 : 0}
          aria-label="GSE"
          aria-disabled={busy}
          aria-pressed={current === 'GSE'}
          active={current === 'GSE' ? 1 : 0}
          onClick={() => openPanel('GSE')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPanel('GSE');
            }
          }}
          gap={3}
          px={5}
          py={2}
          pr={6}
          center
          sx={[current === 'GSE' ? gseActiveButtonSx : {}, busy ? { opacity: 0.5, cursor: 'not-allowed' } : {}]}
        >
          <Icon component={SGhoIcon} />
          <SText>GSE</SText>
        </SFlexButton>
      </STooltip>
      <STooltip placement="top-start" title="Gestão de Ambientes">
        <SFlexButton
          role="button"
          tabIndex={busy ? -1 : 0}
          aria-label="Ambiente"
          aria-disabled={busy}
          aria-pressed={current === 'ENVIRONMENT'}
          active={current === 'ENVIRONMENT' ? 1 : 0}
          onClick={() => openPanel('ENVIRONMENT')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPanel('ENVIRONMENT');
            }
          }}
          gap={3}
          px={5}
          py={2}
          pr={6}
          center
          sx={[current === 'ENVIRONMENT' ? gseActiveButtonSx : {}, busy ? { opacity: 0.5, cursor: 'not-allowed' } : {}]}
        >
          <LandscapeOutlinedIcon />
          <SText>Ambiente</SText>
        </SFlexButton>
      </STooltip>
    </SFlex>
  );
};
