import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PieChartIcon from '@mui/icons-material/PieChart';

import {
  FORM_CHART_TYPE_OPTIONS,
  type FormChartType,
} from '../../helpers/form-chart-type.types';

const CHART_TYPE_ICONS: Record<FormChartType, React.ReactNode> = {
  donut: <DonutLargeIcon fontSize="small" />,
  pie: <PieChartIcon fontSize="small" />,
  bar: <BarChartIcon fontSize="small" />,
};

type FormChartTypeSelectorProps = {
  value: FormChartType;
  onChange: (value: FormChartType) => void;
  label?: string;
};

export const FormChartTypeSelector = ({
  value,
  onChange,
  label = 'Tipo de gráfico',
}: FormChartTypeSelectorProps) => {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, nextValue: FormChartType | null) => {
        if (nextValue) onChange(nextValue);
      }}
      aria-label={label}
      sx={{
        flexWrap: 'wrap',
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          gap: 0.75,
          px: 1.5,
        },
      }}
    >
      {FORM_CHART_TYPE_OPTIONS.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {CHART_TYPE_ICONS[option.value]}
          <Typography component="span" variant="body2">
            {option.label}
          </Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
