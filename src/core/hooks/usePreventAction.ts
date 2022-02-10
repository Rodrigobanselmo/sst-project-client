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
        title: 'Descartar mudançãs?',
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

  return { preventUnwantedChanges };
};
