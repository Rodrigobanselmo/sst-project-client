export enum RowColumnsTypeEnum {
  GS = 'GS',
  EPI = 'EPI',
  EPC = 'EPC',
  MED = 'MED',
  PROB = 'PROB',
  RO = 'RO',
  EXAM = 'EXAM',
  REC = 'REC',
  PROB_AFTER = 'PROB_AFTER',
  RO_AFTER = 'RO_AFTER',
}

export interface IColumnOption {
  label: string;
  tooltip: string;
  filterKey?: string;
  filterValues?: string[];
  grid: string;
}
interface IColumnOptionsMap extends Record<RowColumnsTypeEnum, IColumnOption> {}

export const headerRowColumnsMap: IColumnOptionsMap = {
  [RowColumnsTypeEnum.GS]: {
    label: '​Fonte Geradora',
    tooltip: 'Fonte Geradora',
    filterKey: 'generateSources',
    filterValues: ['desc', 'asc', 'none'],
    grid: 'minmax(100px, 1fr)',
  },
  [RowColumnsTypeEnum.EPI]: {
    label: '​EPI',
    tooltip: 'Equipamento de proteção individual',
    filterKey: 'epis',
    filterValues: ['desc', 'asc', 'none'],
    grid: 'minmax(100px, 1fr)',
  },
  [RowColumnsTypeEnum.EPC]: {
    label: 'EPC / ENG',
    tooltip: 'Equipamento de Proteção Coletiva / Medidas de engenharia',
    filterKey: 'engs',
    filterValues: ['desc', 'asc', 'none'],
    grid: 'minmax(100px, 1fr)',
  },
  [RowColumnsTypeEnum.MED]: {
    label: 'Outras Medidas',
    tooltip: 'Medidas administrativas e organizacionais',
    filterKey: 'adms',
    filterValues: ['desc', 'asc', 'none'],
    grid: 'minmax(100px, 1fr)',
  },
  [RowColumnsTypeEnum.PROB]: {
    label: '​Probabilidade',
    tooltip: 'Grau de exposição estimado (probabilidade)',
    filterKey: 'probability',
    filterValues: ['desc', 'asc', 'none'],
    grid: '120px',
  },
  [RowColumnsTypeEnum.RO]: {
    label: 'Risco Ocupacional',
    tooltip: 'Grau de risco de exposição atual (Risco Ocupacional)',
    grid: '120px',
  },
  [RowColumnsTypeEnum.EXAM]: {
    label: 'Exames',
    tooltip: 'Exames',
    filterKey: 'exams',
    filterValues: ['desc', 'asc', 'none'],
    grid: 'minmax(250px, 1fr)',
  },
  [RowColumnsTypeEnum.REC]: {
    label: 'Recomendações',
    tooltip: 'Recomendações',
    filterKey: 'recs',
    filterValues: ['desc', 'asc', 'none'],
    grid: 'minmax(100px, 1fr)',
  },
  [RowColumnsTypeEnum.PROB_AFTER]: {
    label: 'Probabilidade',
    filterKey: 'probabilityAfter',
    filterValues: ['desc', 'asc', 'none'],
    grid: '120px',
    tooltip:
      'Grau de exposição estimado após aplicação das recomendações (probabilidade)',
  },
  [RowColumnsTypeEnum.RO_AFTER]: {
    label: 'Risco Residual',
    grid: '120px',
    tooltip:
      'Grau de risco de exposição após aplicação das recomendações (Risco Residual)',
  },
};
