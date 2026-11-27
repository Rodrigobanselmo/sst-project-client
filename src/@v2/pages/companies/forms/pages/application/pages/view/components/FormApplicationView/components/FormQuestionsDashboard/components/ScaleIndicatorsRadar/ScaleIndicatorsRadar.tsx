import { useEffect, useState } from 'react';
import {
  alpha,
  Box,
  Checkbox,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import type { Plugin, RadialLinearScale } from 'chart.js';

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
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[] | null>(null);
  const groupIdsKey = JSON.stringify(groups.map(({ id }) => id));
  useEffect(() => setSelectedGroupIds(null), [groupIdsKey]);
  const [selectedScaleIds, setSelectedScaleIds] = useState<string[]>(['__all_dimensions__']);
  const selectedIds = selectedGroupIds ?? groups.map(({ id }) => id);
  const allGroups = groups.every(({ id }) => selectedIds.includes(id));
  const visibleGroups = groups.filter(({ id }) => selectedIds.includes(id));
  const group = visibleGroups[0];
  const availableGroups = visibleGroups.filter((item) => !item.protected);
  const scales = Array.from(
    new Map(
      availableGroups
        .flatMap((item) => item.scales)
        .map((scale) => [scale.id, scale]),
    ).values(),
  );
  const allDimensions = selectedScaleIds.includes('__all_dimensions__');
  const activeScaleIds = selectedScaleIds.filter((id) => scales.some((scale) => scale.id === id));
  const effectiveScaleIds = activeScaleIds.length ? activeScaleIds : scales.slice(0, 1).map(({ id }) => id);
  const selectedScale = scales.find(({ id }) => effectiveScaleIds.includes(id));
  const multipleScales = byDimension && !allDimensions && effectiveScaleIds.length > 1;
  const pointsFor = (item: RadarGroup) =>
    byDimension
      ? item.scales.filter((scale) => allDimensions || effectiveScaleIds.includes(scale.id)).flatMap((scale) => scale.dimensions)
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
  const series = availableGroups.flatMap((item) =>
    multipleScales
      ? item.scales.filter((scale) => effectiveScaleIds.includes(scale.id)).map((scale) => ({
          label: availableGroups.length > 1 ? `${item.name} — ${scale.name}` : scale.name,
          points: scale.dimensions,
          color: palette[(groups.findIndex((g) => g.id === item.id) * scales.length + scales.findIndex((s) => s.id === scale.id)) % palette.length],
        }))
      : [{ label: item.name, points: pointsFor(item), color: groupColor(item.id) }],
  );
  chart.data.datasets = series.map((seriesItem) => {
    const alignedPoints = points.map((axis) => seriesItem.points.find((point) => point.id === axis.id) ?? { ...axis, hasValidAnswers: false });
    const dataset = buildIndicatorRadarChart(alignedPoints, {
      color: seriesItem.color, textColor, gridColor: alpha(textColor, 0.24), paperColor: theme.palette.background.paper,
    }).data.datasets[0];
    const complete = seriesItem.points.every((point) => point.hasValidAnswers);
    return {
      ...dataset,
      label: seriesItem.label,
      pointBackgroundColor: seriesItem.color,
      spanGaps: multipleScales && complete,
      fill: multipleScales ? complete && seriesItem.points.length >= 3 : dataset.fill,
    };
  });
  const radialNames = byDimension && (allDimensions || multipleScales);
  const radialNamesPlugin: Plugin<'radar'> = {
    id: 'dimensionRadialNames',
    afterDraw(chartInstance) {
      if (!radialNames) return;
      const scale = chartInstance.scales.r as RadialLinearScale;
      const { ctx } = chartInstance;
      const fontSize = chartInstance.width < 480 ? 12 : 14;
      ctx.save();
      ctx.font = `500 ${fontSize}px sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      points.forEach((point, index) => {
        const end = scale.getPointPositionForValue(index, 100);
        const center = scale.getPointPositionForValue(index, 0);
        const angle = Math.atan2(end.y - center.y, end.x - center.x);
        const flipped = Math.cos(angle) < -0.001;
        const label = `${index + 1}. ${point.name}`;
        const lines: string[] = [];
        let line = '';
        const maxWidth = chartInstance.width < 480 ? 105 : 155;
        label.split(/\s+/).forEach((word) => {
          const next = line ? `${line} ${word}` : word;
          if (line && ctx.measureText(next).width > maxWidth) {
            lines.push(line);
            line = word;
          } else line = next;
        });
        if (line) lines.push(line);
        ctx.save();
        ctx.translate(end.x + Math.cos(angle) * 12, end.y + Math.sin(angle) * 12);
        ctx.rotate(angle + (flipped ? Math.PI : 0));
        ctx.textAlign = flipped ? 'right' : 'left';
        lines.forEach((text, row) => {
          ctx.fillText(text, 0, (row - (lines.length - 1) / 2) * (fontSize + 2));
        });
        ctx.restore();
      });
      ctx.restore();
    },
  };
  if (radialNames) {
    chart.data.labels = points.map((_, index) => String(index + 1));
    chart.options.layout = {
      padding: { left: 175, right: 175, top: 175, bottom: 175 },
    };
    chart.options.scales!.r!.pointLabels = { display: false };
  }
  chart.options.plugins!.tooltip = {
    callbacks: {
      title: (items) => points[items[0]?.dataIndex]?.name ?? '',
      label: ({ dataset, raw }) => `${dataset.label}: ${raw}%`,
    },
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
          ? 'Selecione uma ou mais escalas para sobrepor suas séries, ou exiba todas as dimensões. Quanto mais perto de 100%, mais favorável é a condição na dimensão.'
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
          label="Grupos de participantes"
          size="small"
          value={selectedIds}
          SelectProps={{
            multiple: true,
            MenuProps: {
              PaperProps: {
                sx: {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '& .MuiMenuItem-root': {
                    color: 'text.primary',
                    '& .MuiListItemText-primary': { color: 'text.primary' },
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': { bgcolor: 'action.hover' },
                    },
                  },
                  '& .MuiCheckbox-root': { color: 'text.secondary', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: 'primary.main' } },
                },
              },
            },
            renderValue: (value) => {
              const ids = value as string[];
              return allGroups ? 'Todos os grupos (comparar)' : groups.filter(({ id }) => ids.includes(id)).map(({ name }) => name).join(', ');
            },
          }}
          onChange={(event) => {
            const value = event.target.value as unknown as string | string[];
            const next = typeof value === 'string' ? value.split(',') : value;
            setSelectedGroupIds(next.includes('__all__')
              ? allGroups ? [] : groups.map(({ id }) => id)
              : next);
          }}
          sx={{ mb: 6, width: '100%', maxWidth: 360 }}
        >
          <MenuItem value="__all__">
            <Checkbox checked={allGroups} indeterminate={!allGroups && selectedIds.length > 0} />
            <ListItemText primary="Todos os grupos (comparar)" />
          </MenuItem>
          {groups.map(({ id, name }) => (
            <MenuItem key={id} value={id}>
              <Checkbox checked={selectedIds.includes(id)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </TextField>
      )}
      {byDimension && selectedScale && (
        <TextField
          select
          label="Escalas"
          size="small"
          value={allDimensions ? ['__all_dimensions__'] : effectiveScaleIds}
          SelectProps={{
            multiple: true,
            MenuProps: {
              PaperProps: {
                sx: {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '& .MuiMenuItem-root': {
                    color: 'text.primary',
                    '& .MuiListItemText-primary': { color: 'text.primary' },
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': { bgcolor: 'action.hover' },
                    },
                  },
                  '& .MuiCheckbox-root': {
                    color: 'text.secondary',
                    '&.Mui-checked': { color: 'primary.main' },
                  },
                },
              },
            },
            renderValue: () => allDimensions ? 'Exibir todas as dimensões' : scales.filter(({ id }) => effectiveScaleIds.includes(id)).map(({ name }) => name).join(', '),
          }}
          onChange={(event) => {
            const value = event.target.value as unknown as string | string[];
            const next = typeof value === 'string' ? value.split(',') : value;
            if (next.includes('__all_dimensions__') && !allDimensions) setSelectedScaleIds(['__all_dimensions__']);
            else setSelectedScaleIds(next.filter((id) => id !== '__all_dimensions__'));
          }}
          sx={{
            mb: 6,
            ml: { md: groups.length > 1 ? 6 : 0 },
            width: '100%',
            maxWidth: 360,
          }}
        >
          <MenuItem value="__all_dimensions__"><Checkbox checked={allDimensions} /><ListItemText primary="Exibir todas as dimensões" /></MenuItem>
          {scales.map(({ id, name }) => (
            <MenuItem key={id} value={id}>
              <Checkbox checked={!allDimensions && effectiveScaleIds.includes(id)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </TextField>
      )}
      {multipleScales && <Typography color="text.secondary" sx={{ mb: 6 }}>Cada cor representa uma escala. Cada eixo mantém sua própria dimensão; dimensões de outras escalas não são contabilizadas como zero.</Typography>}
      {availableGroups.length === 0 ? (
        <Typography variant="body2">
          {visibleGroups.length === 0 ? 'Selecione os grupos que deseja comparar.' : 'Dados protegidos para os grupos selecionados.'}
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
            <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
            <Box
              sx={{
                position: 'relative',
                width: radialNames ? '100%' : { xs: '100%', sm: '80%' },
                minWidth: radialNames ? 730 : undefined,
                height: {
                  xs: radialNames ? '730px' : 'clamp(300px, 48svh, 360px)',
                  sm: radialNames ? '822px' : 'clamp(360px, 58svh, 576px)',
                  lg: radialNames ? '936px' : 'clamp(448px, 63svh, 800px)',
                },
                mx: 'auto',
                mb: 8,
              }}
            >
              <Radar
                key={`${radialNames}:${points.map(({ id }) => id).join(',')}:${textColor}`}
                aria-label={
                  byDimension
                    ? (allDimensions || multipleScales)
                      ? 'Gráfico de radar de todas as dimensões'
                      : `Gráfico de radar das dimensões de ${selectedScale?.name}`
                    : 'Gráfico de radar dos indicadores por escala'
                }
                role="img"
                plugins={[radialNamesPlugin]}
                {...chart}
              />
            </Box>
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
            {multipleScales && series.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box aria-hidden sx={{ width: 24, height: 6, bgcolor: item.color }} />
                <Typography color="text.primary">{item.label}</Typography>
              </Box>
            ))}
            {!multipleScales && visibleGroups.map((item) => (
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
            {points.map((axis, index) => (
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
                  {radialNames ? `${index + 1}. ` : ''}{axis.name}
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
