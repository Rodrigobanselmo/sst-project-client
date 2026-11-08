import { useOrgPanelBusy } from '../../../../hooks/useOrgPanelBusy';
import { useGseVisualAssistance } from '../../../GseVisualAssistance/GseVisualAssistance.context';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box, Tooltip, Icon } from '@mui/material';
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
  const floating = environmentOnly || assistance?.active;

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
      data-gse-drag-handle={floating ? true : undefined}
      tabIndex={floating ? 0 : undefined}
      aria-label={
        floating
          ? 'Mover painel: arraste ou use as setas do teclado'
          : undefined
      }
      align="center"
      gap="1"
      mb={2}
    >
      <SIconButton
        aria-label={
          environmentOnly
            ? 'Fechar painel de ambientes'
            : 'Fechar painel de GSEs'
        }
        disabled={busy}
        onClick={handleCloseRisk}
        size="small"
      >
        <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
      </SIconButton>
      <SText
        sx={{ flex: 1, minWidth: 0 }}
        fontSize="0.9rem"
        color={floating ? 'text.primary' : 'GrayText'}
      >
        {environmentOnly ? 'Ambientes' : 'Grupo similar de exposição'}
      </SText>
      {floating && (
        <Tooltip title="Arraste esta área para mover o painel">
          <Box
            component="span"
            aria-label="Área de arraste do painel"
            sx={{
              width: 28,
              height: 16,
              flexShrink: 0,
              backgroundImage:
                'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '4px 4px',
              opacity: 0.45,
            }}
          />
        </Tooltip>
      )}
    </SFlex>
  );
};
