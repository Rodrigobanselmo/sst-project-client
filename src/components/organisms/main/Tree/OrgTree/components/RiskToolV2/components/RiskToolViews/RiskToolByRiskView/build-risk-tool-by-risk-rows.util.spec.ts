/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolByRiskView/build-risk-tool-by-risk-rows.util.spec.ts
 */
import assert from 'node:assert/strict';

import { ViewsDataEnum as V1ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import {
  buildRiskToolByRiskRows,
  filterRiskToolByRiskRows,
  getRiskToolByRiskGhoName,
  riskToolByRiskRowIds,
} from './build-risk-tool-by-risk-rows.util';

const REFINARIA = 'ws-refinaria';
const TERMINAL = 'ws-terminal';

const gho = (values: Partial<IGho>) =>
  ({ workspaceIds: [], type: undefined, description: '', ...values }) as IGho;
const rd = (values: Partial<IRiskData>) =>
  ({ riskId: 'risk-1', companyId: 'c', ...values }) as IRiskData;

const ghos = [
  gho({ id: 'g7', name: 'GSE 07 — Operação' }),
  gho({ id: 'g6', name: 'GSE 06 — Manutenção', workspaceIds: [REFINARIA, TERMINAL] }),
  gho({ id: 'g8', name: 'GSE 08 — Terminal', workspaceIds: [TERMINAL] }),
  gho({ id: 'g-empty', name: 'GSE sem vínculo' }),
  gho({ id: 'post', type: HomoTypeEnum.WORKSTATION, name: 'x', description: 'Posto A(//)extra' }),
  gho({ id: 'env', type: HomoTypeEnum.ENVIRONMENT, name: 'y', description: 'Ambiente B(//)z' }),
];

const riskDataList = [
  rd({ id: 'rfd-7', homogeneousGroupId: 'g7' }),
  rd({ id: 'rfd-6', homogeneousGroupId: 'g6' }),
  rd({ id: 'rfd-6-old', homogeneousGroupId: 'g6', endDate: new Date('2024-01-01') }),
  rd({ id: 'rfd-6-older', homogeneousGroupId: 'g6', endDate: new Date('2023-01-01') }),
  rd({ id: 'rfd-8', homogeneousGroupId: 'g8', canEditOnThisEntity: false }),
  rd({ id: 'rfd-post', homogeneousGroupId: 'post' }),
  rd({ id: 'rfd-env', homogeneousGroupId: 'env' }),
  rd({ id: 'rfd-hier', homogeneousGroupId: 'hierarchy-x' }),
  rd({ id: 'rfd-7', homogeneousGroupId: 'g7' }),
];

// --- GSE, sem estabelecimento: uma linha por registro, ativos e encerrados separados ---
{
  const rows = buildRiskToolByRiskRows({ ghos, riskDataList, viewData: V1ViewsDataEnum.GSE });

  assert.deepEqual(
    rows.active.map((r) => r.rowId),
    ['rfd-6', 'rfd-7', 'rfd-8'],
    'ativos ordenados pelo nome do GSE, sem duplicar registro',
  );
  assert.deepEqual(
    rows.historical.map((r) => r.rowId),
    ['rfd-6-old', 'rfd-6-older'],
    'encerrados à parte, mais recentes primeiro',
  );
  assert.equal(rows.active.some((r) => r.gho.id === 'g-empty'), false, 'GSE sem vínculo não vira linha');
  assert.equal(rows.active.some((r) => r.rowId === 'rfd-hier'), false);

  // Somente leitura: encerrado ou sem permissão de edição nesta entidade
  assert.equal(rows.historical.every((r) => r.isHistorical && r.readOnly), true);
  assert.equal(rows.active.find((r) => r.rowId === 'rfd-8')?.readOnly, true);
  assert.equal(rows.active.find((r) => r.rowId === 'rfd-6')?.readOnly, false);

  // Cabeçalho: nome do GSE e GSE real (com estabelecimentos) para a gravação
  const g6 = rows.active.find((r) => r.rowId === 'rfd-6');
  assert.equal(g6?.ghoName, 'GSE 06 — Manutenção');
  assert.deepEqual(g6?.gho.workspaceIds, [REFINARIA, TERMINAL]);

  // Ids conhecidos pelo contexto de expansão (todos começam recolhidos)
  assert.deepEqual(riskToolByRiskRowIds(rows), [
    'rfd-6',
    'rfd-7',
    'rfd-8',
    'rfd-6-old',
    'rfd-6-older',
  ]);
}

// --- Estabelecimento selecionado: só GSEs vinculados a ele ---
{
  const refinaria = buildRiskToolByRiskRows({
    ghos,
    riskDataList,
    viewData: V1ViewsDataEnum.GSE,
    workspaceId: REFINARIA,
  });
  assert.deepEqual(
    refinaria.active.map((r) => r.rowId),
    ['rfd-6', 'rfd-7'],
    'GSE 08 (só Terminal) sai; GSE sem estabelecimento declarado continua',
  );
  const terminal = buildRiskToolByRiskRows({
    ghos,
    riskDataList,
    viewData: V1ViewsDataEnum.GSE,
    workspaceId: TERMINAL,
  });
  assert.deepEqual(terminal.active.map((r) => r.rowId), ['rfd-6', 'rfd-7', 'rfd-8']);
}

// --- Mesmo recorte de tipos da V1 ---
{
  const characterization = buildRiskToolByRiskRows({
    ghos,
    riskDataList,
    viewData: V1ViewsDataEnum.CHARACTERIZATION,
  });
  assert.deepEqual(characterization.active.map((r) => r.rowId), ['rfd-post']);
  assert.equal(characterization.active[0].ghoName, 'Posto A');

  const environment = buildRiskToolByRiskRows({
    ghos,
    riskDataList,
    viewData: V1ViewsDataEnum.ENVIRONMENT,
  });
  assert.deepEqual(environment.active.map((r) => r.rowId), ['rfd-env']);
  assert.equal(environment.active[0].ghoName, 'Ambiente B');

  const hierarchy = buildRiskToolByRiskRows({
    ghos,
    riskDataList,
    viewData: V1ViewsDataEnum.HIERARCHY,
  });
  assert.deepEqual(riskToolByRiskRowIds(hierarchy), []);
}

// --- Pesquisa e entradas inválidas ---
{
  const rows = buildRiskToolByRiskRows({ ghos, riskDataList, viewData: V1ViewsDataEnum.GSE });
  assert.deepEqual(
    filterRiskToolByRiskRows(rows.active, 'manutencao').map((r) => r.rowId),
    ['rfd-6'],
    'sem acento/caixa',
  );
  assert.equal(filterRiskToolByRiskRows(rows.active, '  ').length, 3);
  assert.deepEqual(
    buildRiskToolByRiskRows({ ghos: null, riskDataList: undefined, viewData: V1ViewsDataEnum.GSE }),
    { active: [], historical: [] },
  );
  assert.equal(getRiskToolByRiskGhoName({ name: 'GSE 01', type: undefined, description: '' }), 'GSE 01');
}

console.log('build-risk-tool-by-risk-rows.util.spec.ts ok');
