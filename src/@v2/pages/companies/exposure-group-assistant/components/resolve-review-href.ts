import {
  CharacterizationSubTabEnum,
  getCharacterizationEntityRisksHref,
  getCharacterizationSstPath,
} from 'core/constants/characterization-navigation.constants';
import { RoutesEnum } from 'core/enums/routes.enums';

import type {
  InterpretedRecommendation,
  NarrativeRouteHint,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

function characterizationEditHref(
  companyId: string,
  workspaceId: string | undefined,
  characterizationId: string,
): string | null {
  if (!workspaceId) {
    const query = new URLSearchParams({
      active: String(CharacterizationSubTabEnum.ENVIRONMENTS),
    });
    return `${getCharacterizationSstPath(companyId)}?${query.toString()}`;
  }
  return `/dashboard/empresas/${companyId}/${workspaceId}/caracterizacao-editar/${encodeURIComponent(
    characterizationId,
  )}`;
}

export function resolveReviewHref(params: {
  companyId: string;
  workspaceId?: string;
  recommendation?: Pick<
    InterpretedRecommendation,
    'ctaTarget' | 'routeHint' | 'primaryEntityId' | 'primaryEntityType' | 'kind'
  >;
  nextStep?: { routeHint?: NarrativeRouteHint; code?: string; message?: string };
}): string | null {
  const { companyId, workspaceId, recommendation, nextStep } = params;
  const entityId =
    recommendation?.primaryEntityId != null
      ? String(recommendation.primaryEntityId)
      : undefined;
  const cta = recommendation?.ctaTarget;

  if (cta === 'CHARACTERIZATION_EDIT_RISKS' || cta === 'CHARACTERIZATION_EDIT_ROLES' || cta === 'CHARACTERIZATION_EDIT_DATA') {
    if (entityId && recommendation?.primaryEntityType === 'CHARACTERIZATION') {
      return characterizationEditHref(companyId, workspaceId, entityId);
    }
  }
  if (cta === 'GHO') {
    const base = RoutesEnum.GHOS.replace(':companyId', companyId);
    if (!workspaceId) return base;
    return `${base}?tabWorkspaceId=${encodeURIComponent(workspaceId)}`;
  }
  if (cta === 'HIERARCHY') {
    const base = RoutesEnum.HIERARCHY.replace(':companyId', companyId);
    if (!workspaceId) return base;
    const query = new URLSearchParams({
      tabWorkspaceId: workspaceId,
    });
    if (entityId && recommendation?.primaryEntityType === 'HIERARCHY') {
      query.set('hierarchyId', entityId);
      query.set('openCard', '1');
    }
    return `${base}?${query.toString()}`;
  }
  if (cta === 'EMPLOYEES') {
    return RoutesEnum.EMPLOYEES.replace(':companyId', companyId);
  }
  if (cta === 'ENTITY_RISKS') {
    return getCharacterizationEntityRisksHref({
      companyId,
      tabWorkspaceId: workspaceId,
    });
  }
  if (cta === 'CHARACTERIZATION_LIST') {
    const query = new URLSearchParams({
      active: String(CharacterizationSubTabEnum.ENVIRONMENTS),
    });
    if (workspaceId) query.set('tabWorkspaceId', workspaceId);
    return `${getCharacterizationSstPath(companyId)}?${query.toString()}`;
  }

  const hint = recommendation?.routeHint ?? nextStep?.routeHint;
  if (!hint) {
    return getCharacterizationSstPath(companyId);
  }

  if (hint === 'HIERARCHY') {
    const base = RoutesEnum.HIERARCHY.replace(':companyId', companyId);
    if (!workspaceId) return base;
    const query = new URLSearchParams({
      tabWorkspaceId: workspaceId,
    });
    if (entityId && recommendation?.primaryEntityType === 'HIERARCHY') {
      query.set('hierarchyId', entityId);
      query.set('openCard', '1');
    }
    return `${base}?${query.toString()}`;
  }
  if (hint === 'GHO') {
    const base = RoutesEnum.GHOS.replace(':companyId', companyId);
    if (!workspaceId) return base;
    return `${base}?tabWorkspaceId=${encodeURIComponent(workspaceId)}`;
  }
  if (hint === 'RISKS') {
    return getCharacterizationEntityRisksHref({
      companyId,
      tabWorkspaceId: workspaceId,
    });
  }
  if (hint === 'CHARACTERIZATION') {
    if (entityId && recommendation?.primaryEntityType === 'CHARACTERIZATION') {
      return characterizationEditHref(companyId, workspaceId, entityId);
    }
    const query = new URLSearchParams({
      active: String(CharacterizationSubTabEnum.ENVIRONMENTS),
    });
    if (workspaceId) query.set('tabWorkspaceId', workspaceId);
    return `${getCharacterizationSstPath(companyId)}?${query.toString()}`;
  }
  return getCharacterizationSstPath(companyId);
}
