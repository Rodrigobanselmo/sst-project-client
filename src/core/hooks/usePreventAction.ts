/* eslint-disable @typescript-eslint/no-explicit-any */
import deepEqual from 'deep-equal';
import { IModalDataSlice } from 'store/reducers/modal/modalSlice';

import { useGlobalModal } from 'core/hooks/useGlobalModal';

export const usePreventAction = () => {
  const { onOpenGlobalModal } = useGlobalModal();

  const preventUnwantedChanges = (
    object1: any,
    object2: any,
    close: (...args: any[]) => any,
  ) => {
    if (!deepEqual(object1, object2)) {
      const data = {
        title: 'Descartar mudanças?',
        text: 'Você tem certeza que deseja descartar as mudanças realizadas?',
        confirmText: 'Descartar',
        tag: 'warning',
        confirmCancel: 'Cancel',
      } as IModalDataSlice;

      onOpenGlobalModal(data, close);
      return true;
    }
    return false;
  };

  const preventDelete = (callback: () => void, message?: string) => {
    const data = {
      title: 'Você tem certeza?',
      text:
        message ||
        'Você tem certeza que deseja excluir este item permanentemente?',
      confirmText: 'Deletar',
      tag: 'delete',
      confirmCancel: 'Cancel',
    } as IModalDataSlice;

    onOpenGlobalModal(data, callback);
  };

  return { preventUnwantedChanges, preventDelete };
};
