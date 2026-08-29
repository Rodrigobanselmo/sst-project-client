import { Box, useTheme } from '@mui/material';
import { keyframes } from '@mui/material/styles';

import LogoSimpleIcon from '../../../../assets/logo/logo-simple/logo-simple';

export type AppLoadingProps = {
  open?: boolean;
  variant?: 'fullscreen' | 'contained';
};

const SIMPLESST_MARK_DARK = '#F6D040';
const SIMPLESST_MARK_LIGHT = '#000000';
const ORBIT_SIZE = 96;
const ORBIT_RADIUS = 38;
const ORBIT_CENTER = 50;
const ORBIT_LENGTH = 2 * Math.PI * ORBIT_RADIUS;

const orbitSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const tipPulse = keyframes`
  0%, 100% { opacity: 0.72; }
  50% { opacity: 1; }
`;

function SimpleSstLoadingMark() {
  const theme = useTheme();
  const markColor =
    theme.palette.mode === 'light' ? SIMPLESST_MARK_LIGHT : SIMPLESST_MARK_DARK;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: ORBIT_SIZE,
        height: ORBIT_SIZE,
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          animation: `${orbitSpin} 1.7s linear infinite`,
          '& [data-orbit-tip]': {
            animation: `${tipPulse} 1.7s ease-in-out infinite`,
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            '& [data-orbit-tip]': {
              animation: 'none',
            },
          },
        }}
      >
        <circle
          cx={ORBIT_CENTER}
          cy={ORBIT_CENTER}
          r={ORBIT_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          opacity={0.22}
        />
        <circle
          cx={ORBIT_CENTER}
          cy={ORBIT_CENTER}
          r={ORBIT_RADIUS}
          fill="none"
          stroke={markColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${ORBIT_LENGTH * 0.22} ${ORBIT_LENGTH * 0.78}`}
          strokeDashoffset={ORBIT_LENGTH * 0.08}
        />
        <circle
          data-orbit-tip=""
          cx={ORBIT_CENTER + ORBIT_RADIUS}
          cy={ORBIT_CENTER}
          r="2.15"
          fill={markColor}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogoSimpleIcon color={markColor} size={42} />
      </Box>
    </Box>
  );
}

/**
 * Loading universal do produto SimpleSST.
 * Não usa identidade visual de empresa/consultoria.
 */
export function AppLoading({
  open = true,
  variant = 'contained',
}: AppLoadingProps) {
  if (!open) return null;

  const isFullscreen = variant === 'fullscreen';

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando"
      sx={{
        position: isFullscreen ? 'fixed' : 'absolute',
        inset: 0,
        zIndex: (theme) =>
          isFullscreen ? 99999 : theme.mixins.loadingFeedback,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        bgcolor: 'background.default',
        color: 'text.light',
        colorScheme: 'inherit',
      }}
    >
      <SimpleSstLoadingMark />
    </Box>
  );
}
