import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RiskEnum } from 'project/enum/risk.enums';

/** Ordem dos tipos principais na listagem (coerente com o chip / família). */
const MAIN_TYPE_ORDER: Partial<Record<RiskEnum, number>> = {
  [RiskEnum.BIO]: 1,
  [RiskEnum.QUI]: 2,
  [RiskEnum.FIS]: 3,
  [RiskEnum.ACI]: 4,
  [RiskEnum.OUTROS]: 5,
  [RiskEnum.ERG]: 6,
};

/**
 * Ordem dos subtipos ergonômicos (mesmos nomes que `STagRisk` / cadastro).
 * Menor = aparece antes no bloco ERG.
 */
const ERG_SUBTYPE_ORDER: Record<string, number> = {
  Psicossociais: 1,
  Biomecânicos: 2,
  Ambientais: 3,
  Organizacionais: 4,
  'Mobiliário e Equipamentos': 5,
};

function mainTypeRank(type: IRiskFactors['type']): number {
  if (type && type in MAIN_TYPE_ORDER) {
    return MAIN_TYPE_ORDER[type as RiskEnum]!;
  }
  return 99;
}

/** Dentro do bloco ERG: subtipo mapeado; 999 = ERG sem subtipo conhecido (por último). */
function ergSubtypeRank(risk: IRiskFactors): number {
  if (risk.type !== RiskEnum.ERG) return 0;
  for (const name of Object.keys(ERG_SUBTYPE_ORDER)) {
    if (risk.subTypes?.some((s) => s?.sub_type?.name === name)) {
      return ERG_SUBTYPE_ORDER[name];
    }
  }
  return 999;
}

function compareRiskFactorTypeAndSubtype(
  a: IRiskFactors,
  b: IRiskFactors,
): number {
  const pa = mainTypeRank(a.type);
  const pb = mainTypeRank(b.type);
  if (pa !== pb) return pa - pb;

  if (a.type === RiskEnum.ERG && b.type === RiskEnum.ERG) {
    const sa = ergSubtypeRank(a);
    const sb = ergSubtypeRank(b);
    if (sa !== sb) return sa - sb;
  }

  return 0;
}

function compareIdentifiedVisual(a: IRiskFactors, b: IRiskFactors): number {
  const typeCmp = compareRiskFactorTypeAndSubtype(a, b);
  if (typeCmp !== 0) return typeCmp;

  return (a.name || '').localeCompare(b.name || '', 'pt-BR', {
    sensitivity: 'base',
  });
}

/** Ordenação local por página: agrupa por chip visual; desempate por nome. */
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
