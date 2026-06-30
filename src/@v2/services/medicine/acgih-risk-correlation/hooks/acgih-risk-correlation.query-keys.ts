import type { IAcgihRiskCorrelationParams } from '../service/acgih-risk-correlation.types';

export const acgihRiskCorrelationQueryKeys = {
  all: () => ['acgih-risk-correlation'],
  preview: (params?: IAcgihRiskCorrelationParams) => [
    'acgih-risk-correlation',
    'preview',
    params ?? {},
  ],
  examPreview: () => ['acgih-risk-correlation', 'exam-preview'],
};
