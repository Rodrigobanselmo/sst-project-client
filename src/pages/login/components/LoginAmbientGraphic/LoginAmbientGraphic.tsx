import { Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function LoginAmbientGraphic() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const ink = isDark
    ? alpha(theme.palette.common.white, 0.08)
    : alpha(theme.palette.text.dark, 0.055);
  const accent = alpha(theme.palette.primary.main, isDark ? 0.12 : 0.1);

  return (
    <Box
      aria-hidden
      sx={{
        display: { xs: 'none', md: 'block' },
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 640 420"
        preserveAspectRatio="xMidYMin meet"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '118%',
          height: '72%',
          opacity: isDark ? 0.5 : 0.42,
        }}
      >
        <defs>
          <pattern
            id="login-dot-grid"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.1" cy="1.1" r="0.7" fill={ink} />
          </pattern>
        </defs>
        <rect width="640" height="420" fill="url(#login-dot-grid)" />
        <path
          d="M48 118 C110 104, 150 146, 198 132 S286 88, 338 118 S430 168, 492 128 S560 92, 612 108"
          fill="none"
          stroke={accent}
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <path
          d="M72 168 C128 158, 176 186, 228 170 S320 132, 372 162 S468 214, 534 176"
          fill="none"
          stroke={ink}
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <circle cx="198" cy="132" r="2.1" fill={accent} />
        <circle cx="338" cy="118" r="1.7" fill={ink} />
        <circle cx="492" cy="128" r="2.1" fill={accent} />
        <circle cx="228" cy="170" r="1.5" fill={ink} />
      </Box>
    </Box>
  );
}
