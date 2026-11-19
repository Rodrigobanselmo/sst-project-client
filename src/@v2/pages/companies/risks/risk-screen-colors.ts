import { Theme } from '@mui/material';

/** Apenas apresentação no navegador; não altera preferências ou estilos do DOCX. */
export const riskScreenColors = (theme: Theme): Record<string, string> =>
  theme.palette.mode === 'dark'
    ? {
        '--risk-screen-surface': '#1b2330',
        '--risk-screen-band': '#252e3c',
        '--risk-screen-grid': '#475569',
        '--risk-screen-ink': '#e2e8f0',
      }
    : {};
