/* eslint-disable consistent-return */
/* eslint-disable no-return-assign */
import { useCallback, useRef, useState } from 'react';

export const useControlModal = () => {
  const registerStackModal = useRef<string[]>([]);
  const [currentModal, setCurrentModal] = useState<string | undefined>(
    undefined,
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

  const onCloseAll = useCallback(() => {
    setCurrentModal(undefined);
    registerStackModal.current = [];
  }, []);

  const closeByName = useCallback((name?: string) => {
    const pile = [...registerStackModal.current];

    if (pile.length === 0) {
      setCurrentModal(undefined);
      return (registerStackModal.current = []);
    }

    if (name) {
      const newPile = removeByNameLastOpenModal(name, pile);
      const lastModalInPile = newPile[newPile.length - 1] || undefined;
      setCurrentModal(lastModalInPile);
      return (registerStackModal.current = newPile);
    }

    const newPile = [...pile.slice(0, -1)];
    setCurrentModal(newPile[newPile.length - 1]);
    return (registerStackModal.current = newPile);
  }, []);

  const openByName = useCallback(
    (name: string) => {
      if (currentModal !== name) {
        registerStackModal.current = [...registerStackModal.current, name];
        setCurrentModal(name);
      }
    },
    [setCurrentModal, currentModal],
  );

  const isOpen = useCallback(
    (name: string) => {
      if (currentModal === name) return true;
      return false;
    },
    [currentModal],
  );

  const registerModal = useCallback(
    (name: string) => {
      return {
        open: name === currentModal,
        onClose: () => closeByName(name),
      };
    },
    [closeByName, currentModal],
  );

  return {
    isOpen,
    registerModal,
    openByName,
    closeByName,
    onCloseAll,
  };
};
