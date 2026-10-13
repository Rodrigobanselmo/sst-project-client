/**
 * Sugestões da IA pendentes nas colunas do RiskToolV2.
 *
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factor-ai-pending.util.spec.ts
 */
import assert from 'node:assert/strict';

import type {
  AiRiskFieldSuggestion,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { RecTypeEnum } from 'project/enum/recType.enum';

import {
  buildModularSuggestionKey,
  mergeExistingRiskReviews,
  removeModularSuggestion,
} from '../../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import {
  buildAiRiskAnalysisSessionKey,
  readAiRiskAnalysisSession,
  writeAiRiskAnalysisSession,
} from '../../../../../../modals/ModalAddCharacterization/utils/ai-risk-analysis-session-storage.util';

import {
  buildPendingAcceptPayload,
  columnForAiField,
  countPendingSuggestionsByColumn,
  pendingActionForField,
  pendingSuggestionsForColumn,
  RiskFactorAiPendingRiskData,
  withoutColumnSuggestions,
} from './risk-factor-ai-pending.util';

const suggestion = (
  field: AiRiskFieldSuggestion['field'],
  values: string[] | number,
  intent?: AiRiskFieldSuggestion['intent'],
): AiRiskFieldSuggestion => ({
  field,
  suggestedValues: values,
  applyMode: field === 'probability' ? 'replace-scalar' : 'append',
  ...(intent ? { intent } : {}),
});

const review = (
  suggestions: AiRiskFieldSuggestion[],
  riskId = 'risk-1',
): ExistingRiskReview => ({
  riskId,
  riskFactorDataId: `rfd-${riskId}`,
  name: 'Ruído',
  suggestions,
});

const emptyRow: RiskFactorAiPendingRiskData = {
  generateSources: [],
  engs: [],
  adms: [],
  recs: [],
  probability: 4,
  probabilityAfter: undefined,
};

const none = new Set<string>();

const pending = (
  reviews: ExistingRiskReview[],
  column: Parameters<typeof pendingSuggestionsForColumn>[0]['column'],
  riskData: RiskFactorAiPendingRiskData | null = emptyRow,
  appliedKeys = none,
  dismissedKeys = none,
) =>
  pendingSuggestionsForColumn({
    reviews,
    riskId: 'risk-1',
    column,
    riskData,
    appliedKeys,
    dismissedKeys,
  });

// Mapeamento para as colunas
{
  const reviews = [
    review([
      suggestion('generateSource', ['Compressor']),
      suggestion('existingEngineeringMeasures', ['Enclausuramento']),
      suggestion('existingAdministrativeMeasures', ['Rodízio de turnos']),
      suggestion('recommendedEngineeringMeasures', ['Barreira acústica']),
      suggestion('recommendedAdministrativeMeasures', ['Treinamento de ruído']),
      suggestion('probability', 3),
      suggestion('observation', ['Medir novamente']),
    ]),
  ];

  assert.deepEqual(pending(reviews, 'source').map((i) => i.value), ['Compressor']);
  assert.deepEqual(pending(reviews, 'eng').map((i) => i.value), ['Enclausuramento']);
  assert.deepEqual(pending(reviews, 'adm').map((i) => i.value), ['Rodízio de turnos']);
  const recs = pending(reviews, 'rec');
  assert.deepEqual(
    recs.map((i) => [i.value, i.recType]),
    [
      ['Barreira acústica', RecTypeEnum.ENG],
      ['Treinamento de ruído', RecTypeEnum.ADM],
    ],
  );
  assert.equal(columnForAiField('probability'), null);
  assert.equal(columnForAiField('observation'), null);
  assert.equal(columnForAiField('generateSource'), 'source');
  assert.equal(
    pendingSuggestionsForColumn({
      reviews,
      riskId: 'risk-2',
      column: 'source',
      riskData: emptyRow,
      appliedKeys: none,
      dismissedKeys: none,
    }).length,
    0,
    'sugestão de outro risco não aparece na linha',
  );

  const modalOnly = withoutColumnSuggestions(reviews);
  assert.deepEqual(
    modalOnly[0].suggestions.map((s) => s.field),
    ['probability', 'observation'],
    'modal geral mantém apenas o que não tem coluna',
  );
}

