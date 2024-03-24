import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useImportExport } from 'core/hooks/useImportExport';
import { useModal } from 'core/hooks/useModal';
import { GetCompanyStructureResponse } from 'core/services/hooks/mutations/general/useMutUploadFile/types';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { queryClient } from 'core/services/queryClient';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

type IPerformActions = { shouldPush?: boolean };

export const useEmployeeActions = () => {
  const history = useRouter();
  const { data: company } = useQueryCompany();
  const { onStackOpenModal } = useModal();
  const { handleUploadTable } = useImportExport();

  const onAddEmployee = useCallback(
    async ({ shouldPush }: IPerformActions) => {
      if (shouldPush) {
        await history.push({
          pathname: RoutesEnum.COMPANY_EMPLOYEE.replace(
            ':companyId',
            company.id,
          ),
        });
      }

      onStackOpenModal(ModalEnum.EMPLOYEES_ADD, {
        companeId: company.id,
        company,
      });
    },
    [company, history, onStackOpenModal],
  );

  const onImportEmployee = useCallback(
    async ({ shouldPush }: IPerformActions) => {
      if (shouldPush) {
        await history.push({
          pathname: RoutesEnum.COMPANY_EMPLOYEE.replace(
            ':companyId',
            company.id,
          ),
        });
      }

      handleUploadTable({
        companyId: company.id,
        pathApi: ApiRoutesEnum.UPLOAD_COMPANY_STRUCTURE.replace(
          ':companyId',
          company.id,
        ),
        onUpload: () => {
          queryClient.invalidateQueries([QueryEnum.COMPANY, company.id]);
          queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        },
        title: 'Adicinar Funionários por Planilha',
        type: ReportTypeEnum.MODEL_EMPLOYEE,
        payload: {
          createEmployee: true,
          createHierarchy: true,
          createHomo: true,
          createHierOnHomo: true,
        } as GetCompanyStructureResponse,
      });
    },
    [company.id, handleUploadTable, history],
  );

  const onEditEmployee = useCallback(async () => {
    await history.push({
      pathname: RoutesEnum.EMPLOYEES.replace(':companyId', company.id),
    });
  }, [company, history]);

  return { onAddEmployee, onImportEmployee, onEditEmployee };
};
