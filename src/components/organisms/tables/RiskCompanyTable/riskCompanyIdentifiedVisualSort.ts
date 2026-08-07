import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RiskEnum } from 'project/enum/risk.enums';

/**
 * Ordem global do catálogo (igual à API `risk-catalog-sort.util`).
 * ACI → BIO → ERG → FIS → QUI → OUTROS
 */
const MAIN_TYPE_ORDER: Partial<Record<RiskEnum, number>> = {
  [RiskEnum.ACI]: 1,
  [RiskEnum.BIO]: 2,
  [RiskEnum.ERG]: 3,
  [RiskEnum.FIS]: 4,
  [RiskEnum.QUI]: 5,
  [RiskEnum.OUTROS]: 6,
};

/** Subtipos ERG por nome (espelha slugs da API). */
const ERG_SUBTYPE_ORDER: Record<string, number> = {
  Psicossociais: 1,
  Biomecânicos: 2,
  Ambientais: 3,
  Organizacionais: 4,
  'Mobiliário e Equipamentos': 5,
};

/** Subtipos OUTROS por nome (espelha slugs da API). */
const OUTROS_SUBTYPE_ORDER: Record<string, number> = {
  'Indicadores de Controles': 1,
  'Indicadores de Saúde': 2,
};

function comparePtBr(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function mainTypeRank(type: IRiskFactors['type']): number {
  if (type && type in MAIN_TYPE_ORDER) {
    return MAIN_TYPE_ORDER[type as RiskEnum]!;
  }
  return 99;
}

function primarySubtypeName(risk: IRiskFactors): string | null {
  const names = (risk.subTypes || [])
    .map((s) => s?.sub_type?.name)
    .filter((n): n is string => !!n);
  if (!names.length) return null;
  names.sort(comparePtBr);
  return names[0];
}

function subtypeSortKey(risk: IRiskFactors): { rank: number; label: string } {
  const name = primarySubtypeName(risk);
  if (!name) return { rank: 9999, label: '' };

  if (risk.type === RiskEnum.ERG) {
    return { rank: ERG_SUBTYPE_ORDER[name] ?? 999, label: name };
  }
  if (risk.type === RiskEnum.OUTROS) {
    return { rank: OUTROS_SUBTYPE_ORDER[name] ?? 999, label: name };
  }
  // QUI e demais: agrupa alfabeticamente pelo nome do subtipo.
  return { rank: 0, label: name };
}

function compareRiskFactorTypeAndSubtype(
  a: IRiskFactors,
  b: IRiskFactors,
): number {
  const pa = mainTypeRank(a.type);
  const pb = mainTypeRank(b.type);
  if (pa !== pb) return pa - pb;

  const sa = subtypeSortKey(a);
  const sb = subtypeSortKey(b);
  if (sa.rank !== sb.rank) return sa.rank - sb.rank;
  if (sa.label !== sb.label) return comparePtBr(sa.label, sb.label);

  return 0;
}

function compareIdentifiedVisual(a: IRiskFactors, b: IRiskFactors): number {
  const typeCmp = compareRiskFactorTypeAndSubtype(a, b);
  if (typeCmp !== 0) return typeCmp;

  const nameCmp = comparePtBr(a.name || '', b.name || '');
  if (nameCmp !== 0) return nameCmp;

  return comparePtBr(a.id || '', b.id || '');
}

/**
 * Sort defensivo idempotente: reproduz a ordem global da API na página atual.
 * A paginação coerente depende da API ordenar antes do LIMIT/OFFSET.
 */
export function sortRisksIdentifiedForVisualDisplay(
  risks: IRiskFactors[],
): IRiskFactors[] {
  return [...risks].sort(compareIdentifiedVisual);
}

/** Ordenação visual de `IRiskData` (ex.: modal de importação); desempate por rótulo exibido. */
export function sortRiskDataForVisualDisplay(
  risks: IRiskData[],
  getDisplayName: (risk: IRiskData) => string,
): IRiskData[] {
  return [...risks].sort((a, b) => {
    const rfA = a.riskFactor;
    const rfB = b.riskFactor;

    if (rfA && rfB) {
      const typeCmp = compareRiskFactorTypeAndSubtype(rfA, rfB);
      if (typeCmp !== 0) return typeCmp;
    } else if (!rfA && !rfB) {
      // fall through to display name
    } else {
      return rfA ? -1 : 1;
    }

    return getDisplayName(a).localeCompare(getDisplayName(b), 'pt-BR', {
      sensitivity: 'base',
    });
  });
}
