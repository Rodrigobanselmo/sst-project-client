import { useId, useState } from 'react';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Box, ButtonBase, Collapse, Tooltip, Typography } from '@mui/material';

import { INDICATOR_QUALITY_LEGEND_ITEMS } from '../../helpers/form-indicator-quality.util';

/**
 * Legenda explicativa da aba Indicadores (FRPS): faixas de percentual alinhadas
 * à interpretação visual já usada pelo sistema (score 0–1 → percentual arredondado).
 */
export const IndicatorsQualityLegend = () => {
  const [expanded, setExpanded] = useState(false);
  const explanationId = useId();

  return (
    <Box
      sx={{
        p: { xs: 6, sm: 8 },
        py: { xs: 5, sm: 6 },
        backgroundColor: 'transparent',
        border: 0,
        boxShadow: 'none',
      }}
    >
      <ButtonBase
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={explanationId}
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'flex-start',
          gap: 4,
          mb: 4,
          textAlign: 'left',
          borderRadius: 1,
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 4,
          },
        }}
      >
        <ArrowRightIcon
          fontSize="small"
          sx={{
            color: 'text.primary',
            transform: expanded ? 'rotate(90deg)' : 'none',
          }}
        />
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          Interpretação da qualidade
        </Typography>
      </ButtonBase>
      <Collapse in={expanded} id={explanationId}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.5 }}
          mb={2}
        >
          O percentual exibido representa a qualidade do indicador com base nas
          respostas. Percentuais menores indicam condição mais crítica;
          percentuais maiores, condição mais favorável.
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
          {INDICATOR_QUALITY_LEGEND_ITEMS.map((item) => (
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
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.primary"
                >
                  {item.name}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {item.rangeLabel}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
      {!expanded && (
        <Box
          role="group"
          aria-label="Escala de qualidade: de 0%, condição mais crítica, a 100%, condição mais favorável"
        >
          <Box
            aria-hidden
            sx={{
              width: '100%',
              height: 14,
              borderRadius: 999,
              background:
                'linear-gradient(90deg, #F44336 0%, #E87525 25%, #E3D800 50%, #96BC3D 75%, #229B61 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 4,
              mt: 2,
            }}
          >
            {[
              {
                text: '0% · Mais crítico',
                emoji: '😟',
                label: 'Condição mais crítica',
              },
              {
                text: '100% · Mais favorável',
                emoji: '😊',
                label: 'Condição mais favorável',
              },
            ].map((endpoint, index) => (
              <Tooltip
                key={endpoint.text}
                arrow
                placement="top"
                describeChild
                title={
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Box
                      component="span"
                      role="img"
                      aria-label={endpoint.label}
                      sx={{ display: 'block', fontSize: 52, lineHeight: 1.2 }}
                    >
                      {endpoint.emoji}
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                      {endpoint.label}
                    </Typography>
                  </Box>
                }
                componentsProps={{
                  tooltip: { sx: { maxWidth: 260, p: 3, borderRadius: 2 } },
                }}
              >
                <Typography
                  component="span"
                  tabIndex={0}
                  color="text.primary"
                  sx={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textAlign: index === 0 ? 'left' : 'right',
                    cursor: 'help',
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 3,
                    },
                  }}
                >
                  {endpoint.text}
                </Typography>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
