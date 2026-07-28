import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export function getPcmsoExaminingPhysiciansPath(
  companyId: string,
  workspaceId?: string | null,
) {
  if (workspaceId) {
    return ApiRoutesEnum.PCMSO_EXAMINING_PHYSICIANS_WORKSPACE.replace(
      ':companyId',
      companyId,
    ).replace(':workspaceId', workspaceId);
  }

  return ApiRoutesEnum.PCMSO_EXAMINING_PHYSICIANS.replace(
    ':companyId',
    companyId,
  );
}

export function getPcmsoExaminingPhysiciansResolvedPath(
  companyId: string,
  workspaceId: string,
) {
  return `${getPcmsoExaminingPhysiciansPath(companyId, workspaceId)}/resolved`;
}

export function getPcmsoExaminingPhysiciansCustomizePath(
  companyId: string,
  workspaceId: string,
) {
  return `${getPcmsoExaminingPhysiciansPath(companyId, workspaceId)}/customize`;
}
