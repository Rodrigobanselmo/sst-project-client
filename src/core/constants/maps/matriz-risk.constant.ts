export const matrixRiskMap = {
  [0]: {
    label: 'Não informado',
    short: 'NA',
    level: 1,
  },
  [1]: {
    label: 'Muito baixo',
    short: 'MB',
    level: 1,
  },
  [2]: {
    label: 'Baixo',
    short: 'B',
    level: 2,
  },
  [3]: {
    label: 'Moderado',
    short: 'M',
    level: 3,
  },
  [4]: {
    label: 'Alto',
    short: 'A',
    level: 4,
  },
  [5]: {
    label: 'Muito Alto',
    short: 'MA',
    level: 5,
  },
};

export const matrixRisk = [
  [2, 3, 4, 5, 5],
  [2, 3, 3, 4, 5],
  [2, 2, 3, 3, 4],
  [1, 2, 2, 3, 3],
  [1, 1, 2, 2, 2],
];
