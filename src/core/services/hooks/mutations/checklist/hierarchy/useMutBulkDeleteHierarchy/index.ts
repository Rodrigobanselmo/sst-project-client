import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export type HierarchyBulkDeleteBlockReason =
  | 'Possui funcionários vinculados'
  | 'Possui histórico de funcionários'
  | 'Possui descendentes com vínculos'
  | 'Nó não encontrado nesta empresa'
  | string;

export interface IBulkDeleteHierarchyResponse {
  requested: number;
  normalizedRoots: number;
  deleted: number;
  deletedIds: string[];
  blocked: Array<{
    id: string;
    name: string;
    type: string;
    reason: HierarchyBulkDeleteBlockReason;
  }>;
  typeSummary: Partial<Record<HierarchyEnum | string, number>>;
  dryRun: boolean;
}

export interface IBulkDeleteHierarchyPayload {
  ids: string[];
  confirm?: boolean;
}

export async function bulkDeleteHierarchy(
  payload: IBulkDeleteHierarchyPayload,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IBulkDeleteHierarchyResponse>(
    `${ApiRoutesEnum.HIERARCHY}/bulk-delete/${companyId}`,
    payload,
  );

  return response.data;
}

export function useMutBulkDeleteHierarchy() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (payload: IBulkDeleteHierarchyPayload) =>
      bulkDeleteHierarchy(payload, companyId),
    {
      onSuccess: async (resp, variables) => {
        if (!companyId) {
          enqueueSnackbar('ID da empresa não encontrado', {
            variant: 'error',
          });
          return;
        }

        if (resp && !resp.dryRun && variables.confirm) {
          await queryClient.invalidateQueries([QueryEnum.HIERARCHY, companyId]);

          const blockedCount = resp.blocked?.length || 0;
          if (resp.deleted > 0 && blockedCount === 0) {
            enqueueSnackbar(
              `${resp.deleted} ${
                resp.deleted === 1 ? 'nó excluído' : 'nós excluídos'
              } com sucesso`,
              { variant: 'success' },
            );
          } else if (resp.deleted > 0 && blockedCount > 0) {
            enqueueSnackbar(
              `${resp.deleted} excluído(s). ${blockedCount} bloqueado(s).`,
              { variant: 'warning' },
            );
          } else if (blockedCount > 0) {
            enqueueSnackbar('Nenhum nó pôde ser excluído', {
              variant: 'warning',
            });
          }
        }

        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error?.response?.data?.message ||
            'Erro ao excluir hierarquias em massa',
          { variant: 'error' },
        );
      },
    },
  );
}
