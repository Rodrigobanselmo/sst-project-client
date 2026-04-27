import { Box, Typography } from '@mui/material';

const SCALE_MARKS = [0, 20, 40, 60, 80, 100] as const;

type IndicatorPercentScaleProps = {
  /** Espaço entre a barra e a régua (theme spacing). */
  sx?: { mt?: number };
};

/**
 * Régua discreta 0–100% alinhada à largura da barra de indicador (aba Indicadores).
 * Não altera cálculo nem cores — apenas camada visual.
 */
export const IndicatorPercentScale = ({ sx }: IndicatorPercentScaleProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        mt: sx?.mt ?? 1.25,
        position: 'relative',
        minHeight: 22,
        pointerEvents: 'none',
      }}
    >
      {SCALE_MARKS.map((pct) => (
        <Box
          key={pct}
          sx={{
            position: 'absolute',
            left: `${pct}%`,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems:
              pct === 0 ? 'flex-start' : pct === 100 ? 'flex-end' : 'center',
            transform:
              pct === 0
                ? 'translateX(0)'
                : pct === 100
                  ? 'translateX(-100%)'
                  : 'translateX(-50%)',
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: '1px',
              height: 7,
              bgcolor: 'grey.500',
              opacity: 0.55,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            component="span"
            sx={{
              mt: 0.35,
              color: 'text.secondary',
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {pct}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
