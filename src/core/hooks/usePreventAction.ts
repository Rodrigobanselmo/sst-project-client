/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';

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
    // console.log(cleanObjectValues(object1), cleanObjectValues(object2));
    // Object.entries(object1).map(([key, value]) => {
    //   const obj2 = object2?.[key];
    //   const isEq = obj2 == value;
    //   if (!isEq) {
    //     if (typeof value == 'object' && object2[key]) {
    //       Object.entries(object1[key]).map(([key2, value]) => {
    //         const obj22 = object2[key]?.[key2];
    //         const isEq = obj22 == value;
    //         if (!isEq) {
    //           console.log(2, key2);
    //         }
    //       });
    //     } else console.log(1, key);
    //   }
    // });

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

  const preventDelete = (
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
  };

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
