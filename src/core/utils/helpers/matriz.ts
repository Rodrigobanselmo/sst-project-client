import {
  matrixRisk,
  matrixRiskMap,
} from 'core/constants/maps/matriz-risk.constant';

export const getMatrizRisk = (severity?: number, probability?: number) => {
  if (!severity || !probability) return null;

  if (probability >= 6) return matrixRiskMap[6];

  const value = matrixRisk[5 - probability][
    severity - 1
  ] as keyof typeof matrixRiskMap;

  return matrixRiskMap[value || 1];
};
