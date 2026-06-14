import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  createHoMethod,
  deleteHoMethod,
  updateHoMethod,
} from '../service/ho-method.service';
import type { HoMethodWritePayload } from '../service/ho-method.types';
import { hoMethodQueryKeys } from './ho-method.query-keys';

export const useMutateCreateHoMethod = () => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (payload: HoMethodWritePayload) => createHoMethod(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hoMethodQueryKeys.all });
      showSnackBar('Método de HO cadastrado com sucesso', { type: 'success' });
    },
  });
};

export const useMutateUpdateHoMethod = () => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: HoMethodWritePayload;
    }) => updateHoMethod(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hoMethodQueryKeys.all });
      showSnackBar('Método de HO atualizado com sucesso', { type: 'success' });
    },
  });
};

export const useMutateDeleteHoMethod = () => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  return useMutation({
    mutationFn: (id: string) => deleteHoMethod(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hoMethodQueryKeys.all });
      showSnackBar('Método de HO inativado com sucesso', { type: 'success' });
    },
    onError: () => {
      showSnackBar('Não foi possível inativar o método de HO', {
        type: 'error',
      });
    },
  });
};
