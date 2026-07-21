/**
 * Testes pontuais da camada de explicabilidade FRPS no client.
 * Executar com: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildFrpsExplainabilityCacheKey,
  getConceptualValidationStatusLabel,
  getContextualValidationStatusLabel,
  getFrpsExplanationItemTypeLabel,
  mapAnalysisListItemTypeToExplanationItemType,
} from './frps-explainability.utils';
import { classifyFrpsExplainabilityError } from './frps-explainability-error.util';
import {
  isCompatibleFrpsAvailablePayload,
  normalizeDisplayList,
  normalizeDisplayText,
  normalizePersonLabel,
  toSafeDisplayList,
  toSafeDisplayText,
} from './frps-explainability-safe-content.util';
import {
  frpsContentTypeVariants,
  frpsSourceAvailableFixture,
} from './frps-explainability.fixture';

type FrpsExplanationItemType =
  | 'SOURCE'
  | 'ENGINEERING_RECOMMENDATION'
  | 'ADMINISTRATIVE_RECOMMENDATION';

type FormAiContextualExplanationContent = {
  resumoContextual: string;
  evidenciasAgregadas: string;
  relacaoComFator: string;
  motivoDaSelecao: string;
  adequacaoDaRecomendacao?: string | null;
  leituraDoCenario: 'FAVORAVEL' | 'INTERMEDIARIO' | 'DESFAVORAVEL';
  limitesDeInterpretacao: string;
  orientacaoDeValidacaoProfissional: string;
};

describe('FRPS explainability mapping', () => {
  it('maps fontesGeradoras to SOURCE', () => {
    assert.equal(
      mapAnalysisListItemTypeToExplanationItemType('fontesGeradoras'),
      'SOURCE',
    );
  });

  it('maps medidasEngenhariaRecomendadas to ENGINEERING_RECOMMENDATION', () => {
    assert.equal(
      mapAnalysisListItemTypeToExplanationItemType(
        'medidasEngenhariaRecomendadas',
      ),
      'ENGINEERING_RECOMMENDATION',
    );
  });

  it('maps medidasAdministrativasRecomendadas to ADMINISTRATIVE_RECOMMENDATION', () => {
    assert.equal(
      mapAnalysisListItemTypeToExplanationItemType(
        'medidasAdministrativasRecomendadas',
      ),
      'ADMINISTRATIVE_RECOMMENDATION',
    );
  });

  it('labels item types for UI', () => {
    assert.equal(getFrpsExplanationItemTypeLabel('SOURCE'), 'Fonte geradora');
    assert.equal(
      getFrpsExplanationItemTypeLabel('ENGINEERING_RECOMMENDATION'),
      'Recomendação de engenharia',
    );
    assert.equal(
      getFrpsExplanationItemTypeLabel('ADMINISTRATIVE_RECOMMENDATION'),
      'Recomendação administrativa',
    );
  });
});

describe('FRPS explainability cache key', () => {
  it('prefers itemKey over name and scopes by company/application', () => {
    const key = buildFrpsExplainabilityCacheKey({
      companyId: 'c1',
      applicationId: 'app1',
      analysisId: 'a1',
      itemType: 'SOURCE',
      itemKey: 'catalog:SOURCE:gs-1',
      itemName: 'Pressão por prazos',
    });
    assert.equal(key, 'c1|app1|a1|SOURCE|catalog:SOURCE:gs-1');
  });

  it('falls back to normalized name identity', () => {
    const key = buildFrpsExplainabilityCacheKey({
      companyId: 'c1',
      applicationId: 'app1',
      analysisId: 'a1',
      itemType: 'SOURCE',
      itemName: 'Pressão por prazos',
    });
    assert.match(key, /^c1\|app1\|a1\|SOURCE\|name:pressão por prazos$/i);
  });

  it('keeps different items with same analysis distinct', () => {
    const a = buildFrpsExplainabilityCacheKey({
      companyId: 'c1',
      applicationId: 'app1',
      analysisId: 'a1',
      itemType: 'SOURCE',
      itemName: 'A',
    });
    const b = buildFrpsExplainabilityCacheKey({
      companyId: 'c1',
      applicationId: 'app1',
      analysisId: 'a1',
      itemType: 'ENGINEERING_RECOMMENDATION',
      itemName: 'A',
    });
    assert.notEqual(a, b);
  });

  it('does not reuse cache identity across analyses', () => {
    const a = buildFrpsExplainabilityCacheKey({
      companyId: 'c1',
      applicationId: 'app1',
      analysisId: 'a1',
      itemType: 'SOURCE',
      itemKey: 'catalog:SOURCE:gs-1',
      itemName: 'Pressão por prazos',
    });
    const b = buildFrpsExplainabilityCacheKey({
      companyId: 'c1',
      applicationId: 'app1',
      analysisId: 'a2',
      itemType: 'SOURCE',
      itemKey: 'catalog:SOURCE:gs-1',
      itemName: 'Pressão por prazos',
    });
    assert.notEqual(a, b);
  });
});

describe('FRPS explainability error classification', () => {
  it('does not treat Cannot GET route 404 as ITEM_NOT_FOUND', () => {
    const classified = classifyFrpsExplainabilityError({
      response: {
        status: 404,
        data: {
          statusCode: 404,
          message:
            'Cannot GET /v2/companies/x/forms/applications/y/questions-answers-analysis/z/explain-item',
          error: 'Not Found',
        },
      },
    });
    assert.equal(classified.kind, 'unexpected');
    assert.match(classified.message, /API de explicabilidade|Reinicie a API/i);
  });

  it('keeps ITEM_NOT_FOUND code as item-not-found', () => {
    const classified = classifyFrpsExplainabilityError({
      response: {
        status: 404,
        data: {
          code: 'ITEM_NOT_FOUND',
          message: 'O item não foi encontrado nesta análise.',
        },
      },
    });
    assert.equal(classified.kind, 'not_found');
    assert.match(classified.message, /Atualize a tela/i);
  });
});

describe('FRPS explainability validation labels', () => {
  it('labels conceptual and contextual statuses distinctly', () => {
    assert.equal(
      getConceptualValidationStatusLabel('VALIDATED'),
      'Conhecimento conceitual validado',
    );
    assert.equal(
      getConceptualValidationStatusLabel('DRAFT_AI'),
      'Conhecimento conceitual gerado por IA — pendente de validação',
    );
    assert.equal(
      getContextualValidationStatusLabel('DRAFT_AI'),
      'Justificativa gerada para esta análise',
    );
    assert.equal(
      getContextualValidationStatusLabel('VALIDATED'),
      'Justificativa desta análise validada',
    );
  });
});

describe('FRPS explainability error classification', () => {
  it('classifies not found', () => {
    const result = classifyFrpsExplainabilityError({
      response: { status: 404, data: { message: 'Item não encontrado' } },
    });
    assert.equal(result.kind, 'not_found');
  });

  it('classifies forbidden', () => {
    const result = classifyFrpsExplainabilityError({
      response: { status: 403, data: { message: 'Sem permissão' } },
    });
    assert.equal(result.kind, 'forbidden');
  });

  it('classifies conflict', () => {
    const result = classifyFrpsExplainabilityError({
      response: {
        status: 409,
        data: { message: 'Justificativa contextual REJECTED' },
      },
    });
    assert.equal(result.kind, 'conflict');
  });

  it('classifies AI failure', () => {
    const result = classifyFrpsExplainabilityError({
      response: {
        status: 400,
        data: { message: 'Falha ao gerar justificativa contextual' },
      },
    });
    assert.equal(result.kind, 'ai_failure');
  });

  it('maps CONCEPTUAL_GENERATION_FAILED code', () => {
    const result = classifyFrpsExplainabilityError({
      response: {
        status: 400,
        data: {
          code: 'CONCEPTUAL_GENERATION_FAILED',
          message: 'interno',
        },
      },
    });
    assert.equal(result.kind, 'conceptual_failed');
    assert.match(result.message, /conceitual/i);
  });

  it('maps CONTEXTUAL_GENERATION_FAILED code', () => {
    const result = classifyFrpsExplainabilityError({
      response: {
        status: 400,
        data: {
          code: 'CONTEXTUAL_GENERATION_FAILED',
          message: 'interno',
        },
      },
    });
    assert.equal(result.kind, 'contextual_failed');
    assert.match(result.message, /contextual/i);
  });

  it('maps INVALID_MODEL_RESPONSE code', () => {
    const result = classifyFrpsExplainabilityError({
      response: {
        status: 400,
        data: { code: 'INVALID_MODEL_RESPONSE', message: 'interno' },
      },
    });
    assert.equal(result.kind, 'invalid_response');
    assert.match(result.message, /formato técnico/i);
  });

  it('maps CONTENT_REJECTED code', () => {
    const result = classifyFrpsExplainabilityError({
      response: {
        status: 409,
        data: { code: 'CONTENT_REJECTED', message: 'interno' },
      },
    });
    assert.equal(result.kind, 'conflict');
    assert.match(result.message, /revisão/i);
  });
});

describe('FRPS contextual field visibility rules', () => {
  function shouldShowAdequacao(
    itemType: FrpsExplanationItemType,
    content: FormAiContextualExplanationContent,
  ) {
    return (
      itemType !== 'SOURCE' &&
      typeof content.adequacaoDaRecomendacao === 'string' &&
      content.adequacaoDaRecomendacao.trim().length > 0
    );
  }

  const base: FormAiContextualExplanationContent = {
    resumoContextual: 'resumo',
    evidenciasAgregadas: 'evidencias',
    relacaoComFator: 'relacao',
    motivoDaSelecao: 'motivo',
    leituraDoCenario: 'INTERMEDIARIO',
    limitesDeInterpretacao: 'limites',
    orientacaoDeValidacaoProfissional: 'orientacao',
  };

  it('SOURCE does not show empty adequacao', () => {
    assert.equal(
      shouldShowAdequacao('SOURCE', {
        ...base,
        adequacaoDaRecomendacao: null,
      }),
      false,
    );
  });

  it('recommendation shows adequacao when present', () => {
    assert.equal(
      shouldShowAdequacao('ADMINISTRATIVE_RECOMMENDATION', {
        ...base,
        adequacaoDaRecomendacao: 'Adequada ao padrão observado.',
      }),
      true,
    );
  });
});

describe('FRPS safe content helpers', () => {
  it('toSafeDisplayText ignores plain objects', () => {
    assert.equal(toSafeDisplayText({ foo: 'bar' }), null);
    assert.equal(toSafeDisplayText('  ok  '), 'ok');
    assert.equal(toSafeDisplayText(null), null);
  });

  it('toSafeDisplayList coerces mixed arrays without throwing', () => {
    assert.deepEqual(
      toSafeDisplayList(['a', 2, { text: 'b' }, null, { x: 1 }]),
      ['a', '2', 'b'],
    );
    assert.deepEqual(toSafeDisplayList([]), []);
    assert.deepEqual(toSafeDisplayList('única'), ['única']);
  });

  it('accepts available=true payload with DRAFT statuses', () => {
    assert.equal(
      isCompatibleFrpsAvailablePayload({
        available: true,
        conceptual: {
          id: 'c1',
          itemType: 'SOURCE',
          itemKey: 'catalog:SOURCE:1',
          content: { definition: 'x' },
          validationStatus: 'DRAFT_AI',
        },
        contextual: {
          protectedData: false,
          content: { resumoContextual: 'y' },
          validationStatus: 'DRAFT_AI',
        },
      }),
      true,
    );
  });

  it('rejects legacy/incomplete cache payload', () => {
    assert.equal(
      isCompatibleFrpsAvailablePayload({
        conceptual: { id: 'c1' },
        contextual: { protectedData: false },
      }),
      false,
    );
    assert.equal(
      isCompatibleFrpsAvailablePayload({
        available: true,
        conceptual: {
          id: 'c1',
          itemType: 'SOURCE',
          itemKey: 'k',
          content: null,
          validationStatus: 'VALIDATED',
        },
        contextual: { protectedData: false, content: {} },
      }),
      false,
    );
  });

  it('allows protected contextual without content object', () => {
    assert.equal(
      isCompatibleFrpsAvailablePayload({
        available: true,
        conceptual: {
          id: 'c1',
          itemType: 'SOURCE',
          itemKey: 'k',
          content: {},
          validationStatus: 'VALIDATED',
        },
        contextual: { protectedData: true, itemKey: 'k', label: 'Dados Protegidos' },
      }),
      true,
    );
  });
});

describe('FRPS SOURCE fixture and normalizer robustness', () => {
  it('SOURCE fixture is compatible available=true payload', () => {
    assert.equal(isCompatibleFrpsAvailablePayload(frpsSourceAvailableFixture), true);
  });

  it('measurableQuestions string[] normalizes as list', () => {
    assert.deepEqual(
      normalizeDisplayList(
        frpsSourceAvailableFixture.conceptual.content.measurableQuestions,
      ),
      ['Pergunta mensurável A', 'Pergunta mensurável B'],
    );
  });

  it('measurableQuestions as array of objects extracts known text keys', () => {
    assert.deepEqual(
      normalizeDisplayList(frpsContentTypeVariants.measurableQuestionsAsObjects),
      ['Pergunta objeto A', 'Pergunta objeto B'],
    );
  });

  it('manifestations as string and array both work', () => {
    assert.equal(
      normalizeDisplayText('Manifestações em texto'),
      'Manifestações em texto',
    );
    assert.deepEqual(
      normalizeDisplayList(frpsContentTypeVariants.manifestationsAsArray),
      ['Manifestação 1', 'Manifestação 2'],
    );
  });

  it('validatedBy object does not throw and yields name', () => {
    assert.equal(
      normalizePersonLabel(frpsContentTypeVariants.validatedByObject),
      'Validador Fixture',
    );
    assert.equal(normalizePersonLabel(null), null);
  });

  it('null dates and unknown objects are ignored safely', () => {
    assert.equal(normalizeDisplayText(null), null);
    assert.equal(
      normalizeDisplayText(frpsContentTypeVariants.unknownObject),
      null,
    );
    assert.equal(
      normalizeDisplayText(frpsContentTypeVariants.structuredEvidenceObject),
      null,
    );
  });

  it('contextual absent still keeps conceptual payload valid shape when protected', () => {
    const partial = {
      ...frpsSourceAvailableFixture,
      contextual: {
        protectedData: true as const,
        itemType: 'SOURCE' as const,
        itemKey: 'catalog:SOURCE:fixture-gs-1',
        label: 'Dados Protegidos',
      },
    };
    assert.equal(isCompatibleFrpsAvailablePayload(partial), true);
  });
});
