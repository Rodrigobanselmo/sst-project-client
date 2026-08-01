import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { queryClient as v2QueryClient } from 'layouts/default/providers';

import { IErrorResp } from '../../../../../errors/types';

interface IDeleteGho {
  ids: number[];
  companyId?: string;
}

export async function deleteGho(data: IDeleteGho, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IGho>(
    `${ApiRoutesEnum.GHO}/hierarchy-homo-delete/${companyId}`,
    {
      ...data,
      companyId,
    },
  );

  return {
    data: response.data,
    request: {
      ...data,
      companyId,
    },
  };
}

export function useMutDeleteHierarchyGho() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteGho) => deleteGho(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp?.request) {
          queryClient.invalidateQueries({
            predicate: (query) => {
              return (
                query.queryKey[0] === QueryEnum.CHARACTERIZATION &&
                !!query.queryKey[3]
              );
            },
          });

          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === QueryEnum.GHO && !!query.queryKey[2];
            },
          });

          // Browse V2 da tabela de Elementos (Fase 2 — contagens de cargos).
          void v2QueryClient.invalidateQueries({
            queryKey: [QueryKeyCharacterizationEnum.CHARACTERIZATIONS],
          });
        }

        enqueueSnackbar('Deletado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
