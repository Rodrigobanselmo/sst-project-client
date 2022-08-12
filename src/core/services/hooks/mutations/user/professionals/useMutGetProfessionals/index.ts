import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';
import { IQueryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

export async function getProfessional(query: IQueryProfessionals) {
  const queries = queryString.stringify(query);

  const response = await api.get<IProfessional>(
    `${ApiRoutesEnum.PROFESSIONALS}/find?${queries}`,
  );
  return response.data;
}

export function useMutFindFirstProfessional() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(
    async (query: IQueryProfessionals) => getProfessional(query),
    {
      onSuccess: async (resp) => {
        return resp;
      },
      onError: (error: IErrorResp) => {
        // enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
