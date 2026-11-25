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
import {
  buildIndicatorRadarChart,
  type RadarGroup,
} from '../../helpers/formIndicatorRadar';

export const ScaleIndicatorsRadar = ({
  groups,
  byDimension,
  consolidated = false,
  onConsolidationChange,
}: {
  groups: RadarGroup[];
  byDimension: boolean;
  consolidated?: boolean;
  onConsolidationChange?: (consolidated: boolean) => void;
}) => {
  const theme = useTheme();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedScaleId, setSelectedScaleId] = useState('');
  const allGroups = !groups.some(({ id }) => id === selectedGroupId);
  const visibleGroups = allGroups
    ? groups
    : groups.filter(({ id }) => id === selectedGroupId);
  const group = visibleGroups[0];
  const availableGroups = visibleGroups.filter((item) => !item.protected);
  const scales = Array.from(
    new Map(
      availableGroups
        .flatMap((item) => item.scales)
        .map((scale) => [scale.id, scale]),
    ).values(),
  );
  const selectedScale =
    scales.find(({ id }) => id === selectedScaleId) ?? scales[0];
  const pointsFor = (item: RadarGroup) =>
    byDimension
      ? (item.scales.find(({ id }) => id === selectedScale?.id)?.dimensions ??
        [])
      : item.scales;
  const points = Array.from(
    new Map(
      availableGroups.flatMap(pointsFor).map((point) => [point.id, point]),
    ).values(),
  );
  const hasValues = availableGroups.some((item) =>
    pointsFor(item).some((point) => point.hasValidAnswers),
  );
  const canDrawRadar = availableGroups.some(
    (item) =>
      pointsFor(item).filter((point) => point.hasValidAnswers).length >= 3,
  );
  const palette = [
    '#42a5f5',
    '#ffb74d',
    '#ab87ff',
    '#26c6da',
    '#ef77a7',
    '#66bb6a',
    '#ef5350',
    '#a5b440',
  ];
  const groupColor = (id: string) =>
    palette[
      Math.max(
        0,
        groups.findIndex((item) => item.id === id),
      ) % palette.length
    ];
  const textColor = theme.palette.text.primary;
  const chart = buildIndicatorRadarChart(points, {
    color: groupColor(group?.id ?? ''),
    textColor,
    gridColor: alpha(textColor, 0.24),
    paperColor: theme.palette.background.paper,
  });
  chart.data.datasets = availableGroups.map((item) => {
    const alignedPoints = points.map(
      (axis) =>
        pointsFor(item).find((point) => point.id === axis.id) ?? {
          ...axis,
          hasValidAnswers: false,
        },
    );
    const dataset = buildIndicatorRadarChart(alignedPoints, {
      color: groupColor(item.id),
      textColor,
      gridColor: alpha(textColor, 0.24),
      paperColor: theme.palette.background.paper,
    }).data.datasets[0];
    return {
      ...dataset,
      label: item.name,
      pointBackgroundColor: groupColor(item.id),
    };
  });
  chart.options.plugins!.tooltip = {
    callbacks: { label: ({ dataset, raw }) => `${dataset.label}: ${raw}%` },
  };

  return (
    <SPaper
      shadow={false}
      sx={{
        p: { xs: 6, sm: 10 },
        border: 0,
        backgroundColor: 'transparent',
        boxShadow: 'none',
        color: 'text.primary',
      }}
    >
      <Typography variant="h5" fontWeight={700} color="text.primary">
        {byDimension ? 'Radar por dimensões' : 'Radar por escalas'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        {byDimension
          ? 'Selecione uma escala para ver suas dimensões. Quanto mais perto de 100%, mais favorável é a condição na dimensão.'
          : 'Quanto mais perto de 100%, mais favorável é a condição na escala.'}
      </Typography>
      {onConsolidationChange && (
        <TextField
          select
          label="Recorte do radar"
          size="small"
          value={consolidated ? 'consolidated' : 'group'}
          onChange={(event) =>
            onConsolidationChange(event.target.value === 'consolidated')
          }
          sx={{ mb: 6, mr: { md: 6 }, width: '100%', maxWidth: 360 }}
        >
          <MenuItem value="group">Por grupo</MenuItem>
          <MenuItem value="consolidated">
            Consolidar grupos selecionados
          </MenuItem>
        </TextField>
      )}
      {onConsolidationChange && !consolidated && groups.length === 1 && (
        <Typography variant="body2" sx={{ mb: 6 }}>
          {group.name}
        </Typography>
      )}
      {groups.length > 1 && (
        <TextField
          select
          label="Grupo de participantes"
          size="small"
          value={allGroups ? '' : selectedGroupId}
          onChange={(event) => setSelectedGroupId(event.target.value)}
          sx={{ mb: 6, width: '100%', maxWidth: 360 }}
        >
          <MenuItem value="">Todos os grupos (comparar)</MenuItem>
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
      {availableGroups.length === 0 ? (
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
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              mb: 8,
            }}
          >
            {visibleGroups.map((item) => (
              <Box
                key={item.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <Box
                  aria-hidden
                  sx={{ width: 24, height: 6, bgcolor: groupColor(item.id) }}
                />
                <Typography color="text.primary">
                  {item.name}
                  {item.protected ? ' — Dados protegidos' : ''}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {points.map((axis) => (
              <Box
                component="li"
                key={axis.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 6,
                }}
              >
                <Typography
                  color="text.primary"
                  fontWeight={700}
                  sx={{ mb: 4 }}
                >
                  {axis.name}
                </Typography>
                {availableGroups.map((item) => {
                  const point = pointsFor(item).find(
                    ({ id }) => id === axis.id,
                  );
                  const valid = point?.hasValidAnswers;
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 4,
                        mb: 3,
                      }}
                    >
                      <Typography
                        color="text.primary"
                        sx={{ width: { xs: '100%', sm: 160 } }}
                      >
                        {item.name}
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 80,
                          height: 10,
                          borderRadius: 2,
                          bgcolor: 'action.disabledBackground',
                        }}
                      >
                        {valid && (
                          <Box
                            sx={{
                              width: `${point.percentage}%`,
                              height: '100%',
                              borderRadius: 2,
                              bgcolor: groupColor(item.id),
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        color={valid ? 'text.primary' : 'text.secondary'}
                        fontWeight={700}
                      >
                        {valid
                          ? `${point.percentage}%`
                          : 'Sem respostas válidas'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </>
      )}
    </SPaper>
  );
};
