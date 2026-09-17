export const matrixRiskMap = {
  [0]: {
    label: 'Não informado',
    short: 'NA',
    level: 0,
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
  [6]: {
    label: 'Interromper',
    short: 'IA',
    level: 6,
  },
};

/**
 * Matriz qualitativa SimpleSST: 5x5 (espelho da API).
 * Primeiras cinco colunas = Severidade 1..5. Níveis 1..5 = resultados ordinários.
 * Nível 6 = estado extraordinário Interromper atividades (não é 6ª classe qualitativa).
 * A sexta coluna física é legado defensivo para eventual severity=6 inválido;
 * não faz parte do eixo metodológico de Severidade.
 */
export const matrixRisk = [
  [2, 3, 4, 5, 5, 6],
  [2, 3, 3, 4, 5, 6],
  [2, 2, 3, 3, 4, 6],
  [1, 2, 2, 3, 3, 6],
  [1, 1, 2, 2, 2, 6],
];
