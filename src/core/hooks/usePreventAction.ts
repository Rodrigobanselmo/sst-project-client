/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useCallback } from 'react';

import deepEqual from 'deep-equal';
import { IModalDataSlice } from 'store/reducers/modal/modalSlice';

import { useGlobalModal } from 'core/hooks/useGlobalModal';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

export const usePreventAction = () => {
  const { onOpenGlobalModal } = useGlobalModal();

  const preventUnwantedChanges = (
    object1: any,
    object2: any,
    close: (...args: any[]) => any,
  ) => {
    if (!deepEqual(cleanObjectValues(object1), cleanObjectValues(object2))) {
      const data = {
        title: 'Descartar mudanças?',
        text: 'Você tem certeza que deseja descartar as mudanças realizadas?',
        confirmText: 'Ok',
        tag: 'warning',
        confirmCancel: 'Cancel',
      } as IModalDataSlice;

      onOpenGlobalModal(data, close);
      return true;
    }
    return false;
  };

  const preventDelete = useCallback(
    (
      callback: () => void,
      message?: ReactNode,
      options: Partial<IModalDataSlice> = {} as IModalDataSlice,
    ) => {
      const data = {
        title: 'Você tem certeza?',
        text:
          message ||
          'Você tem certeza que deseja excluir este item permanentemente?',
        confirmText: 'Deletar',
        tag: 'delete',
        confirmCancel: 'Cancel',
        ...options,
      } as IModalDataSlice;

      onOpenGlobalModal(data, callback);
    },
    [onOpenGlobalModal],
  );

  const preventWarn = (
    message?: ReactNode,
    callback?: () => void,
    options: Partial<IModalDataSlice> = {} as IModalDataSlice,
  ) => {
    const data = {
      title: 'Você tem certeza?',
      text: message || 'Você tem certeza que deseja proceguir?',
      confirmText: 'OK',
      confirmCancel: 'Cancel',
      tag: 'warning',
      ...options,
    } as IModalDataSlice;

    onOpenGlobalModal(data, callback);
  };

  return { preventWarn, preventUnwantedChanges, preventDelete };
};
