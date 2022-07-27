export const headerRows = [
  {
    label: '​Fonte Gereradora',
    tooltip: 'Fonte Gereradora',
    filterKey: 'generateSources',
    filterValues: ['desc', 'asc', 'none'],
  },
  {
    label: '​EPI',
    tooltip: 'Equipamento de proteção individual',
    filterKey: 'epis',
    filterValues: ['desc', 'asc', 'none'],
  },
  {
    label: 'EPC / ENG',
    tooltip: 'Medidas de engenharia (EPC)',
    filterKey: 'engs',
    filterValues: ['desc', 'asc', 'none'],
  },
  {
    label: 'Medidas ADM',
    tooltip: 'Medidas administrativas',
    filterKey: 'adms',
    filterValues: ['desc', 'asc', 'none'],
  },
  {
    label: '​Probabilidade',
    tooltip: 'Grau de exposição estimado (probabilidade)',
    filterKey: 'probability',
    filterValues: ['desc', 'asc', 'none'],
  },
  {
    label: 'Risco Ocupacional',
    tooltip: 'Grau de risco de exposição atual (Risco Ocupacional)',
  },
  {
    label: 'Recomendações',
    tooltip: 'Recomendações',
    filterKey: 'recs',
    filterValues: ['desc', 'asc', 'none'],
  },
  {
    label: 'Probabilidade',
    filterKey: 'probabilityAfter',
    filterValues: ['desc', 'asc', 'none'],
    tooltip:
      'Grau de exposição estimado após aplicação das recomendações (probabilidade)',
  },
  {
    label: 'Risco Residual',
    tooltip:
      'Grau de risco de exposição após aplicação das recomendações (Risco Residual)',
  },
];
