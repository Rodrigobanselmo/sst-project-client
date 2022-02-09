import { useCallback } from 'react';
import { useStore } from 'react-redux';

import {
  setModalName,
  setPileModalName,
} from '../../store/reducers/modal/modalSlice';
import { useAppDispatch } from './useAppDispatch';

export const useModal = () => {
  const dispatch = useAppDispatch();
  const store = useStore();

  const setCurrentModal = useCallback(
    (modalName: string[]) => {
      dispatch(setModalName(modalName));
    },
    [dispatch],
  );

  const setPileModal = useCallback(
    (pile: string[]) => {
      dispatch(setPileModalName(pile));
    },
    [dispatch],
  );

  const removeByNameLastOpenModal = (name: string, array: string[]) => {
    const reversePrev = [...array].reverse();
    const indexToRemove = reversePrev.findIndex((item) => item === name);
    if (indexToRemove !== -1) {
      reversePrev.splice(indexToRemove, 1);
      return [...reversePrev.reverse()];
    }

    return array;
  };

  const onCloseAllModals = useCallback(() => {
    setCurrentModal([]);
    setPileModal([]);
  }, [setCurrentModal, setPileModal]);

  const onCloseModal = useCallback(
    (name?: string) => {
      const registerStackModal = store.getState().modal.pileModal as string[];
      const currentModal = store.getState().modal.currentModal as string[];

      if (registerStackModal.length === 0) {
        setCurrentModal([]);
        return setPileModal([]);
      }

      let newPile = [...registerStackModal.slice(0, -1)];
      let newCurrentModal = [...currentModal.slice(0, -1)];

      if (name) {
        newPile = removeByNameLastOpenModal(name, registerStackModal);
        newCurrentModal = removeByNameLastOpenModal(name, currentModal);
      }

      const lastModalInPile = newPile[newPile.length - 1];
      const lastCurrentModal = newCurrentModal[newCurrentModal.length - 1];

      if (lastModalInPile && lastCurrentModal !== lastModalInPile)
        newCurrentModal.push(lastModalInPile);

      setCurrentModal(newCurrentModal);
      return setPileModal(newPile);
    },
    [setCurrentModal, setPileModal, store],
  );

  const onOpenModal = useCallback(
    (name: string) => {
      const registerStackModal = store.getState().modal.pileModal as string[];
      const currentModal = store.getState().modal.currentModal as string[];

      if (!currentModal.includes(name)) {
        setPileModal([...registerStackModal, name]);
        setCurrentModal([name]);
      }
    },
    [setCurrentModal, setPileModal, store],
  );

  const onStackOpenModal = useCallback(
    (name: string) => {
      const registerStackModal = store.getState().modal.pileModal as string[];
      const currentModal = store.getState().modal.currentModal as string[];
      if (!currentModal.includes(name)) {
        setPileModal([...registerStackModal, name]);
        setCurrentModal([...currentModal, name]);
      }
    },
    [setCurrentModal, setPileModal, store],
  );

  const getIsOpenModal = useCallback(
    (name: string) => {
      const currentModal = store.getState().modal.currentModal as string[];
      if (currentModal.includes(name)) return true;
      return false;
    },
    [store],
  );

  const getStackModal = useCallback(() => {
    return store.getState().modal.pileModal as string[];
  }, [store]);

  return {
    getIsOpenModal,
    onOpenModal,
    onCloseModal,
    onCloseAllModals,
    onStackOpenModal,
    getStackModal,
  };
};