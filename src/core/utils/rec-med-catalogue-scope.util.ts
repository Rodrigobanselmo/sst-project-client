import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

/** Creating a catalogue entry must not attach it outside its selected scope. */
export function recMedScopesIncludeRisk(
  scopes: { riskId: string; riskSubTypeId: number | null }[],
  risk: IRiskFactors,
  catalogue: IRiskFactors[],
): boolean {
  return scopes.some((scope) => {
    const target = catalogue.find((item) => item.id === scope.riskId);
    const sameCategory =
      target?.representAll &&
      (target.type === 'OUTROS' || target.type === risk.type);
    if (scope.riskId !== risk.id && !sameCategory) return false;
    return (
      scope.riskSubTypeId == null ||
      (risk.subTypes ?? []).some(
        (subtype) => Number(subtype.sub_type.id) === scope.riskSubTypeId,
      )
    );
  });
}
