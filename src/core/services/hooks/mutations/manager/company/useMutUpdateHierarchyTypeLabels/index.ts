import { useMutation } from 'react-query';
import { useSnackbar } from 'notistack';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import type { ICompanyHierarchyTypeLabels } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { IErrorResp } from '../../../../../errors/types';

export type IUpdateHierarchyTypeLabels = {
  companyId?: string;
  hierarchyTypeLabels: Partial<Record<HierarchyEnum, string | null>>;
};

export type IHierarchyTypeLabelsResponse = {
  hierarchyTypeLabels: ICompanyHierarchyTypeLabels;
  resolved: Record<HierarchyEnum, string>;
};

export async function updateHierarchyTypeLabels(
  data: IUpdateHierarchyTypeLabels,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IHierarchyTypeLabelsResponse>(
    bindUrlParams({
      path: ApiRoutesEnum.COMPANY_HIERARCHY_TYPE_LABELS,
      pathParams: { companyId },
    }),
    { hierarchyTypeLabels: data.hierarchyTypeLabels },
  );

  return response.data;
}

export function useMutUpdateHierarchyTypeLabels() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ companyId, ...data }: IUpdateHierarchyTypeLabels) =>
      updateHierarchyTypeLabels(data, getCompanyId(companyId)),
    {
      onSuccess: async (result, variables) => {
        if (result) {
          const companyId = getCompanyId(variables.companyId);
          await queryClient.invalidateQueries([QueryEnum.COMPANY, companyId]);
          await queryClient.invalidateQueries([QueryEnum.COMPANIES]);
          enqueueSnackbar('Nomenclatura da hierarquia atualizada', {
            variant: 'success',
          });
        }
        return result;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message ||
            'Não foi possível atualizar a nomenclatura da hierarquia',
          { variant: 'error' },
        );
      },
    },
  );
}
