/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';

import {
  IModalDataSlice,
  selectModalAction,
  setModalAction,
  setModalData,
} from '../../store/reducers/modal/modalSlice';
import { useModal } from '../contexts/ModalContext';
import { ModalEnum } from '../enums/modal.enums';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';

export const useGlobalModal = () => {
  const dispatch = useAppDispatch();
  const actionModal = useAppSelector(selectModalAction);
  const callbackRef = useRef<(...args: any[]) => void>(() => null);
  const { onOpenModal } = useModal();

  const onOpenGlobalModal = useCallback(
    (data: IModalDataSlice, callback?: (...args: any[]) => void) => {
      onOpenModal(ModalEnum.GLOBAL);
      dispatch(setModalData(data));
      if (callback) callbackRef.current = callback;
    },
    [dispatch, onOpenModal],
  );

  useEffect(() => {
    if (actionModal && callbackRef.current) {
      callbackRef.current();
      dispatch(setModalAction(false));
      callbackRef.current = () => null;
    }
  }, [actionModal, dispatch]);

  return { onOpenGlobalModal };
};
