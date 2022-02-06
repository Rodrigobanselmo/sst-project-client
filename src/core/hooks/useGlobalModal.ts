/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';

import {
  IModalDataSlice,
  selectModalAction,
  selectModalGlobal,
  setModalAction,
  setModalData,
  setModalGlobal,
} from '../../store/reducers/modal/modalSlice';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';

export const useGlobalModal = () => {
  const dispatch = useAppDispatch();
  const actionModal = useAppSelector(selectModalAction);
  const globalModal = useAppSelector(selectModalGlobal);
  const callbackRef = useRef<(...args: any[]) => void>(() => null);

  const onOpenGlobalModal = useCallback(
    (data: IModalDataSlice, callback?: (...args: any[]) => void) => {
      dispatch(setModalGlobal(true));
      dispatch(setModalData(data));
      if (callback) callbackRef.current = callback;
    },
    [dispatch],
  );

  useEffect(() => {
    if (actionModal && callbackRef.current) {
      callbackRef.current();
      dispatch(setModalAction(false));
      callbackRef.current = () => null;
    }
  }, [actionModal, dispatch]);

  const registerModal = useCallback(() => {
    return {
      open: globalModal,
      onClose: () => dispatch(setModalGlobal(false)),
    };
  }, [dispatch, globalModal]);

  const onCloseGlobalModal = useCallback(() => {
    dispatch(setModalGlobal(false));
  }, [dispatch]);

  return { onOpenGlobalModal, registerModal, onCloseGlobalModal };
};
