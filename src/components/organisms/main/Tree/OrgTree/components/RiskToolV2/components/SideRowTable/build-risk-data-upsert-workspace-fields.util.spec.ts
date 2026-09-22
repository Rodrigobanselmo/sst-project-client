/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/build-risk-data-upsert-workspace-fields.util.spec.ts
 */
import assert from 'node:assert/strict';

import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';

import {
  buildRiskDataUpsertWorkspaceFields,
  isRiskToolHierarchyUpsertContext,
} from './build-risk-data-upsert-workspace-fields.util';

/**
 * Espelha o call-site RiskToolSingleRiskRow após a correção:
 * isHierarchy vem de riskAdd.viewData (enum RiskTool), não de `'childrenIds' in gho`.
 */
function composeUpsertWorkspaceFields(params: {
  viewData?: ViewsDataEnum;
  isOriginEdit?: boolean;
  /** Simula GHO de Caracterização com chave childrenIds injetada (não deve influenciar). */
  ghoWithChildrenIds?: boolean;
  hierarchyWorkspaceId?: string;
  explicitWorkspaceId?: string;
  routeWorkspaceId?: string;
  tabWorkspaceId?: string;
}) {
  // A presença estrutural de childrenIds NÃO entra na decisão.
  void params.ghoWithChildrenIds;
  const isHierarchy = isRiskToolHierarchyUpsertContext({
    viewData: params.viewData,
    isOriginEdit: params.isOriginEdit,
  });
  return {
    isHierarchy,
    fields: buildRiskDataUpsertWorkspaceFields({
      isHierarchy,
      hierarchyWorkspaceId: params.hierarchyWorkspaceId,
      explicitWorkspaceId: params.explicitWorkspaceId,
      routeWorkspaceId: params.routeWorkspaceId,
      tabWorkspaceId: params.tabWorkspaceId,
    }),
  };
}

// A) CHARACTERIZATION com gho.childrenIds + tabWorkspaceId → workspaceId, sem type HIERARCHY
{
  const { isHierarchy, fields } = composeUpsertWorkspaceFields({
    viewData: ViewsDataEnum.CHARACTERIZATION,
    ghoWithChildrenIds: true,
    tabWorkspaceId: 'wsNR15',
  });
  assert.equal(isHierarchy, false);
  assert.deepEqual(fields, { workspaceId: 'wsNR15' });
  assert.equal('type' in fields, false);
}

// B) HIERARCHY verdadeiro: type + workspace hierárquico; tabWorkspaceId não interfere
{
  const { isHierarchy, fields } = composeUpsertWorkspaceFields({
    viewData: ViewsDataEnum.HIERARCHY,
    hierarchyWorkspaceId: 'ws-hier',
    tabWorkspaceId: 'wsNR15',
    explicitWorkspaceId: 'ws-should-not-win',
  });
  assert.equal(isHierarchy, true);
  assert.deepEqual(fields, {
    type: HomoTypeEnum.HIERARCHY,
    workspaceId: 'ws-hier',
  });
}

// C) explicitWorkspaceId tem prioridade no contexto não-hierárquico
{
  const { fields } = composeUpsertWorkspaceFields({
    viewData: ViewsDataEnum.CHARACTERIZATION,
    ghoWithChildrenIds: true,
    explicitWorkspaceId: 'ws-explicit',
    tabWorkspaceId: 'wsNR15',
  });
  assert.deepEqual(fields, { workspaceId: 'ws-explicit' });
}

// D) sem contexto: não inventa workspaceId
{
  const { fields } = composeUpsertWorkspaceFields({
    viewData: ViewsDataEnum.CHARACTERIZATION,
    ghoWithChildrenIds: true,
  });
  assert.deepEqual(fields, {});
}

// originEdit nunca é HIERARCHY (mesmo com viewData HIERARCHY)
assert.equal(
  isRiskToolHierarchyUpsertContext({
    viewData: ViewsDataEnum.HIERARCHY,
    isOriginEdit: true,
  }),
  false,
);

// path workspaceId (rota de edição) antes de tabWorkspaceId
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: false,
    routeWorkspaceId: 'ws-path',
    tabWorkspaceId: 'wsNR15',
  }),
  { workspaceId: 'ws-path' },
);

// HIERARCHY sem embutido: mantém chave undefined (legado); não inventa tab
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: true,
    hierarchyWorkspaceId: undefined,
    tabWorkspaceId: 'wsNR15',
  }),
  {
    type: HomoTypeEnum.HIERARCHY,
    workspaceId: undefined,
  },
);

console.log('build-risk-data-upsert-workspace-fields.util.spec.ts: ok');
