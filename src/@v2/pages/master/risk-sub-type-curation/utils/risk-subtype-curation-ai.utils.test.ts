import assert from 'node:assert/strict';
import test from 'node:test';

import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import {
  canEnableAiSuggestButton,
  formatAiSuggestErrorMessage,
  getDefaultSelectedCandidateIds,
  mergeSuggestBatchResponses,
  parseSubtypeNameTags,
} from './risk-subtype-curation-ai.utils';

test('botão IA habilita só com tipo QUI + subtipo alvo', () => {
  assert.equal(canEnableAiSuggestButton(RiskTypeEnum.QUI, 1), true);
  assert.equal(canEnableAiSuggestButton(RiskTypeEnum.QUI, ''), false);
  assert.equal(canEnableAiSuggestButton(RiskTypeEnum.FIS, 1), false);
  assert.equal(canEnableAiSuggestButton(RiskTypeEnum.FIS, ''), false);
});

test('high/medium sugeridos vêm marcados; low e não sugeridos desmarcados', () => {
  const selected = getDefaultSelectedCandidateIds([
    {
      riskFactorId: 'a',
      defaultSelected: true,
    },
    {
      riskFactorId: 'b',
      defaultSelected: true,
    },
    {
      riskFactorId: 'c',
      defaultSelected: false,
    },
  ]);
  assert.deepEqual(selected, ['a', 'b']);
});

test('erro de IA mostra mensagem clara', () => {
  assert.equal(
    formatAiSuggestErrorMessage({
      response: { data: { message: 'OPENAI_API_KEY ausente' } },
    }),
    'OPENAI_API_KEY ausente',
  );
  assert.match(
    formatAiSuggestErrorMessage(new Error('network')),
    /Não foi possível gerar sugestões de IA/,
  );
});

test('merge acumula candidatos sem duplicar e soma analisados', () => {
  const first = {
    targetSubType: {
      id: 1,
      name: 'A',
      description: null,
      type: RiskTypeEnum.QUI,
      status: StatusEnum.ACTIVE,
    },
    scope: {
      analyzed: 100,
      eligibleTotal: 841,
      truncated: true,
      onlyPcmso: true,
      page: 1,
      limit: 100,
      hasNextPage: true,
      nextPage: 2,
      rangeStart: 1,
      rangeEnd: 100,
      cumulativeAnalyzed: 100,
      batchesLoaded: 1,
    },
    summary: {
      suggestedInclude: 1,
      suggestedExclude: 0,
      lowConfidence: 0,
      includedWithConfidence: 1,
      excludedWithConfidence: 0,
    },
    candidates: [
      {
        riskFactorId: 'a',
        name: 'A',
        cas: null,
        esocialCode: null,
        currentSubTypes: [],
        suggestedInclude: true,
        confidence: 'high' as const,
        rationale: 'ok',
        warnings: [],
        defaultSelected: true,
      },
    ],
    warnings: [],
    model: 'gpt',
    generatedAt: 't1',
  };
  const second = {
    ...first,
    scope: {
      ...first.scope,
      page: 2,
      analyzed: 100,
      rangeStart: 101,
      rangeEnd: 200,
      hasNextPage: true,
      nextPage: 3,
    },
    candidates: [
      {
        riskFactorId: 'a',
        name: 'A dup',
        cas: null,
        esocialCode: null,
        currentSubTypes: [],
        suggestedInclude: false,
        confidence: 'low' as const,
        rationale: 'dup',
        warnings: [],
        defaultSelected: false,
      },
      {
        riskFactorId: 'b',
        name: 'B',
        cas: null,
        esocialCode: null,
        currentSubTypes: [],
        suggestedInclude: true,
        confidence: 'medium' as const,
        rationale: 'ok',
        warnings: [],
        defaultSelected: true,
      },
    ],
    generatedAt: 't2',
  };

  const merged = mergeSuggestBatchResponses(first, second);
  assert.equal(merged.candidates.length, 2);
  assert.equal(merged.candidates[0].riskFactorId, 'a');
  assert.equal(merged.scope.cumulativeAnalyzed, 200);
  assert.equal(merged.scope.batchesLoaded, 2);
  assert.equal(merged.scope.page, 2);
});

test('parseSubtypeNameTags extrai tags entre colchetes', () => {
  assert.deepEqual(parseSubtypeNameTags('Fenóis e cresóis [FEN/HA]'), {
    title: 'Fenóis e cresóis',
    tags: ['[FEN/HA]'],
  });
});
