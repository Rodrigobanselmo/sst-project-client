import { useCallback } from 'react';

import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';
import { initialClinicSelectState } from 'components/organisms/modals/ModalSelectClinics';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialDocumentModelsViewState } from 'components/organisms/modals/ModalViewDocumentModels/ModalViewDocumentModels';
import { useRouter } from 'next/router';

import { AuthPageRoutes } from '@v2/constants/pages/auth.routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutSetClinicsCompany } from 'core/services/hooks/mutations/manager/company/useMutSetClinicsCompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { IQueryDocumentModels } from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';
import { useCharacterizationActions } from './useCharacterizationActions';
import { useCompanyActions } from './useCompanyActions';
import { useEmployeeActions } from './useEmployeeActions';

export const usePushRoute = () => {
  const { data: company } = useQueryCompany();
  const router = useAppRouter();
  const { push, asPath } = useRouter();
  const { onOpenRiskToolSelected, onStackOpenModal } = useOpenRiskTool();
  const { onImportEmployee } = useEmployeeActions();
  const { onEditApplyServiceCompany, onAddWorspace } = useCompanyActions();
  const { onViewCharacterization } = useCharacterizationActions();

  const setClinicsMutation = useMutSetClinicsCompany();

  const handleAddEmployees = useCallback(() => {
    if (!company.employeeCount && !company.hierarchyCount) {
      onImportEmployee({ shouldPush: false });
    } else {
      push({
        pathname: RoutesEnum.EMPLOYEES.replace(':companyId', company.id),
      });
    }
  }, [
    company.employeeCount,
    company.hierarchyCount,
    company.id,
    onImportEmployee,
    push,
  ]);

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

  const handleDocumentControl = useCallback(() => {
    router.push(AuthPageRoutes.DOCUMENTS.TABLE, {
      pathParams: { companyId: company.id },
    });
  }, [company.id, router]);

  return {
    handleAddCharacterization: () => onViewCharacterization({}),
    handleAddEmployees,
    handleAddWorkspace: onAddWorspace,
    handleAddClinic,
    handleSetApplyServiceCompany: onEditApplyServiceCompany,
    setClinicsMutation,
    handleEditDocumentModel,
    handleGoToRisk,
    handleOpenAddRiskModal,
    handleDocumentControl,
  };
};
