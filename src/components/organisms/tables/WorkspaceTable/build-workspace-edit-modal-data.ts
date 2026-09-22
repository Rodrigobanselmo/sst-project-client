import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { PreferredNoiseCriterionEnum } from 'core/constants/maps/preferred-noise-criterion';
import { IWorkspace } from 'core/interfaces/api/ICompany';

/**
 * Monta o initialData do modal de edição a partir da row da tabela.
 * preferredNoiseCriterion é copiado do row; ausência fica undefined e o
 * useEditWorkspace normaliza para NHO01_Q3 no hydrate.
 */
export function buildWorkspaceEditModalData(
  row: IWorkspace,
): Partial<typeof initialWorkspaceState> {
  return {
    cep: row?.address?.cep,
    number: row?.address?.number,
    city: row?.address?.city,
    complement: row?.address?.complement,
    state: row?.address?.state,
    street: row?.address?.street,
    neighborhood: row?.address?.neighborhood,
    description: row?.description,
    name: row?.name,
    id: row?.id,
    status: row?.status,
    companyJson: row?.companyJson,
    logoUrl: row?.logoUrl,
    hasFirstAidService: row?.hasFirstAidService ?? null,
    firstAidServiceDescription: row?.firstAidServiceDescription || '',
    preferredNoiseCriterion: row?.preferredNoiseCriterion
      ? (row.preferredNoiseCriterion as PreferredNoiseCriterionEnum)
      : undefined,
  };
}
