import type { ParseFispqResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import type {
  RiskFactorAiSuggestionKnownDataPayload,
  RiskFactorAiSuggestionSourceContextPayload,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/service/risk-factor-ai-suggestions.types';

export const FISPQ_AI_PRIORITY_CAPTION =
  'FISPQ disponível — será considerada como fonte prioritária na sugestão.';

export const FISPQ_AI_PROVIDED_CONTEXT_CAPTION = 'Contexto fornecido à IA: FISPQ';

export type ChemicalFispqAiSuggestionContext = {
  origin: 'chemical-fispq';
  fispqExcerpt: string;
};

export function pickFispqAiSuggestionContext(
  preview: ParseFispqResult['preview'] | null | undefined,
): ChemicalFispqAiSuggestionContext | null {
  const excerpt = preview?.aiContext?.excerpt?.trim();
  if (excerpt) {
    return { origin: 'chemical-fispq', fispqExcerpt: excerpt };
  }

  const sections = preview?.aiContext?.sections;
  if (!sections) return null;

  const rebuilt = [
    sections.section2 && `Seção 2 — Identificação de perigos:\n${sections.section2}`,
    sections.section11 &&
      `Seção 11 — Informações toxicológicas:\n${sections.section11}`,
    sections.section8 && `Seção 8 — Controle de exposição:\n${sections.section8}`,
    sections.section10 &&
      `Seção 10 — Estabilidade e reatividade:\n${sections.section10}`,
  ]
    .filter((part): part is string => Boolean(part))
    .join('\n\n')
    .trim();

  if (!rebuilt) return null;
  return { origin: 'chemical-fispq', fispqExcerpt: rebuilt };
}

export function resolveChemicalCreateRiskAiSuggestionOptions(
  fispqContext?: ChemicalFispqAiSuggestionContext | null,
): {
  sourceContext: RiskFactorAiSuggestionSourceContextPayload;
  knownDataExtras?: Pick<RiskFactorAiSuggestionKnownDataPayload, 'fispqExcerpt'>;
} {
  const excerpt = fispqContext?.fispqExcerpt?.trim();
  if (!excerpt || fispqContext?.origin !== 'chemical-fispq') {
    return {
      sourceContext: { origin: 'ho-method-manual' },
    };
  }

  return {
    sourceContext: { origin: 'chemical-fispq' },
    knownDataExtras: { fispqExcerpt: excerpt },
  };
}

/** True when FISPQ was supplied in the payload. Does not imply the model cited it. */
export function wasFispqContextProvided(fispqExcerpt?: string | null): boolean {
  return Boolean(fispqExcerpt?.trim());
}

/** True when the model itself listed FISPQ/SDS in sourceTrace. */
export function sourceTraceCitesFispq(
  sourceTrace?: Array<{ source: string }> | null,
): boolean {
  return Boolean(
    sourceTrace?.some((item) =>
      /\bfispq\b|\bsds\b|ficha\s+com\s+dados\s+de\s+segurança/i.test(item.source),
    ),
  );
}
