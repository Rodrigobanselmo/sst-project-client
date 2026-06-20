import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

const matchesScopeId = (scopeIds: Set<string>, ...candidateIds: Array<string | undefined | null>) =>
  candidateIds.some((id) => Boolean(id) && scopeIds.has(id as string));

export const isRiskFactorDataInDocumentScope = (
  riskData: IRiskData,
  scopeIds: string[],
): boolean => {
  if (!scopeIds.length) return true;

  const scopeSet = new Set(scopeIds);

  if (matchesScopeId(scopeSet, riskData.homogeneousGroupId, riskData.homogeneousGroup?.id)) {
    return true;
  }

  if (
    matchesScopeId(
      scopeSet,
      riskData.hierarchyId,
      riskData.hierarchy?.id,
      riskData.hierarchy?.parentId,
    )
  ) {
    return true;
  }

  const linkedHierarchyIds =
    riskData.homogeneousGroup?.hierarchyOnHomogeneous?.map((link) => link.hierarchyId) ?? [];

  if (linkedHierarchyIds.some((hierarchyId) => scopeSet.has(hierarchyId))) {
    return true;
  }

  return false;
};

export const filterRisksForDocumentRiskFilterModal = (
  risks: IRiskFactors[],
  scopeIds: string[],
): IRiskFactors[] =>
  risks.filter((risk) => {
    if (!risk.isPGR) return false;

    if (!scopeIds.length) return true;

    return (risk.riskFactorData ?? []).some((riskData) =>
      isRiskFactorDataInDocumentScope(riskData, scopeIds),
    );
  });
