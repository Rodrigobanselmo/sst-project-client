import React, { FC, useState } from 'react';

import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Box, Icon, Menu, MenuItem } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';

import {
  INCORPORATED_IN_OPEN_WORKSPACE_LABEL,
  INFORMATIVE_LINK_CREATE_TOOLTIP,
  INFORMATIVE_LINK_UNDO_TOOLTIP,
} from '../../utils/existing-control-correspondence.util';

export const InformativeControlLinkAction: FC<{
  kind: 'hidden' | 'link' | 'linked' | 'derived';
  medType?: 'ADM' | 'ENG' | null;
  onLink?: (medType: 'ADM' | 'ENG') => void;
  onUndo?: () => void;
}> = ({ kind, medType, onLink, onUndo }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (kind === 'hidden') return null;

  const tooltip =
    kind === 'derived'
      ? INCORPORATED_IN_OPEN_WORKSPACE_LABEL
      : kind === 'linked'
        ? INFORMATIVE_LINK_UNDO_TOOLTIP
        : INFORMATIVE_LINK_CREATE_TOOLTIP;

  const icon = (
    <Icon
      component={LinkOutlinedIcon}
      sx={{
        fontSize: 14,
        color: kind === 'link' ? 'schema.red' : 'text.secondary',
      }}
    />
  );

  return (
    <>
      <STooltip
        title={tooltip}
        componentsProps={{
          tooltip: { sx: { maxWidth: 280, whiteSpace: 'pre-line' } },
        }}
      >
        <Box
          component="span"
          sx={{ display: 'inline-flex', lineHeight: 0 }}
          onMouseDown={(event) => event.stopPropagation()}
          onMouseOver={(event) => event.stopPropagation()}
        >
          {kind === 'derived' ? (
            icon
          ) : (
            <SIconButton
              sx={{ maxWidth: 10, maxHeight: 10, p: 0 }}
              onClick={(event) => {
                event.stopPropagation();
                if (kind === 'linked') {
                  onUndo?.();
                  return;
                }
                if (medType) {
                  onLink?.(medType);
                  return;
                }
                setAnchor(event.currentTarget);
              }}
            >
              {icon}
            </SIconButton>
          )}
        </Box>
      </STooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem
          onClick={(event) => {
            event.stopPropagation();
            setAnchor(null);
            onLink?.('ADM');
          }}
          sx={{ fontSize: 13 }}
        >
          Medida administrativa
        </MenuItem>
        <MenuItem
          onClick={(event) => {
            event.stopPropagation();
            setAnchor(null);
            onLink?.('ENG');
          }}
          sx={{ fontSize: 13 }}
        >
          EPC/ENG
        </MenuItem>
      </Menu>
    </>
  );
};
