/**
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskTool/utils/risk-view-workspace.util.spec.ts
 */
import assert from 'node:assert/strict';

import { QueryClient } from 'react-query';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import {
  riskDataByRiskQueryKey,
  riskDataByRiskQueryKeyPrefix,
  riskFactorDataByGhoQueryKeyPrefix,
} from 'core/services/hooks/mutations/checklist/riskData/merge-risk-factor-data-cache.util';
import { prepareWorkspaceProbabilityWrite } from 'core/utils/workspace-probability-evaluation.util';

import { buildResidualOneUpsertPayload } from '../hooks/build-residual-one-upsert-payload.util';
import {
  isResidualRowResolvedForWorkspace,
  resolveResidualProbabilityAfterRecChange,
  withResidualOnlyWhenResolved,
} from './calculateSuggestedResidualProbability.util';
import {
  getBulkResidualOneScope,
  getEligibleForBulkResidualOne,
} from './riskToolResidualEligibility.util';
import { ViewsDataEnum } from './view-data-type.constant';

const COMPANY = 'altus';
const GROUP = 'pgr-1';
const RISK = 'flexoes-coluna';
const MOEVE = 'ws-moeve';
const REFINARIA = 'ws-refinaria';

const adms = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `adm-${index}`,
    recType: 'ADM',
    status: 'ACTIVE',
  }));

const row = (
  id: string,
  homogeneousGroupId: string,
  values: Partial<IRiskData>,
): IRiskData =>
  ({
    id,
    companyId: COMPANY,
    riskId: RISK,
    riskFactorGroupDataId: GROUP,
    homogeneousGroupId,
    recs: adms(4),
    ...values,
  }) as unknown as IRiskData;

/** Payload da API com workspaceId=Refinaria (avaliação vigente do estabelecimento). */
const refinariaRows = [
  row('rfd-06', 'gse-06', { probability: 4, probabilityAfter: 3, probabilityAuthority: 'WORKSPACE', probabilityOrigin: 'MANUAL' }),
  row('rfd-04', 'gse-04', { probability: 3, probabilityAfter: 2, probabilityAuthority: 'WORKSPACE', probabilityOrigin: null }),
  row('rfd-03', 'gse-03', { probability: 3, probabilityAfter: 1, probabilityAuthority: 'SHARED' }),
  row('rfd-05', 'gse-05', { probability: 3, probabilityAfter: 1, probabilityAuthority: 'SHARED' }),
  row('rfd-char-moeve', 'char-moeve', { probability: 3, probabilityAfter: 2, probabilityAuthority: null }),
  row('rfd-char-ref', 'char-ref', { probability: 3, probabilityAfter: 2, probabilityAuthority: null }),
  row('rfd-gse-moeve', 'gse-moeve', { probability: 3, probabilityAfter: 2, probabilityAuthority: 'SHARED' }),
  row('rfd-sem-grupo', 'gse-desconhecido', { probability: 3, probabilityAfter: 2, probabilityAuthority: 'SHARED' }),
];

/** Histórico compartilhado (payload sem workspaceId): residual 1 em todos. */
const sharedRows = refinariaRows.map((item) => {
  const shared = { ...item, probability: 3, probabilityAfter: 1 } as Partial<IRiskData>;
  delete shared.probabilityAuthority;
  delete shared.probabilityOrigin;
  return shared as IRiskData;
});

const groups = [
  { id: 'gse-06', type: null, workspaceIds: [MOEVE, REFINARIA] },
  { id: 'gse-04', type: null, workspaceIds: [MOEVE, REFINARIA] },
  { id: 'gse-03', type: null, workspaceIds: [MOEVE, REFINARIA] },
  { id: 'gse-05', type: null, workspaceIds: [MOEVE, REFINARIA] },
  { id: 'char-moeve', type: HomoTypeEnum.ACTIVITIES, workspaceIds: [MOEVE] },
  { id: 'char-ref', type: HomoTypeEnum.WORKSTATION, workspaceIds: [REFINARIA] },
  { id: 'gse-moeve', type: null, workspaceIds: [MOEVE] },
];

// --- Chave de cache por estabelecimento ---
{
  const moeve = riskDataByRiskQueryKey({ companyId: COMPANY, riskGroupId: GROUP, riskId: RISK, workspaceId: MOEVE });
  const refinaria = riskDataByRiskQueryKey({ companyId: COMPANY, riskGroupId: GROUP, riskId: RISK, workspaceId: REFINARIA });
  const prefix = riskDataByRiskQueryKeyPrefix({ companyId: COMPANY, riskGroupId: GROUP, riskId: RISK });
  assert.notDeepEqual(moeve, refinaria);
  assert.deepEqual(moeve.slice(0, 4), prefix);
  assert.deepEqual(refinaria.slice(0, 4), prefix);
  assert.notDeepEqual(
    prefix,
    riskFactorDataByGhoQueryKeyPrefix({ companyId: COMPANY, riskFactorGroupDataId: GROUP, homogeneousGroupId: 'gse-06' }),
  );
}

// Alternância MOEVE/Refinaria: caches separados; gravação invalida os dois
{
  const client = new QueryClient();
  const keyFor = (workspaceId?: string) =>
    riskDataByRiskQueryKey({ companyId: COMPANY, riskGroupId: GROUP, riskId: RISK, workspaceId });
  client.setQueryData(keyFor(MOEVE), [{ id: 'rfd-06', probability: 1, probabilityAfter: 1 }]);
  client.setQueryData(keyFor(REFINARIA), [{ id: 'rfd-06', probability: 4, probabilityAfter: 3 }]);

  assert.equal((client.getQueryData(keyFor(MOEVE)) as any)[0].probabilityAfter, 1);
  assert.equal((client.getQueryData(keyFor(REFINARIA)) as any)[0].probabilityAfter, 3);

  void client.invalidateQueries(riskDataByRiskQueryKeyPrefix({ companyId: COMPANY, riskGroupId: GROUP, riskId: RISK }), {
    refetchActive: false,
    refetchInactive: false,
  });
  assert.equal(client.getQueryState(keyFor(MOEVE))?.isInvalidated, true);
  assert.equal(client.getQueryState(keyFor(REFINARIA))?.isInvalidated, true);
  client.clear();
}

