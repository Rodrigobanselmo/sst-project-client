import { Box, Typography } from '@mui/material';

import { SPaper } from '@v2/components/atoms/SPaper/SPaper';

/** Mesmas cores hex usadas nas barras de indicador (sem alterar a paleta). */
const LEGEND_ITEMS = [
  { rangeLabel: '0–19%', name: 'Muito negativo', color: '#F44336' },
  { rangeLabel: '20–39%', name: 'Negativo', color: '#d96c2f' },
  { rangeLabel: '40–59%', name: 'Neutro', color: '#d9d10b' },
  { rangeLabel: '60–79%', name: 'Positivo', color: '#8fa728' },
  { rangeLabel: '80–100%', name: 'Muito positivo', color: '#3cbe7d' },
] as const;

/**
 * Legenda explicativa da aba Indicadores (FRPS): faixas de percentual alinhadas
 * à interpretação visual já usada pelo sistema (score 0–1 → percentual arredondado).
 */
export const IndicatorsQualityLegend = () => {
  return (
    <SPaper
      sx={{
        p: { xs: 6, sm: 8 },
        py: { xs: 5, sm: 6 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        backgroundColor: 'grey.50',
      }}
    >
      <Typography variant="subtitle2" color="text.primary" fontWeight={600} mb={3}>
        Interpretação do indicador de qualidade
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }} mb={2}>
        O percentual exibido representa a qualidade do indicador com base nas
        respostas. Percentuais menores indicam condição mais crítica; percentuais
        maiores, condição mais favorável.
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ lineHeight: 1.45, mb: 4 }}
      >
        Quanto maior o percentual, mais favorável é o resultado do indicador.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          gap: { xs: 2, sm: 3 },
          rowGap: 2,
        }}
      >
        {LEGEND_ITEMS.map((item) => (
          <Box
            key={item.name}
            sx={{
              flex: '1 1 100px',
              minWidth: { xs: 'calc(50% - 8px)', sm: 100 },
              maxWidth: { sm: 160, md: 'none' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '4px',
                  flexShrink: 0,
                  backgroundColor: item.color,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                }}
              />
              <Typography variant="caption" fontWeight={600} color="text.primary">
                {item.name}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {item.rangeLabel}
            </Typography>
          </Box>
        ))}
      </Box>
    </SPaper>
  );
};
