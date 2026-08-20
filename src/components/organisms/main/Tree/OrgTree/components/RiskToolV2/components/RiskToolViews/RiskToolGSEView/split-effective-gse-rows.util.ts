import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export function isDirectGseRiskOccurrence(
  riskData: IRiskData | undefined,
  gseId: string,
): boolean {
  if (!riskData?.id) return true;
  if (typeof riskData.isDirect === 'boolean') return riskData.isDirect;
  return riskData.homogeneousGroupId === gseId;
}

export function splitEffectiveGseRows(params: {
  rows: [IRiskData, IRiskFactors][];
  gseId: string;
}): {
  direct: [IRiskData, IRiskFactors][];
  inherited: [IRiskData, IRiskFactors][];
} {
  const direct: [IRiskData, IRiskFactors][] = [];
  const inherited: [IRiskData, IRiskFactors][] = [];

  params.rows.forEach((row) => {
    if (isDirectGseRiskOccurrence(row[0], params.gseId)) {
      direct.push(row);
    } else {
      inherited.push(row);
    }
  });

  return { direct, inherited };
}

export function formatGseEffectiveOriginLabel(riskData?: IRiskData): string {
  const typeLabel = riskData?.originTypeLabel?.trim();
  const name = riskData?.originName?.trim();
  if (typeLabel && name) return `Origem: ${typeLabel} — ${name}`;
  if (name) return `Origem: ${name}`;
  if (riskData?.origin?.trim()) return `Origem: ${riskData.origin.trim()}`;
  return '';
}

export function inheritedOriginGroupKey(riskData?: IRiskData): string {
  const kind = riskData?.originKind || 'UNKNOWN';
  const originId =
    riskData?.originId || riskData?.homogeneousGroupId || 'unknown';
  return `${kind}::${originId}`;
}

export type InheritedOriginGroup = {
  key: string;
  originKind?: IRiskData['originKind'];
  originId: string;
  originTypeLabel: string;
  originName: string;
  sample: IRiskData;
  rows: [IRiskData, IRiskFactors][];
};

export function groupInheritedRowsByOrigin(
  rows: [IRiskData, IRiskFactors][],
): InheritedOriginGroup[] {
  const groups = new Map<string, InheritedOriginGroup>();
  const order: string[] = [];

  rows.forEach((row) => {
    const riskData = row[0];
    const key = inheritedOriginGroupKey(riskData);
    const existing = groups.get(key);
    if (!existing) {
      order.push(key);
      groups.set(key, {
        key,
        originKind: riskData?.originKind,
        originId: riskData?.originId || riskData?.homogeneousGroupId || 'unknown',
        originTypeLabel: riskData?.originTypeLabel?.trim() || '',
        originName: riskData?.originName?.trim() || '',
        sample: riskData,
        rows: [row],
      });
      return;
    }
    existing.rows.push(row);
  });

  return order.map((key) => groups.get(key)!);
}
