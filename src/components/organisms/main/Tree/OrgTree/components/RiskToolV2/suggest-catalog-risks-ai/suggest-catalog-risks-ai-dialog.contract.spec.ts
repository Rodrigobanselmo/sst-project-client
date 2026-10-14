import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { filterCatalogOnlyAiSuggestions } from './filter-catalog-only-ai-suggestions.util';
import { resolveCatalogOnlyAiSuggestionFeedback } from './resolve-catalog-only-ai-suggestion-feedback.util';
import { resolveSuggestCatalogRisksContext } from './resolve-suggest-catalog-risks-context.util';
import { ViewsDataEnum } from '../utils/view-data-type.constant';

const root = process.cwd();
const dialog = readFileSync(
  join(
    root,
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/suggest-catalog-risks-ai/SuggestCatalogRisksWithAiDialog.tsx',
  ),
  'utf8',
);
const button = readFileSync(
  join(
    root,
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolTopButtons/SuggestCatalogRisksWithAiButton.tsx',
  ),
  'utf8',
);
const riskTool = readFileSync(
  join(
    root,
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/RiskTool.tsx',
  ),
  'utf8',
);

// Cache ausente não é tratado como catálogo vazio
assert.equal(dialog.includes('getQueryData'), false);
assert.ok(dialog.includes('queryRisk'));
assert.ok(dialog.includes('[QueryEnum.RISK, catalogCompanyId]'));
assert.ok(dialog.includes('catalog === undefined'));
assert.ok(dialog.includes('CATALOG_LOAD_ERROR'));

// companyId do contexto selecionado (RiskTool), não só user.companyId
assert.ok(riskTool.includes('companyId={companyId}'));
assert.ok(button.includes('companyIdProp'));
assert.ok(button.includes('companyIdProp || routeCompanyId'));

// Mesmo diálogo para GSE e Elemento
const gseCtx = resolveSuggestCatalogRisksContext({
  viewDataType: ViewsDataEnum.GSE,
  companyId: 'selected-company',
  riskGroupId: 'rg',
  selectedEntityId: 'gse-1',
  routeWorkspaceId: 'ws-1',
});
const elCtx = resolveSuggestCatalogRisksContext({
  viewDataType: ViewsDataEnum.CHARACTERIZATION,
  companyId: 'selected-company',
  riskGroupId: 'rg',
  selectedEntityId: 'el-1',
  routeWorkspaceId: 'ws-1',
});
assert.equal(gseCtx?.kind, 'gse');
assert.equal(elCtx?.kind, 'characterization');
assert.equal(gseCtx?.companyId, 'selected-company');
assert.equal(elCtx?.companyId, 'selected-company');
assert.ok(button.includes('ViewsDataEnum.GSE'));
assert.ok(button.includes('ViewsDataEnum.CHARACTERIZATION'));
assert.ok(button.includes('SuggestCatalogRisksWithAiDialog'));

// API com sugestões + catálogo já carregado (simula cache vazio pré-fetch)
const base = (id: string) =>
  ({
    id,
    name: id,
    type: 'FIS',
    explanation: 'ok',
    generateSource: '',
    probability: 0,
    recommendedEngineeringMeasures: [],
    recommendedAdministrativeMeasures: [],
    existingEngineeringMeasures: [],
    existingAdministrativeMeasures: [],
    confidence: 1,
  }) as const;

const afterLoad = filterCatalogOnlyAiSuggestions({
  incoming: [base('a'), base('ghost')],
  catalogIds: new Set(['a', 'b']),
  existingDirectRiskIds: new Set(),
});
assert.deepEqual(
  afterLoad.accepted.map((r) => r.id),
  ['a'],
);
assert.equal(afterLoad.discardedInvalidCatalog, 1);

const feedbackEmptyApi = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [],
  recognizedAlreadyLinked: [],
  apiReturnedNewCount: 0,
  apiReturnedAlreadyLinkedCount: 0,
  discardedInvalidCatalog: 0,
  discardedAlreadyLinkedFromNew: 0,
});
assert.ok(feedbackEmptyApi?.message.includes('sem fatores de risco pertinentes'));

assert.ok(dialog.includes('identifiedAlreadyLinkedRisks'));
assert.ok(dialog.includes('Já vinculado'));
assert.ok(
  dialog.includes(
    'Nenhum novo fator de risco pertinente foi identificado',
  ),
);
assert.ok(
  dialog.includes('Fatores identificados que já estão vinculados'),
);
assert.ok(dialog.includes('Novas oportunidades de inclusão'));
assert.ok(dialog.includes('maxWidth="lg"'));
assert.ok(dialog.includes('photoSelection'));
assert.ok(dialog.includes('CatalogOnlyCharacterizationPhotosField'));
assert.ok(dialog.includes('Adicionar foto para análise') === false); // texto no child component
assert.ok(dialog.includes('CatalogOnlyAiIdentificationHistoryPanel'));
assert.ok(dialog.includes('histórico é referência técnica'));
assert.ok(dialog.includes('não confirma risco nem inclui fatores automaticamente'));
assert.ok(dialog.includes('handleAddFromHistory'));
assert.ok(dialog.includes('filterCatalogOnlyHistoryIdsForLink'));
assert.ok(dialog.includes('onAddSelected={handleAddFromHistory}'));
assert.ok(dialog.includes('closeOnSuccess: false'));
// Prioridade visual: Solicitar é secundário; Adicionar no histórico ganha contained quando elegível
assert.ok(dialog.includes('Solicitar sugestões'));
const solicitarIdx = dialog.indexOf('Solicitar sugestões');
assert.ok(solicitarIdx > 0);
const solicitarButtonStart = dialog.lastIndexOf('<Button', solicitarIdx);
assert.ok(solicitarButtonStart >= 0);
const solicitarButtonBlock = dialog.slice(solicitarButtonStart, solicitarIdx);
assert.ok(solicitarButtonBlock.includes('variant="outlined"'));
assert.ok(solicitarButtonBlock.includes('color="primary"'));
assert.equal(solicitarButtonBlock.includes('variant="contained"'), false);

// Experimento A/B: model só quando master escolhe; diagnóstico só master
assert.ok(dialog.includes('resolveCatalogOnlySessionModelForRequest'));
assert.ok(dialog.includes('...(modelOverride ? { model: modelOverride } : {})'));
assert.ok(dialog.includes('Diagnóstico técnico (master)'));
assert.ok(dialog.includes('isSystemMaster'));
assert.ok(button.includes('sessionModelByKind'));
assert.ok(button.includes('CATALOG_ONLY_AI_MODEL_SESSION_DEFAULTS'));

const feedbackCatalogFailMessage =
  'Não foi possível carregar o catálogo de fatores de risco. Tente novamente.';
assert.ok(dialog.includes(feedbackCatalogFailMessage));
assert.notEqual(feedbackEmptyApi?.message, feedbackCatalogFailMessage);

console.log('suggest-catalog-risks-ai-dialog.contract.spec.ts OK');