// Duplicidade: repetida, já cadastrada (caixa, acento, pontuação) e instrução de verificação
{
  const reviews = [
    review([
      suggestion('existingAdministrativeMeasures', [
        'Rodízio de turnos',
        'rodizio de turnos.',
        'Verificar se há rodízio de turnos',
        'Pausas programadas',
      ]),
      suggestion('generateSource', ['Compressor']),
      suggestion('recommendedAdministrativeMeasures', ['Treinamento']),
    ]),
  ];
  const row: RiskFactorAiPendingRiskData = {
    ...emptyRow,
    adms: [{ id: 'adm-1', medName: 'PAUSAS PROGRAMADAS' } as never],
    generateSources: [{ id: 'gs-1', name: 'compressor' } as never],
    recs: [{ id: 'rec-1', recName: 'Treinamento', recType: RecTypeEnum.ENG } as never],
  };

  assert.deepEqual(pending(reviews, 'adm', row).map((i) => i.value), ['Rodízio de turnos']);
  assert.equal(pending(reviews, 'source', row).length, 0);
  assert.deepEqual(
    pending(reviews, 'rec', row).map((i) => i.value),
    ['Treinamento'],
    'recomendação com mesmo nome e outro tipo não é duplicada',
  );
}

// Confirmação obrigatória de controle existente, independente do intent
{
  for (const intent of [undefined, 'identificado', 'verificar', 'implementar'] as const) {
    const reviews = [
      review([
        suggestion('existingEngineeringMeasures', ['Enclausuramento'], intent),
        suggestion('existingAdministrativeMeasures', ['Rodízio'], intent),
      ]),
    ];
    assert.equal(pending(reviews, 'eng')[0].action, 'confirm-existence', `eng/${intent}`);
    assert.equal(pending(reviews, 'adm')[0].action, 'confirm-existence', `adm/${intent}`);
  }
  assert.equal(pendingActionForField('generateSource'), 'add');
  assert.equal(pendingActionForField('recommendedEngineeringMeasures'), 'accept-recommendation');
  assert.equal(pendingActionForField('recommendedAdministrativeMeasures'), 'accept-recommendation');
}

// Payload: add-only, recomendação nunca vira controle e nada toca a probabilidade vigente
{
  const [source] = pending([review([suggestion('generateSource', ['Compressor'])])], 'source');
  const [eng] = pending([review([suggestion('existingEngineeringMeasures', ['Enclausuramento'])])], 'eng');
  const [adm] = pending([review([suggestion('existingAdministrativeMeasures', ['Rodízio'])])], 'adm');
  const [recEng] = pending([review([suggestion('recommendedEngineeringMeasures', ['Barreira'])])], 'rec');
  const [recAdm] = pending([review([suggestion('recommendedAdministrativeMeasures', ['Treinar'])])], 'rec');
  const build = (item: typeof source, riskData = emptyRow, headerWorkspaceId?: string | null) =>
    buildPendingAcceptPayload({
      suggestion: item,
      riskData: { ...riskData, id: 'rfd-risk-1', riskId: 'risk-1' },
      companyId: 'company-1',
      headerWorkspaceId,
    });

  assert.deepEqual(build(source), {
    generateSourcesAddOnly: [{ name: 'Compressor', companyId: 'company-1' }],
  });
  assert.deepEqual(Object.keys(build(eng) || {}), ['engsAddOnly']);
  assert.deepEqual(Object.keys(build(adm) || {}), ['admsAddOnly']);

  for (const payload of [build(source), build(eng), build(adm), build(recEng), build(recAdm)]) {
    assert.ok(payload);
    assert.equal('probability' in payload, false, 'probabilidade vigente nunca é enviada');
    assert.equal('id' in payload, false, 'identidade da linha fica com o handleSelect');
    assert.equal('workspaceId' in payload, false);
  }

  const recEngPayload = build(recEng);
  assert.deepEqual(recEngPayload?.recAddOnly, [
    { recName: 'Barreira', recType: RecTypeEnum.ENG, companyId: 'company-1' },
  ]);
  assert.equal('engsAddOnly' in (recEngPayload || {}), false);
  assert.equal('admsAddOnly' in (recEngPayload || {}), false);
  assert.equal(build(recAdm)?.recAddOnly?.[0].recType, RecTypeEnum.ADM);

  // Residual automático: real 4 + ENG (peso 1,25) → 3.
  assert.equal(recEngPayload?.probabilityAfter, 3);

  // Residual manual (sugestão anterior 3, valor atual 2) é preservado.
  const manualRow = {
    ...emptyRow,
    recs: [{ id: 'rec-1', recName: 'Outra', recType: RecTypeEnum.ENG } as never],
    probabilityAfter: 2,
  };
  assert.equal('probabilityAfter' in (build(recAdm, manualRow) || {}), false);

  // Cabeçalho com estabelecimento e linha sem avaliação própria: residual não é enviado.
  assert.equal('probabilityAfter' in (build(recEng, emptyRow, 'ws-1') || {}), false);
  const resolvedRow = { ...emptyRow, probabilityAuthority: null };
  assert.equal(build(recEng, resolvedRow, 'ws-1')?.probabilityAfter, 3);

  // Correspondência de controle existente não conta como recomendação do residual.
  const correspondenceRow = {
    ...emptyRow,
    recs: [
      { id: 'rec-x', recName: 'Enclausuramento', recType: RecTypeEnum.ENG, origin: 'EXISTING_CONTROL' } as never,
    ],
  };
  assert.equal(build(recAdm, correspondenceRow)?.probabilityAfter, 4);
}