// --- Elegibilidade do lote ---

// Antes da correção: lista compartilhada não tem elegíveis (botão desabilitado)
assert.equal(getEligibleForBulkResidualOne(sharedRows).length, 0);

// Refinaria: GSE 06 e GSE 04 (+ Elemento Caracterizado da própria Refinaria)
{
  const scope = getBulkResidualOneScope({ riskDataList: refinariaRows, groups, headerWorkspaceId: REFINARIA });
  assert.deepEqual(
    scope.map((item) => [item.riskData.id, item.isCharacterization]),
    [
      ['rfd-06', false],
      ['rfd-04', false],
      ['rfd-char-ref', true],
    ],
  );
}

// Cenário real de homologação (sem elemento caracterizado da Refinaria): 2 GSEs
{
  const homologacao = refinariaRows.filter((item) => item.id !== 'rfd-char-ref');
  const scope = getBulkResidualOneScope({ riskDataList: homologacao, groups, headerWorkspaceId: REFINARIA });
  assert.deepEqual(scope.map((item) => item.riskData.id), ['rfd-06', 'rfd-04']);
}

// Sem estabelecimento: recorte legado, sem filtro por vínculo
{
  const scope = getBulkResidualOneScope({ riskDataList: refinariaRows, groups });
  assert.deepEqual(scope.map((item) => item.riskData.id), getEligibleForBulkResidualOne(refinariaRows).map((item) => item.id));
}

// Grupos ainda não carregados: nada entra com estabelecimento selecionado
assert.equal(getBulkResidualOneScope({ riskDataList: refinariaRows, groups: [], headerWorkspaceId: REFINARIA }).length, 0);

// --- Payload do lote ---
{
  const scope = getBulkResidualOneScope({ riskDataList: refinariaRows, groups, headerWorkspaceId: REFINARIA });
  const prepared = scope.map((item) =>
    prepareWorkspaceProbabilityWrite({
      values: buildResidualOneUpsertPayload(item.riskData, RISK, GROUP, ViewsDataEnum.GSE),
      isQuantity: item.riskData.isQuantity,
      originKind: item.isCharacterization ? 'CHARACTERIZATION' : item.riskData.originKind,
      headerWorkspaceId: REFINARIA,
    }),
  );
  prepared.forEach((result) => assert.equal(result.ok, true));
  const values = prepared.map((result) => (result.ok ? result.values : null)!);

  const gse06 = values.find((value) => value.id === 'rfd-06')!;
  assert.equal(gse06.probabilityAfter, 1);
  assert.equal(gse06.workspaceId, REFINARIA);
  assert.equal('probability' in gse06, false);
  assert.equal('probabilityCriteria' in gse06, false);

  const charRef = values.find((value) => value.id === 'rfd-char-ref')!;
  assert.equal(charRef.workspaceId, undefined);
  assert.equal(charRef.probabilityAfter, 1);

  assert.equal(values.some((value) => value.workspaceId === MOEVE), false);
  assert.equal(values.some((value) => value.id === 'rfd-char-moeve' || value.id === 'rfd-gse-moeve'), false);
}

// --- Residual manual na edição de recomendações ---
{
  const sharedGse06 = sharedRows.find((item) => item.id === 'rfd-06')!;
  const refinariaGse06 = refinariaRows.find((item) => item.id === 'rfd-06')!;
  const removeOne = adms(3);

  // Base compartilhada (bug anterior): recalcularia o residual sobre o MANUAL P3
  assert.equal(
    resolveResidualProbabilityAfterRecChange({
      realProbability: sharedGse06.probability,
      currentResidual: sharedGse06.probabilityAfter,
      previousRecommendations: adms(4),
      nextRecommendations: removeOne,
    }),
    2,
  );

  // Base do estabelecimento: residual manual preservado
  assert.equal(
    resolveResidualProbabilityAfterRecChange({
      realProbability: refinariaGse06.probability,
      currentResidual: refinariaGse06.probabilityAfter,
      previousRecommendations: adms(4),
      nextRecommendations: removeOne,
    }),
    undefined,
  );

  // Linha sem resolução para o estabelecimento: residual sai do envio
  assert.equal(isResidualRowResolvedForWorkspace({ headerWorkspaceId: REFINARIA, riskData: sharedGse06 }), false);
  assert.deepEqual(
    withResidualOnlyWhenResolved({ recs: ['adm-3'], probabilityAfter: 2 }, { headerWorkspaceId: REFINARIA, riskData: sharedGse06 }),
    { recs: ['adm-3'] },
  );

  // Linha resolvida (inclusive authority null) e sem cabeçalho: payload intacto
  assert.equal(isResidualRowResolvedForWorkspace({ headerWorkspaceId: REFINARIA, riskData: refinariaGse06 }), true);
  assert.equal(
    isResidualRowResolvedForWorkspace({
      headerWorkspaceId: REFINARIA,
      riskData: refinariaRows.find((item) => item.id === 'rfd-char-ref'),
    }),
    true,
  );
  assert.deepEqual(
    withResidualOnlyWhenResolved({ recs: ['adm-3'], probabilityAfter: 2 }, { riskData: sharedGse06 }),
    { recs: ['adm-3'], probabilityAfter: 2 },
  );
}

console.log('risk-view-workspace.util.spec: ok');
