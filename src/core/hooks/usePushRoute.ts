import { useCallback, useState } from 'react';

import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { initialClinicSelectState } from 'components/organisms/modals/ModalSelectClinics';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';

import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { useMutSetApplyServiceCompany } from 'core/services/hooks/mutations/manager/company/useMutSetApplyServiceCompany/useMutSetApplyServiceCompany';
import { useMutSetClinicsCompany } from 'core/services/hooks/mutations/manager/company/useMutSetClinicsCompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useModal } from './useModal';

export const usePushRoute = () => {
  const { data: company } = useQueryCompany();
  const { push } = useRouter();
  const { onStackOpenModal } = useModal();

  const setClinicsMutation = useMutSetClinicsCompany();
  const setApplyCompanyMutation = useMutSetApplyServiceCompany();

  const handleAddEmployees = useCallback(() => {
    if (!company.employeeCount && !company.hierarchyCount) {
      onStackOpenModal(ModalEnum.EMPLOYEES_EXCEL_ADD);
    } else {
      push({
        pathname: RoutesEnum.EMPLOYEES.replace(':companyId', company.id),
      });
    }
  }, [
    company.employeeCount,
    company.hierarchyCount,
    company.id,
    onStackOpenModal,
    push,
  ]);

  const handleAddCharacterization = useCallback(() => {
    const workspaceLength = company?.workspace?.length || 0;
    const goToEnv = (workId: string) => {
      push({
        pathname: `${RoutesEnum.CHARACTERIZATIONS.replace(
          ':companyId',
          company.id,
        ).replace(':workspaceId', workId)}/${CharacterizationEnum.ALL}`,
      });
    };

    if (workspaceLength != 1) {
      const initialWorkspaceState = {
        title: 'Selecione para qual Estabelecimento deseja adicionar',
        onSelect: (workspace: IWorkspace) => goToEnv(workspace.id),
      } as typeof initialWorkspaceSelectState;

      onStackOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
    }

    if (!company?.workspace) return;
    if (workspaceLength == 1) goToEnv(company.workspace[0].id);
  }, [company.id, company?.workspace, onStackOpenModal, push]);

  const handleAddWorkspace = useCallback(() => {
    const data: Partial<typeof initialWorkspaceState> = {
      name: company.type,
      cep: company?.address?.cep,
      number: company?.address?.number,
      city: company?.address?.city,
      complement: company?.address?.complement,
      state: company?.address?.state,
      street: company?.address?.street,
      neighborhood: company?.address?.neighborhood,
    };

    const isFirstWorkspace = company.workspace && company.workspace.length == 0;
    onStackOpenModal(ModalEnum.WORKSPACE_ADD, isFirstWorkspace ? data : {});
  }, [company, onStackOpenModal]);

  const handleAddClinic = useCallback(
    (_company?: ICompany) => {
      const __company = _company || company;

      onStackOpenModal(ModalEnum.CLINIC_SELECT, {
        title: 'Selecione as Clinicas',
        ...(__company?.clinicsAvailable?.length && {
          query: { companyToClinicsId: __company.id },
        }),
        selected:
          __company.clinicsAvailable?.map((clinics) => ({
            id: clinics.clinicId,
          })) || [],
        onSelect: (clinics: ICompany[]) =>
          setClinicsMutation.mutate(
            [...(clinics.length ? clinics : [__company])].map((clinic) => ({
              clinicId: clinic.id,
              companyId: __company.id,
            })),
          ),
        multiple: true,
      } as Partial<typeof initialClinicSelectState>);
    },
    [company, onStackOpenModal, setClinicsMutation],
  );

  const handleSetApplyServiceCompany = useCallback(
    (_company?: ICompany) => {
      const __company = _company || company;

      onStackOpenModal(ModalEnum.COMPANY_SELECT, {
        title: 'Selecione as empresas que tem acesso aos seus dados',
        ...(__company.receivingServiceContracts?.length && {
          query: {
            companiesIds: __company.receivingServiceContracts.map(
              (rec) => rec.applyingServiceCompanyId,
            ),
          },
        }),
        selected:
          __company?.receivingServiceContracts?.map((rec) => ({
            id: rec.applyingServiceCompanyId,
          })) || [],
        onSelect: (company: ICompany[]) =>
          setApplyCompanyMutation.mutate({
            companyId: __company.id,
            applyServiceIds: company.map(({ id }) => id),
          }),
        multiple: true,
      } as Partial<typeof initialClinicSelectState>);
    },
    [company, onStackOpenModal, setApplyCompanyMutation],
  );

  return {
    handleAddCharacterization,
    handleAddEmployees,
    handleAddWorkspace,
    handleAddClinic,
    handleSetApplyServiceCompany,
    setClinicsMutation,
  };
};
