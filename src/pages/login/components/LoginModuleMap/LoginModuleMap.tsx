import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import LogoSimpleIcon from '../../../../assets/logo/logo-simple/logo-simple';
import {
  LOGIN_ECOSYSTEM_NODES,
  LOGIN_ECOSYSTEM_ORBIT,
  type LoginEcosystemNodeSide,
} from '../../constants/login-institutional.content';

const ORBIT = LOGIN_ECOSYSTEM_ORBIT;

const NODE_SIDE_SX: Record<LoginEcosystemNodeSide, SxProps<Theme>> = {
  top: {
    transform: 'translate(-50%, calc(-100% - 8px))',
    textAlign: 'center',
  },
  bottom: {
    transform: 'translate(-50%, 8px)',
    textAlign: 'center',
  },
  right: {
    transform: 'translate(10px, -50%)',
  },
  left: {
    transform: 'translate(calc(-100% - 10px), -50%)',
    textAlign: 'right',
  },
  'top-left': {
    transform: 'translate(calc(-100% - 6px), calc(-100% - 5px))',
    textAlign: 'right',
  },
};

export function LoginModuleMap() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const stroke = isDark
    ? alpha(theme.palette.common.white, 0.22)
    : '#8a97a8';
  const hubRing = isDark
    ? `0 0 0 2px ${theme.palette.background.default}`
    : `0 0 0 3px #F7F8FA, 0 0 0 4px ${alpha(theme.palette.primary.main, 0.32)}`;

  return (
    <Box
      role="img"
      aria-label="SimpleSST no centro, conectando estrutura de trabalho, inventário de riscos, medidas de controle, plano de ação, evidências e acompanhamento"
      sx={{
        display: { xs: 'none', sm: 'block' },
        position: 'relative',
        width: '100%',
        maxWidth: { sm: 380, md: 460, lg: 540 },
        mx: { sm: 'auto', md: 0 },
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          overflow: 'visible',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 100 100"
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <ellipse
            cx={ORBIT.cx}
            cy={ORBIT.cy}
            rx={ORBIT.rx}
            ry={ORBIT.ry}
            transform={`rotate(${ORBIT.rotate} ${ORBIT.cx} ${ORBIT.cy})`}
            fill="none"
            stroke={stroke}
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeDasharray="2.8 3.4"
            vectorEffect="non-scaling-stroke"
          />
          {LOGIN_ECOSYSTEM_NODES.map((node) => (
            <line
              key={`spoke-${node.label}`}
              x1={ORBIT.hubX}
              y1={ORBIT.hubY}
              x2={node.x}
              y2={node.y}
              fill="none"
              stroke={stroke}
              strokeWidth="1.15"
              strokeLinecap="round"
              strokeDasharray="2.8 3.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {LOGIN_ECOSYSTEM_NODES.map((node) => (
            <circle
              key={`dot-${node.label}`}
              cx={node.x}
              cy={node.y}
              r="1.95"
              fill={theme.palette.primary.main}
            />
          ))}
        </Box>

        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: `${ORBIT.hubX}%`,
            top: `${ORBIT.hubY}%`,
            zIndex: 2,
            width: { sm: 40, md: 46, lg: 52 },
            height: { sm: 40, md: 46, lg: 52 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            bgcolor: 'primary.main',
            boxShadow: hubRing,
          }}
        >
          <Box
            sx={{
              width: { sm: 28, md: 32, lg: 38 },
              height: { sm: 28, md: 32, lg: 38 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': { display: 'block', width: '100%', height: '100%' },
            }}
          >
            <LogoSimpleIcon
              color={theme.palette.primary.contrastText}
              size="100%"
            />
          </Box>
        </Box>

        <Box
          component="ul"
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            m: 0,
            p: 0,
            listStyle: 'none',
            pointerEvents: 'none',
          }}
        >
          {LOGIN_ECOSYSTEM_NODES.map((node) => (
            <Typography
              key={node.label}
              component="li"
              sx={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                m: 0,
                color: 'text.dark',
                fontWeight: 700,
                fontSize: { sm: '0.6875rem', md: '0.75rem', lg: '0.8125rem' },
                letterSpacing: '-0.015em',
                lineHeight: 1.16,
                whiteSpace: 'nowrap',
                ...NODE_SIDE_SX[node.side],
              }}
            >
              {node.label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
