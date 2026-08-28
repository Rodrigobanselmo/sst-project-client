import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import STooltip from 'components/atoms/STooltip';
import { isCompanyFlowPathname } from 'core/constants/company-breadcrumb.constants';
import { useRouter } from 'next/router';

import { setInterfaceThemeOverride } from '../../../../configs/theme/interface-theme-preference';
import { useSidebarDrawer } from '../../../../core/contexts/SidebarContext';
import { HeaderBusinessGroupSelect } from './HeaderBusinessGroupSelect/HeaderBusinessGroupSelect';
import { HeaderCompanySelect } from './HeaderCompanySelect/HeaderCompanySelect';
import { HeaderWorkspaceSelect } from './HeaderWorkspaceSelect/HeaderWorkspaceSelect';
import { Location } from './Location';
import { NotificationNav } from './NotificationNav';
import { Profile } from './Profile';
import { SearchBar } from './SearchBar/SearchBar';

export function Header(): JSX.Element {
  const { pathname } = useRouter();
  const { open, isTablet } = useSidebarDrawer();
  const isCompanyFlow = isCompanyFlowPathname(pathname);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack
      direction="row"
      component="header"
      mx={isCompanyFlow ? [2, 3, 4] : [2, 4, 6]}
      px={isCompanyFlow ? [3, 4, 5] : [4, 6, 8]}
      sx={{
        flexShrink: 0,
        borderBottom: '1px solid',
        borderColor: 'background.border',
        alignItems: 'center',
        height: isCompanyFlow ? '3rem' : ['3rem', '4rem', '5rem'],
        minHeight: isCompanyFlow ? '3rem' : undefined,
        backgroundColor: 'background.default',
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
        <SearchBar />
        <HeaderBusinessGroupSelect />
        <HeaderCompanySelect />
        <HeaderWorkspaceSelect />
        <STooltip withWrapper title={isDark ? 'Modo claro' : 'Modo escuro'}>
          <IconButton
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            onClick={() => setInterfaceThemeOverride(isDark ? 'light' : 'dark')}
            sx={{ color: 'text.main' }}
          >
            {isDark ? (
              <LightModeOutlinedIcon sx={{ fontSize: '1.35rem' }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ fontSize: '1.35rem' }} />
            )}
          </IconButton>
        </STooltip>
        <NotificationNav />
        <Profile showProfileData={!isTablet} compact={isCompanyFlow} />
      </Stack>
    </Stack>
  );
}
