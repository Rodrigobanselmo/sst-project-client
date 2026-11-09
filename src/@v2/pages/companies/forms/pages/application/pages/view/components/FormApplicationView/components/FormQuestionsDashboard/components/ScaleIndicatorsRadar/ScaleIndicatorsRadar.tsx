import { useState } from 'react';
import {
  alpha,
  Box,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Radar } from 'react-chartjs-2';

import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { getIndicatorColorFromScore } from '../../helpers/form-indicator-quality.util';
import {
  buildIndicatorRadarChart,
  canDrawIndicatorRadar,
  getScalesForDimensionRadar,
  type RadarGroup,
} from '../../helpers/formIndicatorRadar';

export const ScaleIndicatorsRadar = ({
  groups,
  byDimension,
}: {
  groups: RadarGroup[];
  byDimension: boolean;
}) => {
  const theme = useTheme();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedScaleId, setSelectedScaleId] = useState('');
  const group = groups.find(({ id }) => id === selectedGroupId) ?? groups[0];
  const scales = byDimension
    ? getScalesForDimensionRadar(group)
    : (group?.scales ?? []);
  const selectedScale =
    scales.find(({ id }) => id === selectedScaleId) ?? scales[0];
  const points = byDimension ? (selectedScale?.dimensions ?? []) : scales;
  const hasValues = points.some((point) => point.hasValidAnswers);
  const canDrawRadar = canDrawIndicatorRadar(points, byDimension);
  const color =
    theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.dark;
  const textColor = theme.palette.text.primary;
  const chart = buildIndicatorRadarChart(points, {
    color,
    textColor,
    gridColor: alpha(textColor, 0.24),
    paperColor: theme.palette.background.paper,
  });

  return (
    <SPaper sx={{ p: { xs: 6, sm: 10 }, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700}>
        {byDimension ? 'Radar por dimensões' : 'Radar por escalas'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        {byDimension
          ? 'Selecione uma escala para ver suas dimensões. Quanto mais perto de 100%, mais favorável é a condição na dimensão.'
          : 'Quanto mais perto de 100%, mais favorável é a condição na escala.'}
      </Typography>
      {groups.length > 1 && (
        <TextField
          select
          label="Grupo de participantes"
          size="small"
          value={group.id}
          onChange={(event) => setSelectedGroupId(event.target.value)}
          sx={{ mb: 6, width: '100%', maxWidth: 360 }}
        >
          {groups.map(({ id, name }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      )}
      {byDimension && selectedScale && (
        <TextField
          select
          label="Escala"
          size="small"
          value={selectedScale.id}
          onChange={(event) => setSelectedScaleId(event.target.value)}
          sx={{
            mb: 6,
            ml: { md: groups.length > 1 ? 6 : 0 },
            width: '100%',
            maxWidth: 360,
          }}
        >
          {scales.map(({ id, name }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      )}
      {group?.protected ? (
        <Typography variant="body2">
          Dados protegidos para este grupo.
        </Typography>
      ) : !hasValues ? (
        <Typography variant="body2">
          Sem respostas válidas no recorte atual.
        </Typography>
      ) : (
        <>
          {byDimension && !canDrawRadar && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
              O radar precisa de pelo menos três dimensões com respostas
              válidas. Os resultados disponíveis estão na lista abaixo.
            </Typography>
          )}
          {canDrawRadar && (
            <Box
              sx={{
                position: 'relative',
                width: { xs: '100%', sm: '80%' },
                height: {
                  xs: 'clamp(300px, 48svh, 360px)',
                  sm: 'clamp(360px, 58svh, 576px)',
                  lg: 'clamp(448px, 63svh, 800px)',
                },
                mx: 'auto',
                mb: 8,
              }}
            >
              <Radar
                aria-label={
                  byDimension
                    ? `Gráfico de radar das dimensões de ${selectedScale?.name}`
                    : 'Gráfico de radar dos indicadores por escala'
                }
                role="img"
                {...chart}
              />
            </Box>
          )}
          <Box
            component="ul"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              listStyle: 'none',
              p: 0,
              m: 0,
              gap: 3,
            }}
          >
            {points.map(({ id, name, percentage, score, hasValidAnswers }) => (
              <Box
                key={id}
                component="li"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 3,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 2,
                }}
              >
                <Typography variant="body1">{name}</Typography>
                <Typography
                  component="span"
                  variant="body1"
                  fontWeight={700}
                  color={hasValidAnswers ? 'text.primary' : 'text.secondary'}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    flexShrink: 0,
                  }}
                >
                  {hasValidAnswers && (
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'text.primary',
                        bgcolor: getIndicatorColorFromScore(score),
                      }}
                    />
                  )}
                  {hasValidAnswers ? `${percentage}%` : 'Sem respostas válidas'}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </SPaper>
  );
};
