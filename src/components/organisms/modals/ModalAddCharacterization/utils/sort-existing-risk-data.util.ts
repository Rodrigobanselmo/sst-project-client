import { IRiskData } from 'core/interfaces/api/IRiskData';

const getRiskSubTypeName = (riskData: IRiskData): string => {
  const subTypes = riskData.riskFactor?.subTypes;
  if (!Array.isArray(subTypes) || subTypes.length === 0) return '';

  const first = subTypes[0] as {
    sub_type?: { name?: string };
    name?: string;
  };

  return (first?.sub_type?.name || first?.name || '').trim();
};

/**
 * Stable ordering for "Já caracterizado": type → optional subtype → name.
 */
export function sortExistingRiskData(risks: IRiskData[]): IRiskData[] {
  return [...risks].sort((a, b) => {
    const typeA = String(a.riskFactor?.type || '').localeCompare(
      String(b.riskFactor?.type || ''),
      'pt-BR',
      { sensitivity: 'base' },
    );
    if (typeA !== 0) return typeA;

    const subTypeA = getRiskSubTypeName(a).localeCompare(
      getRiskSubTypeName(b),
      'pt-BR',
      { sensitivity: 'base' },
    );
    if (subTypeA !== 0) return subTypeA;

    return String(a.riskFactor?.name || '').localeCompare(
      String(b.riskFactor?.name || ''),
      'pt-BR',
      { sensitivity: 'base' },
    );
  });
}
