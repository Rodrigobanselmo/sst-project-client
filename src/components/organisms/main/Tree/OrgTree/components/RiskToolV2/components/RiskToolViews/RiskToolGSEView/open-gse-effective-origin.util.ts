import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/view-data-type.constant';
import {
  GSE_WIZARD_STEP,
  GSE_WIZARD_STEP_QUERY_KEY,
  parseOptionalGseWizardStep,
} from 'components/organisms/modals/ModalAddGHO/gse-wizard-steps';
import { CHARACTERIZATION_WIZARD_STEP } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';
import {
  CharacterizationSubTabEnum,
  getCharacterizationSstPath,
} from 'core/constants/characterization-navigation.constants';

import { ModalEnum } from 'core/enums/modal.enums';
import { IRiskData } from 'core/interfaces/api/IRiskData';

export const GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS = {
  ghoId: 'returnGhoId',
  gseWizardStep: 'returnGseWizardStep',
  active: 'returnActive',
  viewData: 'returnViewData',
  tabWorkspaceId: 'returnTabWorkspaceId',
} as const;

export type GseEffectiveOriginReturnTo = {
  ghoId: string;
  tabWorkspaceId?: string;
};

function firstQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getGseEffectiveOriginReturnTo(params: {
  query: Record<string, string | string[] | undefined>;
  selectedGhoId?: string | null;
}): GseEffectiveOriginReturnTo | undefined {
  const fromQuery = firstQueryString(params.query.ghoId);
  const fromSelected = params.selectedGhoId
    ? String(params.selectedGhoId).split('//')[0]
    : '';
  const ghoId = fromQuery || fromSelected;
  if (!ghoId) return undefined;
  return {
    ghoId,
    tabWorkspaceId: firstQueryString(params.query.tabWorkspaceId),
  };
}

export function buildGseEditorReturnHref(params: {
  companyId: string;
  ghoId: string;
  tabWorkspaceId?: string;
}): string {
  const query = new URLSearchParams({
    active: String(CharacterizationSubTabEnum.GSE),
    ghoId: params.ghoId,
    viewData: ViewsDataEnum.GSE,
    [GSE_WIZARD_STEP_QUERY_KEY]: String(GSE_WIZARD_STEP.RISKS),
  });
  if (params.tabWorkspaceId) {
    query.set('tabWorkspaceId', params.tabWorkspaceId);
  }
  return `${getCharacterizationSstPath(params.companyId)}?${query.toString()}`;
}

export function parseGseEffectiveOriginReturn(params: {
  query: Record<string, string | string[] | undefined>;
  companyId?: string;
}): { href: string; ghoId: string } | null {
  const companyId = params.companyId;
  const ghoId = firstQueryString(
    params.query[GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.ghoId],
  );
  if (!companyId || !ghoId) return null;

  const requestedStep = parseOptionalGseWizardStep(
    params.query[GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.gseWizardStep],
  );
  if (requestedStep != null && requestedStep !== GSE_WIZARD_STEP.RISKS) {
    return null;
  }

  return {
    ghoId,
    href: buildGseEditorReturnHref({
      companyId,
      ghoId,
      tabWorkspaceId: firstQueryString(
        params.query[GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.tabWorkspaceId],
      ),
    }),
  };
}

export function buildCharacterizationOriginHref(params: {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  returnTo?: GseEffectiveOriginReturnTo;
}): string {
  const query = new URLSearchParams({
    wizardStep: String(CHARACTERIZATION_WIZARD_STEP.RISKS),
  });
  if (params.returnTo?.ghoId) {
    query.set(
      GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.ghoId,
      params.returnTo.ghoId,
    );
    query.set(
      GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.gseWizardStep,
      String(GSE_WIZARD_STEP.RISKS),
    );
    query.set(
      GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.active,
      String(CharacterizationSubTabEnum.GSE),
    );
    query.set(
      GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.viewData,
      ViewsDataEnum.GSE,
    );
    if (params.returnTo.tabWorkspaceId) {
      query.set(
        GSE_EFFECTIVE_ORIGIN_RETURN_QUERY_KEYS.tabWorkspaceId,
        params.returnTo.tabWorkspaceId,
      );
    }
  }
  return `/dashboard/empresas/${params.companyId}/${params.workspaceId}/caracterizacao-editar/${params.characterizationId}?${query.toString()}`;
}

export type GseEffectiveOriginGsePayload = {
  id: string;
  layout: 'page';
  initialWizardStep: number;
};

export function resolveGseEffectiveOriginAction(params: {
  openOrigin: IRiskData['openOrigin'];
  companyId?: string;
  returnTo?: GseEffectiveOriginReturnTo;
}):
  | { type: 'characterization'; href: string }
  | {
      type: 'gse';
      modal: ModalEnum.GHO_ADD;
      payload: GseEffectiveOriginGsePayload;
    }
  | null {
  const { openOrigin, companyId, returnTo } = params;
  if (!openOrigin) return null;

  if (openOrigin.kind === 'CHARACTERIZATION') {
    if (!companyId || !openOrigin.workspaceId || !openOrigin.id) return null;
    return {
      type: 'characterization',
      href: buildCharacterizationOriginHref({
        companyId,
        workspaceId: openOrigin.workspaceId,
        characterizationId: openOrigin.id,
        returnTo,
      }),
    };
  }

  if (openOrigin.kind === 'GSE' && openOrigin.id) {
    return {
      type: 'gse',
      modal: ModalEnum.GHO_ADD,
      payload: {
        id: openOrigin.id,
        layout: 'page',
        initialWizardStep: GSE_WIZARD_STEP.RISKS,
      },
    };
  }

  return null;
}

export function canEditGseEffectiveOccurrenceHere(
  riskData?: IRiskData,
): boolean {
  if (!riskData?.id || !riskData.homogeneousGroupId) return false;
  if (riskData.isDirect) return false;
  return (
    riskData.originKind === 'CHARACTERIZATION' ||
    riskData.originKind === 'HIERARCHY'
  );
}
