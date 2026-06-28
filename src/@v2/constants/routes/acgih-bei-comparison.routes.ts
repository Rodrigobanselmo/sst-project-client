export const AcgihBeiComparisonRoutes = {
  BASE: '/v2/master/acgih-bei-comparison',
  EXPORT: '/v2/master/acgih-bei-comparison/export',
  REFERENCES: '/v2/master/acgih-bei-comparison/references',
  REVIEWS: '/v2/master/acgih-bei-comparison/reviews',
  REVIEW_BY_ID: (acgihBeiIndicatorId: string) =>
    `/v2/master/acgih-bei-comparison/reviews/${acgihBeiIndicatorId}`,
} as const;
