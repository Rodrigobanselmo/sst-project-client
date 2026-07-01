import assert from 'node:assert/strict';
import test from 'node:test';

import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

import {
  canEnableAiSuggestButton,
  formatAiSuggestErrorMessage,
  getDefaultSelectedCandidateIds,
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

test('sem selecionados bloqueia aplicação', () => {
  assert.equal(getDefaultSelectedCandidateIds([]).length, 0);
});
