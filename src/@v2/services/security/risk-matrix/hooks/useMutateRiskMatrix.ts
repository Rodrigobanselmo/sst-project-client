import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  createRiskMatrix,
  publishRiskMatrixVersion,
  replaceRiskMatrixDraft,
} from '../service/risk-matrix.service';
import type {
  CreateRiskMatrixPayload,
  ReplaceRiskMatrixDraftPayload,
  RiskMatrixVersion,
} from '../service/risk-matrix.types';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

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
