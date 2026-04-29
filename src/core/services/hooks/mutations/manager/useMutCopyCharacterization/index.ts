import { useMutation } from 'react-query';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { v2QueryClient } from '@v2/services/query-client';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

interface ICopyChar {
  companyId?: string;
  companyCopyFromId: string;
  characterizationIds: string[];
  workspaceId: string; // destination workspace (route param)
  sourceWorkspaceId?: string; // source workspace (filter source context)
}

export async function copyChar(data: ICopyChar) {
  if (!data.companyId) return null;
  if (!data.workspaceId) return null;

  const path =
    ApiRoutesEnum.CHARACTERIZATIONS.replace(
      ':companyId',
      data.companyId,
    ).replace(':workspaceId', data.workspaceId) + '/copy';

  const response = await api.post(path, data);
  return response.data;
}

export function useMutCopyCharacterization() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICopyChar) =>
      copyChar({ ...data, companyId: getCompanyId(data) }),
    {
      onSuccess: async () => {
        // Legacy queries (react-query v3)
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATIONS]);
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);
        // V2 queries (@tanstack/react-query) used by current table
        await v2QueryClient.invalidateQueries({
          queryKey: [QueryKeyCharacterizationEnum.CHARACTERIZATIONS],
        });
        await v2QueryClient.refetchQueries({
          queryKey: [QueryKeyCharacterizationEnum.CHARACTERIZATIONS],
          type: 'active',
        });

        enqueueSnackbar('Ambientes e/ou Atividades copiados com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
