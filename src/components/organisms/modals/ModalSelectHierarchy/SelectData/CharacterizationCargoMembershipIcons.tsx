import { Box } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { SCharacterizationIcon } from 'assets/icons/SCharacterizationIcon';

import {
  CharacterizationMembershipIndicator,
  formatCharacterizationMembershipIconTooltip,
  sliceCharacterizationMembershipIndicators,
} from '../characterization-cargo-membership.util';

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

export function CharacterizationCargoMembershipIcons({
  memberships,
}: {
  memberships?: CharacterizationMembershipIndicator[];
}) {
  if (!memberships?.length) return null;

  const { visible, overflowNames } =
    sliceCharacterizationMembershipIndicators(memberships);

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
      onClick={(event) => event.stopPropagation()}
    >
      {visible.map((membership, index) => {
        const isLast = index === visible.length - 1;
        const tooltip = formatCharacterizationMembershipIconTooltip(
          membership,
          isLast ? overflowNames : [],
        );

        return (
          <STooltip
            key={membership.id}
            withWrapper
            minLength={0}
            title={tooltip}
            componentsProps={{
              tooltip: { sx: { whiteSpace: 'pre-line' } },
            }}
          >
            <Box sx={iconBoxSx} aria-label={tooltip}>
              <SCharacterizationIcon sx={{ fontSize: 16 }} />
            </Box>
          </STooltip>
        );
      })}
    </Box>
  );
}
