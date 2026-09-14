import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';
import { queryClient } from 'core/services/queryClient';
import { setCopyDndActive } from 'store/reducers/hierarchy/hierarchySlice';

export type CopyHierarchyBranchPayload = {
  sourceHierarchyId: string;
  sourceWorkspaceId: string;
  targetParentId: string | null;
  targetWorkspaceId: string;
};

export type CopyHierarchyBranchResultNode = {
  oldId: string;
  newId: string;
  type: string;
  name: string;
  parentId: string | null;
};

export type CopyHierarchyBranchResult = {
  nodes: CopyHierarchyBranchResultNode[];
};

export async function copyHierarchyBranch(
  data: CopyHierarchyBranchPayload,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<CopyHierarchyBranchResult>(
    `${ApiRoutesEnum.HIERARCHY}/copy-branch/${companyId}`,
    data,
  );

  return response.data;
}

export function useMutCopyHierarchyBranch() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();
  const dispatch = useAppDispatch();

  return useMutation(
    async (data: CopyHierarchyBranchPayload) => {
      return copyHierarchyBranch(data, companyId);
    },
    {
      onSuccess: async (resp) => {
        if (!companyId) {
          enqueueSnackbar('ID da empresa não encontrado', {
            variant: 'error',
          });
          return;
        }

        if (resp) {
          await queryClient.invalidateQueries([QueryEnum.HIERARCHY, companyId]);
          dispatch(setCopyDndActive(false));
          enqueueSnackbar('Estrutura copiada com sucesso', {
            variant: 'success',
          });
        }
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error?.response?.data?.message || 'Não foi possível copiar a estrutura',
          { variant: 'error' },
        );
      },
    },
  );
}
