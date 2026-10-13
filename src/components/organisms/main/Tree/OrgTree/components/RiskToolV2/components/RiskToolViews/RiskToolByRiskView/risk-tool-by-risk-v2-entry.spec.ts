/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolByRiskView/risk-tool-by-risk-v2-entry.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ViewsDataEnum as V1ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum as V1ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';
import { mergeRiskToolModalData } from 'components/organisms/modals/ModalRiskTool/hooks/merge-risk-tool-modal-data.util';

import { shouldUseRiskToolV2ByRiskView } from './should-use-risk-tool-v2-by-risk-view.util';

const read = (path: string) => readFileSync(resolve(path), 'utf8');
const TREE = 'src/components/organisms/main/Tree/OrgTree/components';

// --- Só "Por risco" aberto pela Caracterização usa a V2 ---
{
  const byRisk = V1ViewTypeEnum.SIMPLE_BY_RISK;
  for (const viewData of [
    V1ViewsDataEnum.GSE,
    V1ViewsDataEnum.ENVIRONMENT,
    V1ViewsDataEnum.CHARACTERIZATION,
  ]) {
    assert.equal(shouldUseRiskToolV2ByRiskView({ byRiskV2: true, viewType: byRisk, viewData }), true);
    assert.equal(shouldUseRiskToolV2ByRiskView({ byRiskV2: false, viewType: byRisk, viewData }), false);
  }
  // Simples e Avançado continuam na V1 mesmo com a marca
  for (const viewType of [V1ViewTypeEnum.SIMPLE_BY_GROUP, V1ViewTypeEnum.MULTIPLE]) {
    assert.equal(
      shouldUseRiskToolV2ByRiskView({ byRiskV2: true, viewType, viewData: V1ViewsDataEnum.GSE }),
      false,
    );
  }
  // Hierarquia e empregado continuam na V1
  assert.equal(
    shouldUseRiskToolV2ByRiskView({ byRiskV2: true, viewType: byRisk, viewData: V1ViewsDataEnum.HIERARCHY }),
    false,
  );
  assert.equal(
    shouldUseRiskToolV2ByRiskView({ byRiskV2: true, viewType: byRisk, viewData: V1ViewsDataEnum.EMPLOYEE }),
    false,
  );
  // Valor da V2 ('CHARACTERIZATION') não é valor da V1
  assert.equal(
    shouldUseRiskToolV2ByRiskView({ byRiskV2: true, viewType: byRisk, viewData: 'CHARACTERIZATION' }),
    false,
  );
}

// --- Marca do modal: cada abertura recomeça desligada; modal empilhado não derruba ---
{
  const closed = { riskGroupId: 'pgr-1', byRiskV2: true };
  assert.deepEqual(mergeRiskToolModalData(closed, { riskGroupId: 'pgr-1' }), {
    riskGroupId: 'pgr-1',
    byRiskV2: false,
  });
  assert.deepEqual(
    mergeRiskToolModalData({ riskGroupId: '', byRiskV2: false }, { riskGroupId: 'pgr-1', byRiskV2: true }),
    { riskGroupId: 'pgr-1', byRiskV2: true },
  );
  // Modal de recomendação aberto por cima: getModalData devolve {}
  assert.deepEqual(mergeRiskToolModalData(closed, {}), closed);
  assert.deepEqual(mergeRiskToolModalData(closed, undefined), closed);
}

// --- Entrada isolada: só o chip "Origem" da Caracterização > Riscos ---
{
  const table = read('src/components/organisms/tables/RiskCompanyTable/RiskCompanyTable.tsx');
  assert.match(table, /openRiskToolByRiskV2 = false/);
  assert.equal((table.match(/byRiskV2: openRiskToolByRiskV2/g) || []).length, 1);

  const stage = read(
    'src/pages/dashboard/empresas/[companyId]/novo/[stage]/components/CharacterizationStage/CharacterizationStage.tsx',
  );
  assert.match(stage, /openRiskToolByRiskV2/);

  for (const page of [
    'src/pages/dashboard/empresas/[companyId]/riscos/index.page.tsx',
    'src/pages/dashboard/empresas/[companyId]/fatores-riscos/index.page.tsx',
    'src/@v2/pages/companies/sector-risk-presence/SectorRiskPresenceView.tsx',
    'src/components/organisms/main/Tree/OrgTree/components/ModalEditCard/components/ModalViewRiskData/index.tsx',
    'src/components/organisms/modals/ModalCopyRiskSelect/index.tsx',
  ]) {
    const source = read(page);
    assert.equal(source.includes('openRiskToolByRiskV2'), false, `${page} continua na V1`);
    assert.equal(source.includes('byRiskV2'), false, `${page} continua na V1`);
  }

  const openHook = read(`${TREE}/RiskTool/hooks/useOpenRiskTool.ts`);
  assert.match(openHook, /\.\.\.\(byRiskV2 \? \{ byRiskV2: true \} : \{\}\)/);

  const modal = read('src/components/organisms/modals/ModalRiskTool/index.tsx');
  assert.match(modal, /byRiskV2=\{data\.byRiskV2\}/);
}

