/**
 * Testes pontuais do contexto FISPQ na sugestão de IA do cadastro de fator.
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-fispq-ai-suggestion-context.util.spec.ts
 */
import { buildRiskFactorAiSuggestionPayload } from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/build-risk-factor-ai-suggestion-payload.util';

import { planRiskFactorIngredientFill } from './chemical-ingredient-risk-fill.util';
import {
  FISPQ_AI_PRIORITY_CAPTION,
  FISPQ_AI_PROVIDED_CONTEXT_CAPTION,
  pickFispqAiSuggestionContext,
  resolveChemicalCreateRiskAiSuggestionOptions,
  sourceTraceCitesFispq,
  wasFispqContextProvided,
} from './chemical-fispq-ai-suggestion-context.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const previewWithAiContext = {
  tradeName: 'Irganox 1010',
  manufacturer: 'BASF',
  versionLabel: null,
  issuedAt: null,
  language: 'pt',
  section3Text: 'Tetrakis 6683-19-8 100%',
  ingredients: [
    {
      chemicalName: 'Irganox 1010',
      cas: '6683-19-8',
      concentrationKind: 'EXACT' as const,
      exactPercent: 100,
      minPercent: null,
      maxPercent: null,
      matchStatus: 'NO_MATCH' as const,
    },
  ],
  aiContext: {
    sections: {
      section2: 'Irritação ocular categoria 2.',
      section11: 'Toxicidade aguda oral: baixa.',
    },
    excerpt:
      'Seção 2 — Identificação de perigos:\nIrritação ocular categoria 2.\n\nSeção 11 — Informações toxicológicas:\nToxicidade aguda oral: baixa.',
    truncated: false,
    charCount: 140,
  },
};

const fispqContext = pickFispqAiSuggestionContext(previewWithAiContext);
assert(fispqContext?.origin === 'chemical-fispq', 'FISPQ preview yields chemical-fispq');
assert(
  Boolean(fispqContext?.fispqExcerpt.includes('Irritação ocular')),
  'excerpt keeps section 2',
);
assert(
  Boolean(fispqContext?.fispqExcerpt.includes('Toxicidade aguda')),
  'excerpt keeps section 11',
);
assert(
  !fispqContext?.fispqExcerpt.includes('Tetrakis'),
  'excerpt does not include composition leftovers',
);

assert(
  pickFispqAiSuggestionContext(null) === null,
  'no preview → no FISPQ context',
);
assert(
  pickFispqAiSuggestionContext({
    ...previewWithAiContext,
    aiContext: {
      sections: {},
      excerpt: '',
      truncated: false,
      charCount: 0,
    },
  }) === null,
  'empty aiContext → no FISPQ context',
);

const fispqOptions = resolveChemicalCreateRiskAiSuggestionOptions(fispqContext);
assert(
  fispqOptions.sourceContext.origin === 'chemical-fispq',
  'FISPQ modal origin',
);
assert(
  fispqOptions.knownDataExtras?.fispqExcerpt === fispqContext?.fispqExcerpt,
  'FISPQ payload carries excerpt',
);
assert(
  !('pdfObservations' in (fispqOptions.knownDataExtras || {})),
  'does not reuse pdfObservations',
);

const fispqPayload = buildRiskFactorAiSuggestionPayload({
  form: { type: 'QUI', name: 'Irganox 1010', cas: '6683-19-8' },
  sourceContext: fispqOptions.sourceContext,
  knownDataExtras: fispqOptions.knownDataExtras,
});
assert(fispqPayload.sourceContext?.origin === 'chemical-fispq', 'payload origin FISPQ');
assert(
  fispqPayload.knownData?.fispqExcerpt === fispqContext?.fispqExcerpt,
  'payload knownData.fispqExcerpt',
);
assert(
  fispqPayload.knownData?.pdfObservations == null,
  'FISPQ payload has no pdfObservations',
);

const outsideOptions = resolveChemicalCreateRiskAiSuggestionOptions(null);
assert(
  outsideOptions.sourceContext.origin === 'ho-method-manual',
  'modal outside FISPQ keeps current origin',
);
assert(
  outsideOptions.knownDataExtras === undefined,
  'modal outside FISPQ has no extras',
);

const outsidePayload = buildRiskFactorAiSuggestionPayload({
  form: { type: 'QUI', name: 'Irganox 1010', cas: '6683-19-8' },
  sourceContext: outsideOptions.sourceContext,
  knownDataExtras: outsideOptions.knownDataExtras,
});
assert(
  outsidePayload.sourceContext?.origin === 'ho-method-manual',
  'non-FISPQ payload origin unchanged',
);
assert(outsidePayload.knownData == null, 'non-FISPQ payload has no knownData extras');

const excelOptions = resolveChemicalCreateRiskAiSuggestionOptions(undefined);
assert(
  excelOptions.sourceContext.origin === 'ho-method-manual',
  'Excel continues without FISPQ origin',
);
assert(excelOptions.knownDataExtras === undefined, 'Excel has no fispqExcerpt');

const excelPayload = buildRiskFactorAiSuggestionPayload({
  form: { type: 'QUI', name: 'Ácido sulfâmico', cas: '5329-14-6' },
  sourceContext: excelOptions.sourceContext,
});
assert(
  excelPayload.sourceContext?.origin === 'ho-method-manual',
  'Excel payload origin unchanged',
);
assert(excelPayload.knownData?.fispqExcerpt == null, 'Excel payload has no FISPQ excerpt');

const linked = planRiskFactorIngredientFill({
  ingredient: {
    chemicalName: 'Irganox 1010',
    cas: '6683-19-8',
    riskFactorId: null,
  },
  risk: { id: 'rf-created', name: 'Irganox 1010', cas: '6683-19-8' },
});
assert(
  linked.riskFactorId === 'rf-created',
  'inline create still links riskFactorId on the draft',
);

assert(
  FISPQ_AI_PRIORITY_CAPTION.includes('FISPQ disponível'),
  'pre-click caption is preserved',
);
assert(
  wasFispqContextProvided(fispqPayload.knownData?.fispqExcerpt) === true,
  'FISPQ sent as context is deterministic from the payload',
);
assert(
  wasFispqContextProvided(outsidePayload.knownData?.fispqExcerpt) === false,
  'non-FISPQ payload did not send FISPQ context',
);
assert(
  sourceTraceCitesFispq([]) === false,
  'sending FISPQ as context does not imply sourceTrace citation',
);
assert(
  sourceTraceCitesFispq([{ source: 'Cadastro interno' }]) === false,
  'unrelated sourceTrace does not count as FISPQ citation',
);
assert(
  sourceTraceCitesFispq([{ source: 'FISPQ seção 11' }]) === true,
  'model-cited FISPQ is visible in sourceTrace as-is',
);
assert(
  FISPQ_AI_PROVIDED_CONTEXT_CAPTION === 'Contexto fornecido à IA: FISPQ',
  'provided-context caption does not claim the model used FISPQ',
);

console.log('chemical-fispq-ai-suggestion-context.util.spec.ts ok');
