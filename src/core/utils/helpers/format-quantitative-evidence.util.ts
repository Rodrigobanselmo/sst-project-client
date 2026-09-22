import {
  NoiseQuantityEvidence,
  NoiseQuantityEvidenceCriterion,
} from 'core/interfaces/api/IRiskData';

/**
 * Formatter de evidências quantitativas autoritativas (API).
 * NÃO lê riskData.json. NÃO calcula band/level. NÃO elege vencedor.
 */

export type QuantitativeEvidenceItem = {
  criterionKey: string;
  label: string;
  /** Valor já formatado com unidade quando aplicável (ex.: "84 dB(A)"). */
  displayValue: string;
};

export type QuantitativeCollapsedPresentation = {
  mode: 'none' | 'single' | 'multiple';
  /** Ex.: "Q3 84 dB(A)" ou "múltiplas evidências". */
  inlineEvidence?: string;
  /** Lista legível — mode === 'multiple' (e útil em tooltip). */
  tooltip?: string;
};

const CRITERION_LABEL: Record<NoiseQuantityEvidenceCriterion, string> = {
  NHO01_Q3: 'Q3',
  NR15_Q5: 'Q5',
  IMPACT_NR15: 'Impacto NR-15',
  IMPACT_NHO01: 'Impacto NHO 01',
};

/** Apresentação BR: decimal com vírgula (payload costuma vir com ponto). */
const toDisplayNumber = (raw: string): string => raw.trim().replace('.', ',');

const withUnit = (raw: string, unit?: string | null): string => {
  const num = toDisplayNumber(raw);
  const u = unit?.trim();
  return u ? `${num} ${u}` : num;
};

export function labelForNoiseEvidenceCriterion(
  criterion: string,
): string {
  if (criterion in CRITERION_LABEL) {
    return CRITERION_LABEL[criterion as NoiseQuantityEvidenceCriterion];
  }
  return criterion;
}

/**
 * Converte o snapshot HTTP `determiningEvidences` em itens de apresentação.
 * Snapshot ausente/vazio → []. Nunca cai em heurística de json.
 */
export function formatDeterminingEvidences(
  evidences?: NoiseQuantityEvidence[] | null,
): QuantitativeEvidenceItem[] {
  if (!Array.isArray(evidences) || evidences.length === 0) return [];

  return evidences.map((item) => {
    const label = labelForNoiseEvidenceCriterion(item.criterion);
    return {
      criterionKey: item.criterion,
      label,
      displayValue: withUnit(String(item.value ?? ''), item.unit),
    };
  });
}

export function formatQuantitativeEvidenceInline(
  item: QuantitativeEvidenceItem,
): string {
  return `${item.label} ${item.displayValue}`;
}

export function formatQuantitativeEvidenceTooltip(
  items: QuantitativeEvidenceItem[],
): string {
  return items.map((item) => `${item.label}: ${item.displayValue}`).join('\n');
}

/**
 * Modo de apresentação do recolhido a partir do snapshot autoritativo.
 * Nunca elege um “vencedor” quando há múltiplas.
 */
export function resolveQuantitativeCollapsedPresentation(
  evidenceList: QuantitativeEvidenceItem[],
): QuantitativeCollapsedPresentation {
  if (evidenceList.length === 0) return { mode: 'none' };
  if (evidenceList.length === 1) {
    return {
      mode: 'single',
      inlineEvidence: formatQuantitativeEvidenceInline(evidenceList[0]),
    };
  }
  return {
    mode: 'multiple',
    inlineEvidence: 'múltiplas evidências',
    tooltip: formatQuantitativeEvidenceTooltip(evidenceList),
  };
}

/**
 * Atalho: snapshot API → apresentação do recolhido.
 */
export function resolveQuantitativeCollapsedPresentationFromSnapshot(
  evidences?: NoiseQuantityEvidence[] | null,
): QuantitativeCollapsedPresentation {
  return resolveQuantitativeCollapsedPresentation(
    formatDeterminingEvidences(evidences),
  );
}
