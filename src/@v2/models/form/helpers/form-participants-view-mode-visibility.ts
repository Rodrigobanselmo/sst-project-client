import { FormApplicationScopeTypeEnum } from '@v2/models/form/enums/form-application-scope-type.enum';

export type ShouldShowEstablishmentParticipantViewModesParams = {
  scopeType?: FormApplicationScopeTypeEnum;
  /** FormParticipantsWorkspace (recorte explícito da matriz no híbrido). */
  participantWorkspacesCount: number;
  /** FormApplicationCompany (âncora + filiais convertidas / grupo). */
  participantCompaniesCount: number;
};

/**
 * Exibe modos de agrupamento por estabelecimento no recorte de participantes.
 *
 * Não depende só de participants.workspaces: empresas em FormApplicationCompany
 * também representam estabelecimentos resolvíveis (workspaceName na API).
 */
export function shouldShowEstablishmentParticipantViewModes(
  params: ShouldShowEstablishmentParticipantViewModesParams,
): boolean {
  const { participantWorkspacesCount, participantCompaniesCount } = params;

  if (participantWorkspacesCount > 1) {
    return true;
  }

  if (participantCompaniesCount > 1) {
    return true;
  }

  if (participantCompaniesCount > 0 && participantWorkspacesCount >= 1) {
    return true;
  }

  return false;
}

/** Conta empresas participantes expostas no read do formulário. */
export function countFormApplicationParticipantCompanies(
  companies: { id: string }[] | undefined,
): number {
  return companies?.length ?? 0;
}
