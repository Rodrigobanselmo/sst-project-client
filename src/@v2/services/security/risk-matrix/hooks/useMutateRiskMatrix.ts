import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  createRiskMatrix,
  disableWorkspaceRiskMatrix,
  duplicateRiskMatrix,
  enableWorkspaceRiskMatrix,
  publishRiskMatrixVersion,
  replaceRiskMatrixDraft,
  switchWorkspaceRiskMatrix,
} from '../service/risk-matrix.service';
import type {
  CreateRiskMatrixPayload,
  ReplaceRiskMatrixDraftPayload,
  RiskMatrixVersion,
  SwitchWorkspaceRiskMatrixPayload,
} from '../service/risk-matrix.types';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

const invalidateRiskMatrixQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    queryKey: riskMatrixQueryKeys.all,
  });

export const useMutateCreateRiskMatrix = (companyId: string) => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (payload: CreateRiskMatrixPayload) =>
      createRiskMatrix({ companyId, payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: riskMatrixQueryKeys.all,
      });
      showSnackBar('Matriz de risco criada com sucesso', { type: 'success' });
    },
  });
};

export const useMutateDuplicateRiskMatrix = (companyId: string) => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (matrixId: string) =>
      duplicateRiskMatrix({ companyId, matrixId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: riskMatrixQueryKeys.all,
      });
      showSnackBar('Matriz duplicada com sucesso', { type: 'success' });
    },
  });
};

export const useMutateReplaceRiskMatrixDraft = (params: {
  companyId: string;
  matrixId: string;
  versionId: string;
}) => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (payload: ReplaceRiskMatrixDraftPayload) =>
      replaceRiskMatrixDraft({ ...params, payload }),
    onSuccess: async (version: RiskMatrixVersion) => {
      queryClient.setQueryData(
        riskMatrixQueryKeys.version(
          params.companyId,
          params.matrixId,
          params.versionId,
        ),
        version,
      );
      await queryClient.invalidateQueries({
        queryKey: riskMatrixQueryKeys.all,
      });
      showSnackBar('Rascunho salvo com sucesso', { type: 'success' });
    },
  });
};

export const useMutatePublishRiskMatrixVersion = (params: {
  companyId: string;
  matrixId: string;
  versionId: string;
}) => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: () => publishRiskMatrixVersion(params),
    onSuccess: async (version: RiskMatrixVersion) => {
      queryClient.setQueryData(
        riskMatrixQueryKeys.version(
          params.companyId,
          params.matrixId,
          params.versionId,
        ),
        version,
      );
      await queryClient.invalidateQueries({
        queryKey: riskMatrixQueryKeys.all,
      });
      showSnackBar('Versão publicada com sucesso', { type: 'success' });
    },
  });
};

export const useMutateEnableWorkspaceRiskMatrix = (companyId: string) => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (params: { workspaceId: string; versionId: string }) =>
      enableWorkspaceRiskMatrix({ companyId, ...params }),
    onSuccess: async () => {
      await invalidateRiskMatrixQueries(queryClient);
      showSnackBar('Matriz disponibilizada neste estabelecimento', {
        type: 'success',
      });
    },
    onError: async () => {
      await invalidateRiskMatrixQueries(queryClient);
    },
  });
};

export const useMutateDisableWorkspaceRiskMatrix = (companyId: string) => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (params: { workspaceId: string; versionId: string }) =>
      disableWorkspaceRiskMatrix({ companyId, ...params }),
    onSuccess: async () => {
      await invalidateRiskMatrixQueries(queryClient);
      showSnackBar('Matriz desabilitada neste estabelecimento', {
        type: 'success',
      });
    },
    onError: async () => {
      await invalidateRiskMatrixQueries(queryClient);
    },
  });
};

export const useMutateSwitchWorkspaceRiskMatrix = (companyId: string) => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (params: {
      workspaceId: string;
      payload: SwitchWorkspaceRiskMatrixPayload;
    }) => switchWorkspaceRiskMatrix({ companyId, ...params }),
    onSuccess: async () => {
      await invalidateRiskMatrixQueries(queryClient);
      showSnackBar('Versão atualizada neste estabelecimento', {
        type: 'success',
      });
    },
    onError: async () => {
      await invalidateRiskMatrixQueries(queryClient);
    },
  });
};