// --- V1: Simples e Avançado intactos; V2 só no ramo marcado ---
{
  const v1 = read(`${TREE}/RiskTool/RiskTool.tsx`);
  assert.match(v1, /shouldUseRiskToolV2ByRiskView\(\{\s*byRiskV2,\s*viewType,\s*viewData: viewDataType,\s*\}\)/);
  assert.match(v1, /viewType === ViewTypeEnum\.SIMPLE_BY_GROUP && \(\s*<RiskToolGSEView riskGroupId=\{riskGroupIdMemo\} \/>/);
  assert.match(v1, /viewType === ViewTypeEnum\.SIMPLE_BY_RISK && \(\s*<RiskToolRiskView/);
  assert.match(v1, /viewType === ViewTypeEnum\.MULTIPLE && \(\s*<SideSelectViewContent/);
  assert.match(v1, /byRiskV2 = false/);
}

// --- Composição V2 reutilizada; GSE e Elementos Caracterizados sem escopo de registro ---
{
  const composition = read(`${TREE}/RiskToolV2/RiskToolByRiskV2.tsx`);
  for (const piece of [
    '<RiskCatalogDndProvider>',
    '<RiskToolWideViewProvider>',
    '<RiskToolWideFrame',
    '<RiskRowsExpandProvider>',
    'wide={wideView ? 1 : 0}',
  ]) {
    assert.ok(composition.includes(piece), piece);
  }

  const view = read(`${TREE}/RiskToolV2/components/RiskToolViews/RiskToolByRiskView/index.tsx`);
  assert.match(view, /expandCtx\.allExpanded \? expandCtx\.collapseAll\(\) : expandCtx\.expandAll\(\)/);
  assert.match(view, /'Recolher todos' : 'Expandir todos'/);
  assert.match(view, /wideCtx\.toggleWideView\(\)/);
  assert.match(view, /Registros encerrados \(somente leitura\)/);
  // Ids conhecidos vêm de todas as linhas (pesquisa não reinicia a expansão)
  assert.match(view, /riskToolByRiskRowIds\(rows\)/);

  const row = read(`${TREE}/RiskToolV2/components/RiskToolViews/RiskToolByRiskView/Row.tsx`);
  assert.match(row, /headerTitle=\{row\.ghoName\}/);
  assert.match(row, /targetGho=\{row\.gho\}/);
  assert.match(row, /<RiskCatalogRecordScope value=\{scope\}>/);
  assert.match(row, /readOnly \? <RiskCatalogDropLock>\{columns\}<\/RiskCatalogDropLock> : columns/);
  assert.match(row, /expandCtx\.isExpanded\(row\.rowId\) : false/);

  // Cabeçalho recolhido mostra inerente e residual (MatrixEquation) — reuso do RiskBox
  const box = read(`${TREE}/RiskToolV2/components/RiskToolViews/RiskToolGSEView/Row/RiskBox/index.tsx`);
  assert.match(box, /label="Inerente"/);
  assert.match(box, /label="Residual"/);
  assert.match(box, /headerTitle \? \(/);

  const expand = read(`${TREE}/RiskToolV2/components/RiskToolViews/RiskToolGSEView/RiskRowsExpandContext.tsx`);
  assert.match(expand, /useState<Set<string>>\(\s*\(\) => new Set\(\),\s*\)/, 'começa recolhido');

  const gseRow = read(`${TREE}/RiskToolV2/components/RiskToolViews/RiskToolGSEView/Row/index.tsx`);
  assert.equal(gseRow.includes('RiskCatalogRecordScope'), false);
  assert.equal(gseRow.includes('targetGho'), false);
  assert.equal(gseRow.includes('headerTitle'), false);

  const single = read(`${TREE}/RiskToolV2/components/SideRowTable/SingleRisk/index.tsx`);
  assert.match(single, /const gho = targetGho \?\? selectedGho;/);
}

console.log('risk-tool-by-risk-v2-entry.spec.ts ok');
