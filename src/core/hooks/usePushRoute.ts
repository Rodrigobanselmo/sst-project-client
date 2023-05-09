import { useCallback } from 'react';

import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';
import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { initialClinicSelectState } from 'components/organisms/modals/ModalSelectClinics';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { initialDocumentModelsViewState } from 'components/organisms/modals/ModalViewDocumentModels/ModalViewDocumentModels';
import { useRouter } from 'next/router';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { GetCompanyStructureResponse } from 'core/services/hooks/mutations/general/useMutUploadFile/types';
import { useMutSetApplyServiceCompany } from 'core/services/hooks/mutations/manager/company/useMutSetApplyServiceCompany/useMutSetApplyServiceCompany';
import { useMutSetClinicsCompany } from 'core/services/hooks/mutations/manager/company/useMutSetClinicsCompany';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { IQueryDocumentModels } from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';
import { useImportExport } from './useImportExport';

export const usePushRoute = () => {
  const { data: company } = useQueryCompany();
  const { push, asPath } = useRouter();
  const { onOpenRiskToolSelected, onStackOpenModal } = useOpenRiskTool();

  const setClinicsMutation = useMutSetClinicsCompany();
  const setApplyCompanyMutation = useMutSetApplyServiceCompany();
  const { handleUploadTable } = useImportExport();

  const handleAddEmployees = useCallback(() => {
    if (!company.employeeCount && !company.hierarchyCount) {
      handleUploadTable({
        companyId: company.id,
        pathApi: ApiRoutesEnum.UPLOAD_COMPANY_STRUCTURE.replace(
          ':companyId',
          company.id,
        ),
        type: ReportTypeEnum.MODEL_EMPLOYEE,
        payload: {
          createEmployee: true,
          createHierarchy: true,
          createHomo: true,
          createHierOnHomo: true,
        } as GetCompanyStructureResponse,
      });
    } else {
      push({
        pathname: RoutesEnum.EMPLOYEES.replace(':companyId', company.id),
      });
    }
  }, [
    company.employeeCount,
    company.hierarchyCount,
    company.id,
    handleUploadTable,
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
      } as Partial<typeof initialCompanySelectState>);
    },
    [company, onStackOpenModal, setApplyCompanyMutation],
  );

  const handleEditDocumentModel = (
    companyId: string,
    query?: IQueryDocumentModels,
  ) => {
    onStackOpenModal(ModalEnum.DOCUMENTS_MODEL_VIEW, {
      companyId: companyId,
      title: 'Modelo Documento',
      query: {
        companyId: companyId,
        ...query,
      },
    } as typeof initialDocumentModelsViewState);
  };

  const handleGoToRisk = () => {
    const split = asPath.split('?');
    const pathname = split[0];
    const query = split[1] ? '&' + split[1] : '';
    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
      onSelect: (docPgr: IRiskGroupData) => {
        push(pathname + '/?riskGroupId=' + docPgr.id + query, undefined, {
          shallow: true,
        });
      },
    } as Partial<typeof initialDocPgrSelectState>);
  };

  const handleOpenAddRiskModal = useCallback(() => {
    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
      onSelect: (docPgr: IRiskGroupData) =>
        onOpenRiskToolSelected({
          riskGroupId: docPgr.id,
          viewsDataInit: ViewsDataEnum.HIERARCHY,
          viewTypeInit: ViewTypeEnum.SIMPLE_BY_GROUP,
        }),
    } as Partial<typeof initialDocPgrSelectState>);
  }, [onOpenRiskToolSelected, onStackOpenModal]);

  return {
    handleAddCharacterization,
    handleAddEmployees,
    handleAddWorkspace,
    handleAddClinic,
    handleSetApplyServiceCompany,
    setClinicsMutation,
    handleEditDocumentModel,
    handleGoToRisk,
    handleOpenAddRiskModal,
  };
};
