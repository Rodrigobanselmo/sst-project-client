import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

export const riskSubTypeMasterQueryKeys = {
  browse: (type?: RiskTypeEnum) => ['risk-sub-type-master', 'browse', type] as const,
  curationRisks: (params: unknown) =>
    ['risk-subtype-curation', 'risks', params] as const,
};
