import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import STooltip from 'components/atoms/STooltip';

import { setInterfaceThemeOverride } from '../../../../configs/theme/interface-theme-preference';

export function LoginThemeToggle() {
  const isDark = useTheme().palette.mode === 'dark';

  return (
    <STooltip withWrapper title={isDark ? 'Modo claro' : 'Modo escuro'}>
      <IconButton
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        onClick={() => setInterfaceThemeOverride(isDark ? 'light' : 'dark')}
        sx={{
          position: 'absolute',
          top: { xs: 8, md: 12 },
          right: { xs: 8, md: 12 },
          zIndex: 3,
          color: 'text.main',
        }}
      >
        {isDark ? (
          <LightModeOutlinedIcon sx={{ fontSize: '1.35rem' }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ fontSize: '1.35rem' }} />
        )}
      </IconButton>
    </STooltip>
  );
}
