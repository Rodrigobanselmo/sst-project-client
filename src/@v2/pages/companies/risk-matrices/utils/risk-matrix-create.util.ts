import {
  RiskMatrixCreateSourceEnum,
  type CreateRiskMatrixPayload,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

export function buildCreateRiskMatrixPayload(params: {
  name: string;
  description?: string;
  source: RiskMatrixCreateSourceEnum;
}): CreateRiskMatrixPayload {
  const payload: CreateRiskMatrixPayload = {
    name: params.name,
  };

  if (params.description) {
    payload.description = params.description;
  }

  if (params.source === RiskMatrixCreateSourceEnum.SYSTEM) {
    payload.source = RiskMatrixCreateSourceEnum.SYSTEM;
  }

  return payload;
}
