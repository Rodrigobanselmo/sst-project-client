import { alpha, type Theme } from '@mui/material';

/** Experimento visual local para o primeiro nível de navegação da empresa. */
export const companyBrowserTabSx = (theme: Theme) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '12px 12px 0 0',
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  transition: 'background-color 150ms ease, border-color 150ms ease',
  '&:hover': { backgroundColor: theme.palette.action.selected, color: theme.palette.text.primary },
  '&[data-nav-active="false"]': {
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
    backgroundImage: `linear-gradient(155deg, ${alpha('#ffffff', theme.palette.mode === 'dark' ? 0.17 : 0.8)} 0%, ${alpha('#ffffff', 0.025)} 48%, ${alpha('#ffffff', theme.palette.mode === 'dark' ? 0.075 : 0.3)} 100%)`,
    backdropFilter: 'blur(16px) saturate(140%)',
    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
    borderColor: alpha(theme.palette.text.primary, 0.16),
    boxShadow: `inset 0 1px 0 ${alpha('#ffffff', theme.palette.mode === 'dark' ? 0.29 : 0.95)}, inset 1px 0 0 ${alpha('#ffffff', 0.06)}, 0 2px 8px ${alpha('#000000', 0.06)}`,
    ...(theme.palette.mode === 'light' && {
      backgroundColor: alpha('#dce5ee', 0.46),
      backgroundImage: `linear-gradient(155deg, ${alpha('#ffffff', 0.88)} 0%, ${alpha('#ffffff', 0.58)} 28%, ${alpha('#b8c9dc', 0.16)} 55%, ${alpha('#ffffff', 0.66)} 100%)`,
      borderColor: alpha('#667e99', 0.24),
      boxShadow: `inset 0 2px 0 ${alpha('#ffffff', 0.98)}, inset 1px 0 0 ${alpha('#ffffff', 0.85)}, inset 0 -1px 0 ${alpha('#7e94ad', 0.1)}, 0 2px 6px ${alpha('#435b77', 0.07)}`,
    }),
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.72),
      borderColor: alpha(theme.palette.text.primary, 0.3),
      color: theme.palette.text.primary,
    },
  },
  '&.Mui-selected, &[data-nav-active="true"], &[data-nav-active="true"]:hover': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderColor: theme.palette.text.secondary,
    borderBottom: `3px solid ${theme.palette.text.primary}`,
    fontWeight: 800,
  },
});


export const companyGlassCardSx = (theme: Theme) => ({
  border: '1px solid',
  ...companyBrowserTabSx(theme)['&[data-nav-active="false"]'],
  borderRadius: '16px',
  ...(theme.palette.mode === 'light' && {
    backgroundColor: alpha('#dce5ee', 0.4),
    backgroundImage: `linear-gradient(155deg, ${alpha('#ffffff', 0.84)} 0%, ${alpha('#ffffff', 0.58)} 28%, ${alpha('#b8c9dc', 0.12)} 55%, ${alpha('#ffffff', 0.66)} 100%)`,
    boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.9)}, inset 1px 0 0 ${alpha('#ffffff', 0.75)}, inset 0 -1px 0 ${alpha('#7e94ad', 0.08)}, 0 2px 6px ${alpha('#435b77', 0.05)}`,
  }),
});
