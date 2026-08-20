/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/open-gse-effective-origin.util.spec.ts
 */
import assert from 'node:assert/strict';

import { CHARACTERIZATION_WIZARD_STEP } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';
import { CharacterizationSubTabEnum } from 'core/constants/characterization-navigation.constants';
import {
  GSE_WIZARD_STEP,
  GSE_WIZARD_STEP_QUERY_KEY,
} from 'components/organisms/modals/ModalAddGHO/gse-wizard-steps';

import { ModalEnum } from 'core/enums/modal.enums';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import {
  buildCharacterizationOriginHref,
  buildGseEditorReturnHref,
  canEditGseEffectiveOccurrenceHere,
  GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS,
  parseGseEffectiveOriginReturn,
  resolveGseEffectiveOriginAction,
} from './open-gse-effective-origin.util';

assert.equal(
  buildCharacterizationOriginHref({
    companyId: 'c1',
    workspaceId: 'ws-1',
    characterizationId: 'el-op',
  }),
  `/dashboard/empresas/c1/ws-1/caracterizacao-editar/el-op?wizardStep=${CHARACTERIZATION_WIZARD_STEP.RISKS}`,
);

const hrefWithReturn = buildCharacterizationOriginHref({
  companyId: 'c1',
  workspaceId: 'ws-1',
  characterizationId: 'el-op',
  returnTo: { ghoId: 'gse-deten-03', tabWorkspaceId: 'ws-sst' },
});
const hrefWithReturnUrl = new URL(hrefWithReturn, 'https://app.local');
assert.equal(
  hrefWithReturnUrl.searchParams.get('wizardStep'),
  String(CHARACTERIZATION_WIZARD_STEP.RISKS),
);
assert.equal(
  hrefWithReturnUrl.searchParams.get(
    GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.ghoId,
  ),
  'gse-deten-03',
);
assert.equal(
  hrefWithReturnUrl.searchParams.get(
    GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.gseWizardStep,
  ),
  String(GSE_WIZARD_STEP.RISKS),
);
assert.equal(
  hrefWithReturnUrl.searchParams.get(
    GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.active,
  ),
  String(CharacterizationSubTabEnum.GSE),
);
assert.equal(
  hrefWithReturnUrl.searchParams.get(
    GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.viewData,
  ),
  'GSE',
);
assert.equal(
  hrefWithReturnUrl.searchParams.get(
    GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.tabWorkspaceId,
  ),
  'ws-sst',
);

assert.equal(
  parseGseEffectiveOriginReturn({
    companyId: 'c1',
    query: { wizardStep: '4' },
  }),
  null,
);

const parsedReturn = parseGseEffectiveOriginReturn({
  companyId: 'c1',
  query: {
    [GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.ghoId]: 'gse-deten-03',
    [GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.gseWizardStep]: String(
      GSE_WIZARD_STEP.RISKS,
    ),
    [GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.tabWorkspaceId]: 'ws-sst',
  },
});
assert.equal(parsedReturn?.ghoId, 'gse-deten-03');
assert.equal(
  parsedReturn?.href,
  buildGseEditorReturnHref({
    companyId: 'c1',
    ghoId: 'gse-deten-03',
    tabWorkspaceId: 'ws-sst',
  }),
);

const returnHref = new URL(
  buildGseEditorReturnHref({
    companyId: 'c1',
    ghoId: 'gse-deten-03',
    tabWorkspaceId: 'ws-sst',
  }),
  'https://app.local',
);
assert.equal(returnHref.pathname, '/dashboard/empresas/c1/novo/sst');
assert.equal(
  returnHref.searchParams.get('active'),
  String(CharacterizationSubTabEnum.GSE),
);
assert.equal(returnHref.searchParams.get('ghoId'), 'gse-deten-03');
assert.equal(returnHref.searchParams.get('viewData'), 'GSE');
assert.equal(
  returnHref.searchParams.get(GSE_WIZARD_STEP_QUERY_KEY),
  String(GSE_WIZARD_STEP.RISKS),
);
assert.equal(returnHref.searchParams.get('tabWorkspaceId'), 'ws-sst');

assert.equal(
  resolveGseEffectiveOriginAction({
    companyId: 'c1',
    openOrigin: { kind: 'CHARACTERIZATION', id: 'el-op' },
  }),
  null,
);

const characterizationAction = resolveGseEffectiveOriginAction({
  companyId: 'c1',
  openOrigin: {
    kind: 'CHARACTERIZATION',
    id: 'el-op',
    workspaceId: 'ws-1',
  },
  returnTo: { ghoId: 'gse-deten-03' },
});
assert.equal(characterizationAction?.type, 'characterization');
assert.equal(
  characterizationAction && characterizationAction.type === 'characterization'
    ? characterizationAction.href
    : '',
  buildCharacterizationOriginHref({
    companyId: 'c1',
    workspaceId: 'ws-1',
    characterizationId: 'el-op',
    returnTo: { ghoId: 'gse-deten-03' },
  }),
);

const gseAction = resolveGseEffectiveOriginAction({
  companyId: 'c1',
  openOrigin: { kind: 'GSE', id: 'gse-other' },
});
assert.equal(gseAction?.type, 'gse');
if (!gseAction || gseAction.type !== 'gse') {
  throw new Error('expected gse origin action');
}
assert.equal(gseAction.modal, ModalEnum.GHO_ADD);
assert.equal(gseAction.payload.id, 'gse-other');
assert.equal(gseAction.payload.layout, 'page');
assert.equal(gseAction.payload.initialWizardStep, GSE_WIZARD_STEP.RISKS);

assert.equal(
  resolveGseEffectiveOriginAction({
    companyId: 'c1',
    openOrigin: null,
  }),
  null,
);

assert.equal(
  canEditGseEffectiveOccurrenceHere({
    id: 'rfd-el-no-open',
    homogeneousGroupId: 'el-op',
    isDirect: false,
    originKind: 'CHARACTERIZATION',
    openOrigin: null,
  } as IRiskData),
  true,
);

assert.equal(
  canEditGseEffectiveOccurrenceHere({
    id: 'rfd-gse',
    homogeneousGroupId: 'gse-1',
    isDirect: true,
    originKind: 'GSE',
    openOrigin: null,
  } as IRiskData),
  false,
);

assert.equal(
  canEditGseEffectiveOccurrenceHere({
    id: 'rfd-h',
    homogeneousGroupId: 'hg-setor',
    isDirect: false,
    originKind: 'HIERARCHY',
    openOrigin: null,
  } as IRiskData),
  true,
);

assert.equal(
  canEditGseEffectiveOccurrenceHere({
    homogeneousGroupId: 'el-op',
    isDirect: false,
    originKind: 'CHARACTERIZATION',
    openOrigin: { kind: 'CHARACTERIZATION', id: 'el-op' },
  } as IRiskData),
  false,
);

console.log('open-gse-effective-origin.util.spec.ts ok');
