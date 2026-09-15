import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import {
  EmployeeHierarchyTransferPayload,
  getEmployeeTransferErrorMessage,
} from 'components/organisms/modals/ModalTransferEmployeeHierarchy/employee-hierarchy-transfer.util';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeHierarchyHistory } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { invalidateEmployeeOrgViews } from '../../invalidate-employee-org-views';

export type ITransferEmployeeHierarchy = EmployeeHierarchyTransferPayload & {
  companyId?: string;
};

export async function transferEmployeeHierarchy(
  data: ITransferEmployeeHierarchy,
  companyId?: string,
) {
  if (!companyId) return null;

  const body: EmployeeHierarchyTransferPayload = {
    employeeId: data.employeeId,
    hierarchyId: data.hierarchyId,
    startDate: data.startDate,
    motive: data.motive,
    workspaceId: data.workspaceId,
  };
  if (data.subOfficeId) body.subOfficeId = data.subOfficeId;

  const response = await api.post<IEmployeeHierarchyHistory>(
    `${ApiRoutesEnum.EMPLOYEE_HISTORY_HIER}/transfer/${companyId}`,
    body,
  );

  return response.data;
}

export function useMutTransferEmployeeHisHier() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ITransferEmployeeHierarchy) =>
      transferEmployeeHierarchy(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_HIER]);
          invalidateEmployeeOrgViews();
        }

        enqueueSnackbar('Lotação alterada com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(getEmployeeTransferErrorMessage(error), {
          variant: 'error',
        });
      },
    },
  );
}
