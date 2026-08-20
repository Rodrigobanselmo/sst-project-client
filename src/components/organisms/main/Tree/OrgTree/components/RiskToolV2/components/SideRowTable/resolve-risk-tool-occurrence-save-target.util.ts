export function resolveRiskToolOccurrenceSaveTarget(params: {
  originHomogeneousGroupId?: string;
  selectedGhoId?: string;
  riskFactorDataId?: string;
}): { homogeneousGroupId: string; riskFactorDataId?: string } | null {
  if (params.originHomogeneousGroupId) {
    const homogeneousGroupId = params.originHomogeneousGroupId.split('//')[0];
    if (!homogeneousGroupId || !params.riskFactorDataId) return null;
    return {
      homogeneousGroupId,
      riskFactorDataId: params.riskFactorDataId,
    };
  }

  const homogeneousGroupId = String(params.selectedGhoId || '').split('//')[0];
  if (!homogeneousGroupId) return null;

  return {
    homogeneousGroupId,
    riskFactorDataId: params.riskFactorDataId || undefined,
  };
}
