import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { useSidebarDrawer } from '../../../../core/contexts/SidebarContext';
import { Location } from './Location';
import { NotificationNav } from './NotificationNav';
import { Profile } from './Profile';

export function Header(): JSX.Element {
  const { open, isTablet } = useSidebarDrawer();
  return (
    <Stack
      direction="row"
      component="header"
      mx={[2, 4, 6]}
      px={[4, 6, 8]}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        alignItems: 'center',
        height: ['3rem', '4rem', '5rem'],
      }}
    >
      {isTablet && (
        <IconButton
          aria-label="Open navigation"
          onClick={open}
          sx={{
            ml: '-3px',
          }}
        >
          <MenuIcon sx={{ fontSize: '1.6rem' }} />
        </IconButton>
      )}

      <Location />
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
        }}
        ml="auto"
      >
        <NotificationNav />
        <Profile showProfileData={!isTablet} />
      </Stack>
    </Stack>
  );
}
