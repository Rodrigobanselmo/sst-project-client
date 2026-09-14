import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEstablishmentGroup } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';
import { queryClient } from 'core/services/queryClient';
import { establishmentGroupsPath } from 'core/services/hooks/queries/useQueryEstablishmentGroups';

function invalidateEstablishmentGroupQueries() {
  queryClient.invalidateQueries([QueryEnum.ESTABLISHMENT_GROUPS]);
  queryClient.invalidateQueries([QueryEnum.COMPANY]);
}

export function useMutCreateEstablishmentGroup() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: { name: string; sortOrder?: number }) => {
      if (!companyId) return null;
      const response = await api.post<IEstablishmentGroup>(
        establishmentGroupsPath(companyId),
        data,
      );
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateEstablishmentGroupQueries();
        enqueueSnackbar('Grupo criado com sucesso', { variant: 'success' });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error?.response?.data?.message ?? 'Erro ao criar grupo',
          { variant: 'error' },
        );
      },
    },
  );
}

export function useMutUpdateEstablishmentGroup() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: { id: string; name?: string; sortOrder?: number }) => {
      if (!companyId) return null;
      const { id, ...body } = data;
      const response = await api.patch<IEstablishmentGroup>(
        `/establishment-groups/${id}/${companyId}`,
        body,
      );
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateEstablishmentGroupQueries();
        enqueueSnackbar('Grupo atualizado com sucesso', { variant: 'success' });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error?.response?.data?.message ?? 'Erro ao atualizar grupo',
          { variant: 'error' },
        );
      },
    },
  );
}

export function useMutDeleteEstablishmentGroup() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (id: string) => {
      if (!companyId) return null;
      const response = await api.delete(
        `/establishment-groups/${id}/${companyId}`,
      );
      return response.data as { id: string; unlinkedWorkspaceIds: string[] };
    },
    {
      onSuccess: () => {
        invalidateEstablishmentGroupQueries();
        enqueueSnackbar(
          'Grupo excluído. Os estabelecimentos não foram removidos.',
          { variant: 'success' },
        );
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error?.response?.data?.message ?? 'Erro ao excluir grupo',
          { variant: 'error' },
        );
      },
    },
  );
}

export function useMutAssignEstablishmentGroupWorkspaces() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: { id: string; add?: string[]; remove?: string[] }) => {
      if (!companyId) return null;
      const { id, ...body } = data;
      const response = await api.patch<IEstablishmentGroup>(
        `/establishment-groups/${id}/workspaces/${companyId}`,
        body,
      );
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateEstablishmentGroupQueries();
        enqueueSnackbar('Estabelecimentos do grupo atualizados', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error?.response?.data?.message ??
            'Erro ao atualizar estabelecimentos do grupo',
          { variant: 'error' },
        );
      },
    },
  );
}
