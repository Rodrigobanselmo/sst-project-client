import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import { useGseVisualAssistance } from '../GseVisualAssistance/GseVisualAssistance.context';
import { useOrgPanelBusy } from '../../hooks/useOrgPanelBusy';
import {
  nextOrgPanel,
  withoutOrgRiskPanel,
  type OrgPanel,
} from '../../org-panels.model';
import React, { FC, useCallback } from 'react';

import { Icon, IconButton, Tooltip } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
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

import { gseActiveButtonSx } from './styles';

export const BottomButton: FC<{
  inventoryOpen?: boolean;
  onInventoryChange?: (open: boolean) => void;
}> = ({ inventoryOpen, onInventoryChange }) => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const { query, push, replace, pathname } = useRouter();
  const assistance = useGseVisualAssistance();
  const busy = useOrgPanelBusy();
  const current: OrgPanel = assistance?.active
    ? 'GSE'
    : isGhoOpen
      ? 'ENVIRONMENT'
      : inventoryOpen ? 'INVENTORY' : null;
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
    onInventoryChange?.(next === 'INVENTORY');
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

    onInventoryChange?.(false);
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
    onInventoryChange,
  ]);

  const panelActions = [
    { panel: 'GSE', label: 'GSE', title: 'Assistência Visual de GSEs', icon: <Icon component={SGhoIcon} /> },
    { panel: 'ENVIRONMENT', label: 'Ambiente', title: 'Gestão de Ambientes', icon: <LandscapeOutlinedIcon /> },
    ...(onInventoryChange ? [{
      panel: 'INVENTORY' as const,
      label: 'Importar Inventário / PGR',
      title: 'Importar Inventário / PGR',
      icon: <UploadFileOutlinedIcon />,
    }] : []),
  ] as const;

  return (
    <SFlex role="group" aria-label="Atalhos do organograma" sx={{ flexWrap: 'wrap', gap: 2 }}>
      <Tooltip title={isOrgMultiWorkspace ? ORG_MULTI_WORKSPACE_DISABLED_HINT : 'Fatores de Risco · Ir para Vínculo de Riscos'}>
        <span>
          <IconButton
            aria-label="Fatores de Risco"
            disabled={isOrgMultiWorkspace || busy}
            onClick={handleOpenEntityRisks}
          >
            <Icon component={SRiskFactorIcon} />
          </IconButton>
        </span>
      </Tooltip>
      {panelActions.map(({ panel, label, title, icon }) => (
        <Tooltip key={panel} title={title}>
          <span>
            <IconButton
              aria-label={label}
              aria-disabled={busy}
              aria-pressed={current === panel}
              disabled={busy}
              onClick={() => openPanel(panel)}
              sx={current === panel ? gseActiveButtonSx : undefined}
            >
              {icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </SFlex>
  );
};
