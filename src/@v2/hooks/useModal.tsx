import { ReactNode } from 'react';
import { create } from 'zustand';

export enum ModalKeyEnum {
  // TASK
  TASK_ADD = 'TASK_ADD',
  TASK_EDIT = 'TASK_EDIT',
  TASK_VIEW = 'TASK_VIEW',

  // ACTION PLAN
  ACTION_PLAN_INFO_EDIT = 'ACTION_PLAN_INFO_EDIT',
  ACTION_PLAN_COMMENT = 'ACTION_PLAN_COMMENT',
  ACTION_PLAN_COMMENT_APPROVE = 'ACTION_PLAN_COMMENT_APPROVE',
  ACTION_PLAN_ADD_USER_RESPONSIBLE = 'ACTION_PLAN_ADD_USER_RESPONSIBLE',
  ACTION_PLAN_COMMENT_VIEW = 'ACTION_PLAN_COMMENT_VIEW',
  ACTION_PLAN_VIEW = 'ACTION_PLAN_VIEW',
  ACTION_PLAN_VIEW_PHOTO_GALLERY = 'ACTION_PLAN_VIEW_PHOTO_GALLERY',

  // DOCUMENT CONTROL
  DOCUMENT_CONTROL_ADD = 'DOCUMENT_CONTROL_ADD',
  DOCUMENT_CONTROL_EDIT = 'DOCUMENT_CONTROL_EDIT',
  DOCUMENT_CONTROL_FILE_ADD = 'DOCUMENT_CONTROL_FILE_ADD',
  DOCUMENT_CONTROL_FILE_EDIT = 'DOCUMENT_CONTROL_FILE_EDIT',

  // FORM
  FORM_APPLICATION_ADD = 'FORM_APPLICATION_ADD',
  FORM_APPLICATION_EDIT = 'FORM_APPLICATION_EDIT',
}

interface Modal {
  key: ModalKeyEnum;
  loading?: boolean;
  content: ReactNode;
}

interface SetModal {
  key?: ModalKeyEnum;
  modal: Partial<Modal>;
}

interface SelectState {
  modals: Modal[];
  editModal: ({ key, modal }: SetModal) => void;
  openModal: (key: ModalKeyEnum, content: ReactNode) => void;
  closeModal: (key?: ModalKeyEnum) => void;
  clearAllModals: () => void;
  setModals: (modals: Modal[]) => void;
  getModal: (key: ModalKeyEnum) => Modal | undefined;
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
  editModal: ({ key, modal }: SetModal) =>
    set((state) => {
      let newModals = state.modals;
      if (key) {
        newModals = state.modals.map((m) => {
          if (m.key === key) {
            return { ...m, ...modal };
          }
          return m;
        });
      }

      if (!key) {
        newModals[newModals.length - 1] = {
          ...newModals[newModals.length - 1],
          ...modal,
        };
      }

      return { modals: newModals };
    }),
  openModal: (key: ModalKeyEnum, content: ReactNode) =>
    set((state) => {
      return { modals: [...state.modals, { key, content }] };
    }),
  clearAllModals: () => set(() => ({ modals: [] })),
  setModals: (modals) => set(() => ({ modals })),
  getModal: (key: ModalKeyEnum): Modal | undefined => {
    const modal = useModalState.getState().modals.find((m) => m.key === key);
    return modal as Modal | undefined;
  },
}));

export const useModal = () => {
  const clearAllModals = useModalState((state) => state.clearAllModals);
  const closeModal = useModalState((state) => state.closeModal);
  const openModal = useModalState((state) => state.openModal);
  const setModals = useModalState((state) => state.setModals);
  const editModal = useModalState((state) => state.editModal);
  const getModal = useModalState((state) => state.getModal);

  return {
    openModal,
    closeModal,
    clearAllModals,
    setModals,
    editModal,
    getModal,
  };
};
