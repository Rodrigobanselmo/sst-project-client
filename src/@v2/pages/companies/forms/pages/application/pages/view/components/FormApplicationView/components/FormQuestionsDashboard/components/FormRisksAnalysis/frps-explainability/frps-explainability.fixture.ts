/**
 * Fixture sanitizada com o mesmo shape/tipos do GET explain-item (SOURCE).
 * Sem dados pessoais, respostas individuais ou textos longos reais.
 */
export const frpsSourceAvailableFixture = {
  available: true as const,
  conceptual: {
    id: 'conceptual-fixture-1',
    itemType: 'SOURCE' as const,
    itemKey: 'catalog:SOURCE:fixture-gs-1',
    catalogId: 'fixture-gs-1',
    riskId: 'fixture-risk-1',
    content: {
      definition: 'Definição sanitizada do item.',
      relationToRiskFactor: 'Relação sanitizada com o fator.',
      measurableQuestions: [
        'Pergunta mensurável A',
        'Pergunta mensurável B',
      ],
      organizationalManifestations: 'Manifestações possíveis sanitizadas.',
      favorableSignals: 'Sinais favoráveis sanitizados.',
      intermediateSignals: 'Sinais intermediários sanitizados.',
      unfavorableSignals: 'Sinais desfavoráveis sanitizados.',
      interpretationLimits: 'Limites de interpretação sanitizados.',
      professionalValidationGuidance: 'Orientação profissional sanitizada.',
    },
    validationStatus: 'VALIDATED' as const,
    methodologyVersion: 'frps-explainability-v1',
    contentVersion: 1,
    promptRevision: 1,
    model: 'fixture-model',
    validatedAt: '2026-07-21T12:00:00.000Z',
    validatedByName: 'Usuário Fixture',
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-21T12:00:00.000Z',
  },
  contextual: {
    protectedData: false as const,
    id: 'contextual-fixture-1',
    itemType: 'SOURCE' as const,
    itemKey: 'catalog:SOURCE:fixture-gs-1',
    catalogId: 'fixture-gs-1',
    conceptualExplanationId: 'conceptual-fixture-1',
    content: {
      resumoContextual: 'Resumo contextual sanitizado.',
      evidenciasAgregadas: 'Evidências agregadas sanitizadas.',
      relacaoComFator: 'Relação contextual sanitizada.',
      motivoDaSelecao: 'Motivo da seleção sanitizado.',
      adequacaoDaRecomendacao: null,
      leituraDoCenario: 'INTERMEDIARIO' as const,
      limitesDeInterpretacao: 'Limites contextualizados sanitizados.',
      orientacaoDeValidacaoProfissional: 'Orientação contextual sanitizada.',
    },
    evidenceSummary: {
      probability: 3,
      severity: 3,
      nro: 9,
      questions: [
        {
          questionId: 'q-1',
          questionText: 'Pergunta agregada',
          totalResponses: 10,
          counts: { value1: 1, value2: 2, value3: 3, value4: 2, value5: 2 },
          percents: { value1: 10, value2: 20, value3: 30, value4: 20, value5: 20 },
          evidenceScore: 3,
          predominantIndicator: 'Neutro',
          riskLevel: 'Moderado',
        },
      ],
    },
    participantCount: 10,
    contextHash: 'fixture-hash',
    analysisVersion: 'fixture-version',
    methodologyVersion: 'frps-explainability-v1',
    validationStatus: 'DRAFT_AI' as const,
    promptRevision: 1,
    model: 'fixture-model',
    validatedAt: null,
    validatedByName: null,
    createdAt: '2026-07-21T12:30:00.000Z',
    updatedAt: '2026-07-21T12:30:00.000Z',
  },
};

/** Variantes de tipo para testes de robustez (sem conteúdo sensível). */
export const frpsContentTypeVariants = {
  measurableQuestionsAsObjects: [
    { text: 'Pergunta objeto A' },
    { question: 'Pergunta objeto B' },
    null,
    { unknown: true },
  ],
  manifestationsAsArray: ['Manifestação 1', 'Manifestação 2'],
  validatedByObject: { id: 99, name: 'Validador Fixture' },
  unknownObject: { foo: { bar: 1 }, nested: true },
  structuredEvidenceObject: {
    counts: { value1: 1 },
    percents: { value1: 100 },
  },
};
