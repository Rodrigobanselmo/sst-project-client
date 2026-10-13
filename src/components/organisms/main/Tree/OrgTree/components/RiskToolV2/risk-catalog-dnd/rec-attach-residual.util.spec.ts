/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-dnd/rec-attach-residual.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RecTypeEnum } from 'project/enum/recType.enum';

import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { applyRecBulkResidualForWorkspace } from '../risk-catalog-bulk-add/with-residual-probability-after-rec-change.util';
import {
  buildRecAttachPayload,
  withRecAttachResidual,
} from './rec-attach-residual.util';

const REFINARIA = 'ws-refinaria';

const rec = (id: string, recType: RecTypeEnum) =>
  ({ id, recType, recName: id }) as unknown as IRecMed;

const riskRow = (values: Partial<IRiskData>) =>
  ({ id: 'rfd-06', recs: [], ...values }) as unknown as IRiskData;

/** Linha do histórico compartilhado: sem avaliação do estabelecimento resolvida. */
const unresolved = riskRow({ probability: 3 });
/** Linha com avaliação WORKSPACE do estabelecimento (residual automático). */
const workspaceAuto = riskRow({ probability: 4, probabilityAuthority: 'WORKSPACE' });
/** Linha com avaliação WORKSPACE e residual manual. */
const workspaceManual = riskRow({ probability: 4, probabilityAfter: 1, probabilityAuthority: 'WORKSPACE' });

const engRec = rec('eng-1', RecTypeEnum.ENG);

// --- Arrastar uma recomendação (buildRecAttachPayload) ---
{
  // Linha não resolvida: recomendação entra, residual do histórico não é enviado
  assert.deepEqual(buildRecAttachPayload(engRec, unresolved, REFINARIA), { recs: ['eng-1'] });

  // Linha WORKSPACE resolvida: residual automático recalculado pela avaliação do estabelecimento
  assert.deepEqual(buildRecAttachPayload(engRec, workspaceAuto, REFINARIA), {
    recs: ['eng-1'],
    probabilityAfter: 3,
  });

  // Residual manual do estabelecimento preservado
  assert.deepEqual(buildRecAttachPayload(engRec, workspaceManual, REFINARIA), { recs: ['eng-1'] });

  // Sem estabelecimento: comportamento legado
  assert.deepEqual(buildRecAttachPayload(engRec, unresolved), { recs: ['eng-1'], probabilityAfter: 2 });
  assert.deepEqual(buildRecAttachPayload(engRec, unresolved, null), { recs: ['eng-1'], probabilityAfter: 2 });

  // Elemento caracterizado (authority null) conta como resolvido
  assert.deepEqual(
    buildRecAttachPayload(engRec, riskRow({ probability: 3, probabilityAuthority: null }), REFINARIA),
    { recs: ['eng-1'], probabilityAfter: 2 },
  );
}

// --- Arrastar em lote (ramo 'rec' de applyBatchResults) ---
{
  const payload = {
    recs: ['eng-1'],
    recAddOnly: [{ recName: 'Nova ENG', recType: RecTypeEnum.ENG, companyId: 'c' }],
  };
  const nextRecommendations = [engRec, rec('pending-Nova ENG', RecTypeEnum.ENG)];

  assert.deepEqual(
    withRecAttachResidual({ payload, riskData: unresolved, nextRecommendations, headerWorkspaceId: REFINARIA }),
    payload,
  );
  assert.deepEqual(
    withRecAttachResidual({ payload, riskData: workspaceAuto, nextRecommendations, headerWorkspaceId: REFINARIA }),
    { ...payload, probabilityAfter: 2 },
  );
  assert.deepEqual(
    withRecAttachResidual({ payload, riskData: workspaceManual, nextRecommendations, headerWorkspaceId: REFINARIA }),
    payload,
  );
  assert.deepEqual(
    withRecAttachResidual({ payload, riskData: unresolved, nextRecommendations }),
    { ...payload, probabilityAfter: 1 },
  );
  // Payload original não é mutado
  assert.equal('probabilityAfter' in payload, false);
}

// --- Adição em lote (applyRecBulkResidualForWorkspace) ---
{
  const bulk = (riskData: IRiskData, headerWorkspaceId?: string | null) =>
    applyRecBulkResidualForWorkspace({
      payload: { recs: ['cat-1'] },
      currentRecs: [],
      catalogMatches: [rec('cat-1', RecTypeEnum.ENG)],
      namesToCreate: [],
      recType: RecTypeEnum.ENG,
      realProbability: riskData.probability,
      currentResidual: riskData.probabilityAfter,
      riskData,
      headerWorkspaceId,
    });

  assert.deepEqual(bulk(unresolved, REFINARIA), { recs: ['cat-1'] });
  assert.deepEqual(bulk(workspaceAuto, REFINARIA), { recs: ['cat-1'], probabilityAfter: 3 });
  assert.deepEqual(bulk(workspaceManual, REFINARIA), { recs: ['cat-1'] });
  assert.deepEqual(bulk(unresolved), { recs: ['cat-1'], probabilityAfter: 2 });
}

// --- Hooks usam a proteção ---
{
  const base = 'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2';
  const dndHook = readFileSync(resolve(`${base}/risk-catalog-dnd/useRiskCatalogDndCopy.ts`), 'utf8');
  assert.equal(dndHook.includes('resolveResidualProbabilityAfterRecChange'), false);
  assert.equal(dndHook.includes('headerWorkspaceId,\n          ),'), true);
  assert.equal(dndHook.includes('withRecAttachResidual({'), true);

  const bulkHook = readFileSync(resolve(`${base}/risk-catalog-bulk-add/useRiskCatalogBulkAdd.ts`), 'utf8');
  assert.equal(bulkHook.includes('applyRecBulkResidualForWorkspace({'), true);
  assert.equal(bulkHook.includes('useTabWorkspaceId'), true);
}

console.log('rec-attach-residual.util.spec.ts ok');
