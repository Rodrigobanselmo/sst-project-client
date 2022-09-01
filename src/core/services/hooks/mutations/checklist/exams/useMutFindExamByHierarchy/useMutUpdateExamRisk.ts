import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExamsByHierarchyRiskData } from 'core/interfaces/api/IExam';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IQueryExamHierarchy {
  search?: string | null;
  companyId?: string;
  hierarchyId?: string;
  employeeId?: number;
}

export async function findExamHierarchy(query: IQueryExamHierarchy) {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const hierarchyId = query.hierarchyId;
  const queries = queryString.stringify(query);

  const response = await api.get<
    IPaginationResult<IExamsByHierarchyRiskData[]>
  >(
    `${
      ApiRoutesEnum.EXAM
    }/hierarchy/${hierarchyId}/${companyId}?take=${''}&skip=${''}&${queries}`,
  );

  return response.data;
}

export function useMutFindExamByHierarchy() {
  const { companyId: userCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = userCompanyId;

  return useMutation(
    async (data: IQueryExamHierarchy) =>
      findExamHierarchy({ companyId, ...data }),
    {
      onSuccess: async (data) => {
        const response = {
          data: data?.data || ([] as IExamsByHierarchyRiskData[]),
          count: data?.count || 0,
        };

        return { data: response.data, count: response.count };
      },
      onError: (error: IErrorResp) => {
        if (error.response.status == 400)
          enqueueSnackbar('Você não tem permissão para editar esse dado', {
            variant: 'error',
          });
        else {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}
