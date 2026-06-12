import Box from '@mui/material/Box';
import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';
import { documentsHeaderChipShellSx } from '@v2/components/organisms/workspace/documentsHeaderChipSelectPreset';
import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { useHomeBusinessGroupScope } from 'core/hooks/useHomeBusinessGroupScope';
import SText from 'components/atoms/SText';

import { STBox } from '../Tenant/Tenant';

export function HeaderBusinessGroupSelect(): JSX.Element | null {
  const { isTablet } = useSidebarDrawer();
  const { isHomePage, hasBusinessGroup, businessGroupName } =
    useHomeBusinessGroupScope();

  if (!isHomePage || !hasBusinessGroup || !businessGroupName) {
    return null;
  }

  return (
    <STBox
      ml={2}
      display={isTablet ? 'none' : 'flex'}
      sx={{
        cursor: 'default',
        ...documentsHeaderChipShellSx,
        maxWidth: 220,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <SArrowUpFilterIcon
        sx={{
          fontSize: '20px',
          mt: 0,
          mr: 0.75,
          flexShrink: 0,
          transform: 'rotate(-180deg)',
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0, px: 0.5 }}>
        <SText fontSize={10} color="text.secondary" lineNumber={1}>
          Grupo
        </SText>
        <SText fontSize={12} fontWeight={600} lineNumber={1}>
          {businessGroupName}
        </SText>
      </Box>
    </STBox>
  );
}
