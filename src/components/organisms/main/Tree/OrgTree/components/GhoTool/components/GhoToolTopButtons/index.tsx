import { useOrgPanelBusy } from '../../../../hooks/useOrgPanelBusy';
import { GseAssistanceToolbar } from '../../../GseVisualAssistance/GseVisualAssistance';
import { useGseVisualAssistance } from '../../../GseVisualAssistance/GseVisualAssistance.context';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import { setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';

import { GhoToolTopProps } from './types';

export const GhoToolTopButtons: FC<
  { children?: any } & GhoToolTopProps & { environmentOnly?: boolean }
> = ({ handleSelectGHO, environmentOnly = false }) => {
  const assistance = useGseVisualAssistance();
  const dispatch = useAppDispatch();
  const busy = useOrgPanelBusy();

  const handleCloseRisk = () => {
    if (busy) return;
    if (assistance?.active) {
      assistance.toggle();
      return;
    }
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
  };

  return (
    <SFlex
      data-gse-drag-handle={assistance?.active ? true : undefined}
      align="center"
      gap="1"
      mb={2}
    >
      <SIconButton disabled={busy} onClick={handleCloseRisk} size="small">
        <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
      </SIconButton>
      <SText
        sx={{ flex: 1, minWidth: 0 }}
        fontSize="0.9rem"
        color={assistance?.active ? 'text.primary' : 'GrayText'}
      >
        {environmentOnly ? 'Ambientes' : 'Grupo similar de exposição'}
      </SText>
      {!environmentOnly && <GseAssistanceToolbar />}
    </SFlex>
  );
};
