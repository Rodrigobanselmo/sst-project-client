export type FormChartType = 'donut' | 'pie' | 'bar';

export const DEFAULT_FORM_CHART_TYPE: FormChartType = 'donut';

export const FORM_CHART_TYPE_OPTIONS: ReadonlyArray<{
  value: FormChartType;
  label: string;
}> = [
  { value: 'donut', label: 'Rosca' },
  { value: 'pie', label: 'Pizza' },
  { value: 'bar', label: 'Barra' },
];
