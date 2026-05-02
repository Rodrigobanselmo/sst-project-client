/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from 'react';

import {
  IModalDataSlice,
  selectModalAction,
  setModalAction,
  setModalData,
  setModalGlobal,
} from '../../store/reducers/modal/modalSlice';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';

/**
 * Callback de confirmação precisa ser único para todo o app: cada chamada a
 * `useGlobalModal()` criava um `useRef` diferente — quem abria o modal (ex. linha
 * da tabela) gravava o callback numa ref, mas quem observava `actionModal` era o
 * `DefaultModal`, com outra ref vazia; o confirm nunca disparava a mutation.
 */
let pendingGlobalModalConfirmCallback: ((...args: any[]) => void) | null = null;

export const useGlobalModal = () => {
  const dispatch = useAppDispatch();
  const actionModal = useAppSelector(selectModalAction);

  const onOpenGlobalModal = useCallback(
    (data: IModalDataSlice, callback?: (...args: any[]) => void) => {
      dispatch(setModalGlobal(true));
      dispatch(setModalData(data));
      pendingGlobalModalConfirmCallback = callback ?? null;
    },
    [dispatch],
  );

  /**
   * Confirm no DefaultModal faz só `dispatch(setModalAction(true))`.
   * Não podemos limpar `pending` nem fechar o modal no mesmo tick do clique:
   * `onCloseGlobalModal` zeraria o pending antes deste effect rodar e a mutation nunca dispararia.
   */
  useEffect(() => {
    if (!actionModal) return;

    const cb = pendingGlobalModalConfirmCallback;
    pendingGlobalModalConfirmCallback = null;

    if (cb) cb();

    dispatch(setModalAction(false));
    dispatch(setModalGlobal(false));
  }, [actionModal, dispatch]);

  const onCloseGlobalModal = useCallback(() => {
    pendingGlobalModalConfirmCallback = null;
    dispatch(setModalGlobal(false));
  }, [dispatch]);

  return { onOpenGlobalModal, onCloseGlobalModal };
};