// Descarte e aplicação removem a sugestão das colunas
{
  const reviews = [
    review([suggestion('existingAdministrativeMeasures', ['Rodízio', 'Pausas'])]),
  ];
  const [first] = pending(reviews, 'adm');
  assert.deepEqual(
    pending(reviews, 'adm', emptyRow, none, new Set([first.key])).map((i) => i.value),
    ['Pausas'],
  );
  assert.deepEqual(
    pending(reviews, 'adm', emptyRow, new Set([first.key])).map((i) => i.value),
    ['Pausas'],
  );
  assert.deepEqual(
    pending(removeModularSuggestion(reviews, first.key), 'adm').map((i) => i.value),
    ['Pausas'],
  );

  // Nova análise traz a mesma sugestão de volta: a chave descartada continua valendo.
  const merged = mergeExistingRiskReviews({
    existing: removeModularSuggestion(reviews, first.key),
    incoming: reviews,
  });
  assert.deepEqual(
    pending(merged, 'adm', emptyRow, none, new Set([first.key])).map((i) => i.value),
    ['Pausas'],
  );
}

// Estado compartilhado: o que a análise individual aplica some do resumo da geral
{
  const scoped = [review([suggestion('generateSource', ['Compressor'], 'identificado')])];
  const general = [
    review([
      suggestion('generateSource', ['compressor']),
      suggestion('recommendedEngineeringMeasures', ['Barreira']),
    ]),
  ];
  const shared = mergeExistingRiskReviews({
    existing: mergeExistingRiskReviews({ existing: [], incoming: scoped }),
    incoming: general,
  });
  assert.equal(pending(shared, 'source').length, 1, 'mesma fonte das duas análises aparece uma vez');

  const appliedKey = buildModularSuggestionKey('risk-1', 'generateSource', 'Compressor');
  const applied = new Set([appliedKey]);
  assert.equal(pending(shared, 'source', emptyRow, applied).length, 0);
  assert.deepEqual(
    countPendingSuggestionsByColumn({
      review: shared[0],
      riskData: emptyRow,
      appliedKeys: applied,
      dismissedKeys: none,
    }),
    { source: 0, eng: 0, adm: 0, rec: 1 },
  );
}

// Persistência de pendências e descartes na sessão
{
  const store = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  };

  const key = buildAiRiskAnalysisSessionKey({
    gseId: 'gse-1',
    riskGroupId: 'group-1',
    companyId: 'company-1',
    workspaceId: 'ws-b,ws-a'.split(',').sort().join(','),
  });
  assert.equal(key, 'gse-ai-risk-analysis:company-1:ws-a,ws-b:gse-1:group-1');

  const reviews = [review([suggestion('existingAdministrativeMeasures', ['Rodízio', 'Pausas'])])];
  const dismissedKey = buildModularSuggestionKey('risk-1', 'existingAdministrativeMeasures', 'Pausas');
  writeAiRiskAnalysisSession(key, {
    suggestions: [],
    existingRiskReviews: reviews,
    addedRiskIds: [],
    dismissedRiskIds: [],
    modifiedRisks: {},
    userGuidance: '',
    temporaryDocumentSource: null,
    expandedSuggestionIds: [],
    appliedModularSuggestionKeys: [],
    dismissedModularSuggestionKeys: [dismissedKey],
    hasAnalyzed: true,
  });

  const restored = readAiRiskAnalysisSession(key);
  assert.ok(restored);
  assert.deepEqual(
    pending(
      restored.existingRiskReviews,
      'adm',
      emptyRow,
      new Set(restored.appliedModularSuggestionKeys),
      new Set(restored.dismissedModularSuggestionKeys),
    ).map((i) => i.value),
    ['Rodízio'],
  );

  store.set(key, JSON.stringify({ existingRiskReviews: reviews }));
  assert.deepEqual(
    readAiRiskAnalysisSession(key)?.dismissedModularSuggestionKeys,
    [],
    'sessão antiga sem descartes continua legível',
  );
  delete (globalThis as { window?: unknown }).window;
}

console.log('risk-factor-ai-pending.util.spec: ok');
