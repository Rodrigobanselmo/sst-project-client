export const EXAM_RISK_PERIODICITY_FILTER_OPTIONS = [
  { value: 'isAdmission', label: 'Admissional' },
  { value: 'isPeriodic', label: 'Periódico' },
  { value: 'isChange', label: 'Mudança' },
  { value: 'isReturn', label: 'Retorno' },
  { value: 'isDismissal', label: 'Demissional' },
] as const;

export const EXAM_RISK_SEX_FILTER_OPTIONS = [
  { value: 'isMale', label: 'Masculino' },
  { value: 'isFemale', label: 'Feminino' },
] as const;

export const EXAM_RISK_AGE_RANGE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas as faixas' },
  { value: 'restricted', label: 'Com restrição de idade' },
] as const;
