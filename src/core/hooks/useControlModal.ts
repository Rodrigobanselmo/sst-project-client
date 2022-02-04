import { useCallback, useRef } from 'react';

import { setModalName } from '../../store/reducers/modal/modalSlice';
import { useAppDispatch } from './useAppDispatch';

export const useControlModal = () => {
  const dispatch = useAppDispatch();
  const registerStackModal = useRef<string[]>([]);
  const currentModal = useRef<string | null>(null);

  const setCurrentModal = useCallback(
    (modalName: string | null) => {
      dispatch(setModalName(modalName));
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
    setCurrentModal(null);
    registerStackModal.current = [];
  }, [setCurrentModal]);

  const onCloseModal = useCallback(
    (name?: string) => {
      const pile = [...registerStackModal.current];

      if (pile.length === 0) {
        setCurrentModal(null);
        return (registerStackModal.current = []);
      }

      if (name) {
        const newPile = removeByNameLastOpenModal(name, pile);
        const lastModalInPile = newPile[newPile.length - 1] || null;
        setCurrentModal(lastModalInPile);
        return (registerStackModal.current = newPile);
      }

      const newPile = [...pile.slice(0, -1)];
      setCurrentModal(newPile[newPile.length - 1]);
      return (registerStackModal.current = newPile);
    },
    [setCurrentModal],
  );

  const onOpenModal = useCallback(
    (name: string) => {
      if (currentModal.current !== name) {
        registerStackModal.current = [...registerStackModal.current, name];
        setCurrentModal(name);
      }
    },
    [setCurrentModal],
  );

  const getOpenModal = useCallback((name: string) => {
    if (currentModal.current === name) return true;
    return false;
  }, []);

  return {
    getOpenModal,
    onOpenModal,
    onCloseModal,
    onCloseAllModals,
  };
};
