import { ReactNode } from 'react';
import { create } from 'zustand';

export enum ModalKeyEnum {
  // ACTION PLAN
  ACTION_PLAN_INFO_EDIT = 'ACTION_PLAN_INFO_EDIT',
  ACTION_PLAN_COMMENT = 'ACTION_PLAN_COMMENT',
  ACTION_PLAN_COMMENT_APPROVE = 'ACTION_PLAN_COMMENT_APPROVE',
  ACTION_PLAN_ADD_USER_RESPONSIBLE = 'ACTION_PLAN_ADD_USER_RESPONSIBLE',
}

interface SelectState {
  modals: {
    key: ModalKeyEnum;
    content: ReactNode;
    // options?: {
    //   beforeClose?: (onClose: SelectState['closeModal']) => void;
    // };
  }[];
  openModal: (key: ModalKeyEnum, content: ReactNode) => void;
  closeModal: (key?: ModalKeyEnum) => void;
  clearAllModals: () => void;
  setModals: (modals: { key: ModalKeyEnum; content: ReactNode }[]) => void;
}

export const useModalState = create<SelectState>((set) => ({
  modals: [],
  closeModal: (key?: ModalKeyEnum) =>
    set((state) => {
      if (!key) {
        const newModals = [...state.modals];
        newModals.pop();
        return { modals: newModals };
      }

      const newModals = state.modals.filter((modal) => modal.key !== key);
      return { modals: newModals };
    }),
  openModal: (key: ModalKeyEnum, content: ReactNode) =>
    set((state) => {
      return { modals: [...state.modals, { key, content }] };
    }),
  clearAllModals: () => set(() => ({ modals: [] })),
  setModals: (modals) => set(() => ({ modals })),
}));

export const useModal = () => {
  const clearAllModals = useModalState((state) => state.clearAllModals);
  const closeModal = useModalState((state) => state.closeModal);
  const openModal = useModalState((state) => state.openModal);
  const setModals = useModalState((state) => state.setModals);

  return { openModal, closeModal, clearAllModals, setModals };
};
