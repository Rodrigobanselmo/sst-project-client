/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-dnd/risk-catalog-record-copy.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { IRiskData } from 'core/interfaces/api/IRiskData';

import {
  buildRiskCatalogBatchSummaryMessage,
  isSameRiskCatalogDropForbidden,
} from './find-risk-catalog-item-match.util';
import { RiskCatalogDndDragItem } from './risk-catalog-dnd.types';
import {
  isRiskCatalogSourceSameAsDestination,
  RECORD_COPY_BLOCKED_EXISTING_CONTROL,
  RECORD_COPY_BLOCKED_NO_WORKSPACE,
  RECORD_COPY_BLOCKED_PLAN_DERIVED,
  resolveRecordCopyBlockedReason,
  withRecordCopySource,
} from './risk-catalog-record-copy.util';

const RISK = 'risk-flexao';
const GSE_06 = 'rfd-gse-06';
const GSE_07 = 'rfd-gse-07';

const item = (values: Partial<RiskCatalogDndDragItem> = {}): RiskCatalogDndDragItem => ({
  kind: 'rec',
  sourceRiskId: RISK,
  name: 'Pausas programadas',
  catalogId: 'rec-1',
  ...values,
});

const riskData = (values: Partial<IRiskData>) =>
  ({ id: GSE_06, riskId: RISK, recs: [], adms: [], engs: [], ...values }) as unknown as IRiskData;

// --- Fora da visualização por risco: regra original (mesmo fator é sempre origem) ---
{
  assert.equal(isRiskCatalogSourceSameAsDestination(item(), { riskId: RISK }), true);
  assert.equal(
    isRiskCatalogSourceSameAsDestination(item({ sourceRiskDataId: GSE_06 }), {
      riskId: RISK,
      riskDataId: GSE_07,
    }),
    true,
    'sem recordScoped, outro registro do mesmo fator continua bloqueado (tela GSE)',
  );
  assert.equal(isRiskCatalogSourceSameAsDestination(item(), { riskId: 'outro-fator' }), false);
  assert.equal(isRiskCatalogSourceSameAsDestination(item(), { riskId: null }), true);

  // Compatibilidade da função antiga
  assert.equal(isSameRiskCatalogDropForbidden(item(), RISK), true);
  assert.equal(isSameRiskCatalogDropForbidden(item(), 'outro-fator'), false);
  assert.equal(isSameRiskCatalogDropForbidden(item(), null), true);
}

// --- Visualização por risco: origem e destino por riskDataId ---
{
  const source = item({ sourceRiskDataId: GSE_06 });
  // Mesmo registro: bloqueado
  assert.equal(
    isRiskCatalogSourceSameAsDestination(source, {
      riskId: RISK,
      riskDataId: GSE_06,
      recordScoped: true,
    }),
    true,
  );
  // Outro GSE do mesmo fator: permitido
  assert.equal(
    isRiskCatalogSourceSameAsDestination(source, {
      riskId: RISK,
      riskDataId: GSE_07,
      recordScoped: true,
    }),
    false,
  );
  // Sem identificar os dois registros: tratado como mesma origem (bloqueia)
  assert.equal(
    isRiskCatalogSourceSameAsDestination(item(), {
      riskId: RISK,
      riskDataId: GSE_07,
      recordScoped: true,
    }),
    true,
  );
  assert.equal(
    isRiskCatalogSourceSameAsDestination(source, { riskId: RISK, recordScoped: true }),
    true,
  );
  assert.equal(
    isSameRiskCatalogDropForbidden(source, RISK, { riskDataId: GSE_07, recordScoped: true }),
    false,
  );
  // Lote: sessão usa os mesmos campos
  assert.equal(
    isRiskCatalogSourceSameAsDestination(
      { sourceRiskId: RISK, sourceRiskDataId: GSE_07 },
      { riskId: RISK, riskDataId: GSE_07, recordScoped: true },
    ),
    true,
  );
}

