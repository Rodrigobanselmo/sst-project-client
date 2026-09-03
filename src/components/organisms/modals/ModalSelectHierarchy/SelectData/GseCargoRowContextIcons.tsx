import { Box } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { SHierarchyIcon } from 'assets/icons/SHierarchyIcon';
import { SWorkspaceIcon } from 'assets/icons/SWorkspaceIcon';

const iconBoxSx = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  borderRadius: '4px',
  flexShrink: 0,
  cursor: 'help',
  color: 'text.secondary',
  bgcolor: 'action.hover',
} as const;

export function GseCargoRowContextIcons({
  workspaceTooltip,
  sectorTooltip,
}: {
  workspaceTooltip?: string;
  sectorTooltip: string;
}) {
  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, flexShrink: 0 }}
    >
      {!!workspaceTooltip && (
        <STooltip
          withWrapper
          minLength={0}
          title={workspaceTooltip}
          componentsProps={{
            tooltip: { sx: { whiteSpace: 'pre-line' } },
          }}
        >
          <Box sx={iconBoxSx} aria-label={workspaceTooltip}>
            <SWorkspaceIcon sx={{ fontSize: 16 }} />
          </Box>
        </STooltip>
      )}
      <STooltip
        withWrapper
        minLength={0}
        title={sectorTooltip}
        componentsProps={{
          tooltip: { sx: { whiteSpace: 'pre-line' } },
        }}
      >
        <Box sx={iconBoxSx} aria-label={sectorTooltip}>
          <SHierarchyIcon sx={{ fontSize: 16 }} />
        </Box>
      </STooltip>
    </Box>
  );
}
