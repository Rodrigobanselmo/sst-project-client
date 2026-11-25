import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { SPaper } from '@v2/components/atoms/SPaper/SPaper';

import type { ExecutiveIndicatorsDistribution } from '../../helpers/buildExecutiveIndicatorsDistribution.util';
import type { FormChartType } from '../../helpers/form-chart-type.types';
import { FormChartDistributionView } from '../FormChartDistributionView/FormChartDistributionView';
import { FormChartTypeSelector } from '../FormChartTypeSelector/FormChartTypeSelector';

type ExecutiveIndicatorsDistributionProps = {
  level?: 'scales' | 'dimensions' | 'questions';
  onLevelChange?: (level: 'scales' | 'dimensions' | 'questions') => void;
  distribution: ExecutiveIndicatorsDistribution;
  chartType: FormChartType;
  onChartTypeChange: (chartType: FormChartType) => void;
};

export const ExecutiveIndicatorsDistributionSection = ({
  distribution,
  level,
  onLevelChange,
  chartType,
  onChartTypeChange,
}: ExecutiveIndicatorsDistributionProps) => {
  const chartRows = distribution.rows.map((row) => ({
    id: row.bandId,
    label: row.name,
    count: row.count,
    percentage: row.percentage,
    color: row.color,
  }));

  const totalIndicators = distribution.totalIndicators;

  return (
    <SPaper
      shadow={false}
      sx={{
        p: { xs: 6, sm: 8 },
        borderRadius: 2,
        border: 0,
        boxShadow: 'none',
        backgroundColor: 'transparent',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Distribuição Geral dos Indicadores
        </Typography>
        <FormChartTypeSelector
          value={chartType}
          onChange={onChartTypeChange}
          label="Tipo de gráfico da distribuição geral"
          order={['bar', 'pie', 'donut']}
        />
      </Box>

      {level && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <Typography color="text.primary" variant="body2">
            Exibir distribuição de:
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={level}
            aria-label="Nível da distribuição geral"
            onChange={(_, value) => {
              if (value) onLevelChange?.(value);
            }}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none' } }}
          >
            <ToggleButton value="scales">Escalas</ToggleButton>
            <ToggleButton value="dimensions">Dimensões</ToggleButton>
            <ToggleButton value="questions">Perguntas</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.5, mb: 4 }}
      >
        Distribuição dos indicadores calculados no recorte atual, classificados
        conforme as faixas de qualidade. Não representa média geral nem nota
        única da empresa.
      </Typography>

      {totalIndicators === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhum indicador disponível para o recorte atual.
        </Typography>
      ) : (
        <>
          <FormChartDistributionView
            rows={chartRows}
            totalAnswers={totalIndicators}
            chartType={chartType}
            height={220}
            barLabelFontSize={12}
          />
          <Box sx={{ mt: 3 }}>
            {distribution.rows.map((row) => (
              <Typography
                key={row.bandId}
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {row.name} — {row.percentage}% ({row.count}{' '}
                {row.count === 1 ? 'indicador' : 'indicadores'})
              </Typography>
            ))}
          </Box>
        </>
      )}
    </SPaper>
  );
};