// --- Categorias que não são copiadas entre GSEs ---
{
  const correspondence = { id: 'rec-ctrl', origin: 'EXISTING_CONTROL', recName: 'Ctrl' };
  const planRec = { id: 'rec-1', origin: 'STANDARD', recName: 'Pausas', status: 'ACTIVE' };
  const source = riskData({ recs: [correspondence, planRec] as any });

  // Correspondência informativa: bloqueada
  assert.equal(
    resolveRecordCopyBlockedReason(item({ catalogId: 'rec-ctrl' }), source),
    RECORD_COPY_BLOCKED_EXISTING_CONTROL,
  );
  // Recomendação comum (mesmo vinculada ao Plano): copiada como vínculo novo
  assert.equal(resolveRecordCopyBlockedReason(item(), source), undefined);

  // Medida implantada sem estabelecimento: não dá para saber se é derivada do Plano
  assert.equal(
    resolveRecordCopyBlockedReason(item({ kind: 'adm', catalogId: 'adm-1' }), riskData({})),
    RECORD_COPY_BLOCKED_NO_WORKSPACE,
  );
  const withWorkspace = riskData({
    riskFactorDataRecDerivedMeasures: [{ derivedRecMedId: 'eng-plan' }] as any,
  });
  assert.equal(
    resolveRecordCopyBlockedReason(item({ kind: 'eng', catalogId: 'eng-plan' }), withWorkspace),
    RECORD_COPY_BLOCKED_PLAN_DERIVED,
  );
  assert.equal(
    resolveRecordCopyBlockedReason(item({ kind: 'eng', catalogId: 'eng-manual' }), withWorkspace),
    undefined,
    'controle manual compartilhado é copiado',
  );
  assert.equal(
    resolveRecordCopyBlockedReason(item({ kind: 'adm', catalogId: 'adm-1' }), withWorkspace),
    undefined,
  );
  // Fontes geradoras e EPIs seguem o fluxo de vínculo existente
  assert.equal(
    resolveRecordCopyBlockedReason(item({ kind: 'generateSource', catalogId: 'gs-1' }), riskData({})),
    undefined,
  );
  assert.equal(
    resolveRecordCopyBlockedReason(item({ kind: 'epi', catalogId: 'epi-1' }), riskData({})),
    undefined,
  );

  // Enriquecimento do item arrastado
  const enriched = withRecordCopySource(item(), source);
  assert.equal(enriched.sourceRiskDataId, GSE_06);
  assert.equal(enriched.catalogStatus, 'ACTIVE');
  assert.equal(enriched.recordCopyBlockedReason, undefined);
  assert.equal(enriched.catalogId, 'rec-1');
  assert.equal(
    withRecordCopySource(item({ catalogId: 'rec-ctrl' }), source).recordCopyBlockedReason,
    RECORD_COPY_BLOCKED_EXISTING_CONTROL,
  );
}

// --- Resumo do lote conta os bloqueados ---
{
  const message = buildRiskCatalogBatchSummaryMessage(
    {
      kind: 'adm',
      totalItems: 3,
      added: 1,
      existedInCatalog: 1,
      created: 0,
      alreadyAttached: 1,
      epiMissing: 0,
      failed: 0,
      blocked: 1,
    },
    'GSE 07',
  );
  assert.match(message, /1 não pode ser copiado entre GSEs/);
}

// --- Hook e componentes: cópia por registro e sem remoção na origem ---
{
  const base = 'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-dnd';
  const hook = readFileSync(resolve(`${base}/useRiskCatalogDndCopy.ts`), 'utf8');
  // Mesmo fator em outro registro: vincula pelo id do próprio item (nunca cria cadastro)
  assert.match(hook, /const sameRiskCatalogMatch[\s\S]*id: String\(item\.catalogId\)/);
  // Ordem: mesma origem → bloqueado → já vinculado → vínculo por id
  const resolveBody = hook.slice(hook.indexOf('const resolveCatalogCopyAction'));
  const order = [
    'isRiskCatalogSourceSameAsDestination(item, destinationIdentity(dest))',
    "status: 'blocked'",
    'alreadyAttached(item.kind, item, dest.riskData)',
    'sameRiskCatalogMatch(item, dest)',
  ].map((needle) => resolveBody.indexOf(needle));
  assert.ok(order.every((idx) => idx >= 0), 'trechos de resolveCatalogCopyAction presentes');
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'ordem das verificações');
  // Cópia só chama o handleSelect do destino; nada de remoção
  assert.equal(/onHandleRemoveSave|handleRemove|deleteMutation/.test(hook), false);

  const drop = readFileSync(resolve(`${base}/RiskCatalogDropColumn.tsx`), 'utf8');
  assert.match(drop, /recordScoped && item\.recordCopyBlockedReason/);
  assert.match(drop, /if \(dropLocked\) return false;/);
  assert.match(drop, /'Copiar para este GSE' : 'Copiar para este fator'/);

  const drag = readFileSync(resolve(`${base}/RiskCatalogDraggableItem.tsx`), 'utf8');
  assert.match(drag, /recordScope \? withRecordCopySource\(item, recordScope\.riskData\) : item/);

  const batch = readFileSync(resolve(`${base}/RiskCatalogBatchCopyButton.tsx`), 'utf8');
  assert.match(batch, /filter\(\(i\) => !i\.recordCopyBlockedReason\)/);
  assert.match(batch, /sourceRiskDataId/);
}

console.log('risk-catalog-record-copy.util.spec.ts ok');
