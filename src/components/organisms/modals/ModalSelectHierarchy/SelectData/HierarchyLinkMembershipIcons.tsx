import { Box } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { SCharacterizationIcon } from 'assets/icons/SCharacterizationIcon';
import { SGhoIcon } from 'assets/icons/SGhoIcon';

import {
  formatHierarchyLinkMembershipTooltip,
  HierarchyLinkMembershipIndicator,
  sliceHierarchyLinkMembershipIndicators,
} from '../hierarchy-link-membership.util';

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

export function HierarchyLinkMembershipIcons({
  memberships,
}: {
  memberships?: HierarchyLinkMembershipIndicator[];
}) {
  if (!memberships?.length) return null;

  const { visible, overflow } = sliceHierarchyLinkMembershipIndicators(memberships);

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {visible.map((membership, index) => {
        const isLast = index === visible.length - 1;
        const tooltip = formatHierarchyLinkMembershipTooltip(
          membership,
          isLast ? overflow : [],
        );
        const Icon =
          membership.kind === 'gse' ? SGhoIcon : SCharacterizationIcon;

        return (
          <STooltip
            key={`${membership.kind}:${membership.id}`}
            withWrapper
            minLength={0}
            title={tooltip}
            componentsProps={{
              tooltip: { sx: { whiteSpace: 'pre-line' } },
            }}
          >
            <Box sx={iconBoxSx} aria-label={tooltip}>
              <Icon sx={{ fontSize: 16 }} />
            </Box>
          </STooltip>
        );
      })}
    </Box>
  );
}
