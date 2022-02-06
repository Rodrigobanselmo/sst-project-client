import React, { FC } from 'react';

import SText from '../../../components/atoms/SText';
import SModal, {
  SModalPaper,
  SModalHeader,
  SModalButtons,
} from '../../../components/molecules/SModal';
import { IModalButton } from '../../../components/molecules/SModal/components/SModalButtons/types';
import { useModal } from '../../../core/contexts/ModalContext';
import { ModalEnum } from '../../../core/enums/modal.enums';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { useRegisterModal } from '../../../core/hooks/useRegisterModal';
import {
  selectModalData,
  setModalAction,
} from '../../../store/reducers/modal/modalSlice';

const DefaultModal: FC = () => {
  const { registerModal } = useRegisterModal();
  const { onCloseModal } = useModal();
  const dispatch = useAppDispatch();
  const modalData = useAppSelector(selectModalData);

  const onConfirm = () => {
    dispatch(setModalAction(true));
    onCloseModal(ModalEnum.GLOBAL);
  };

  const buttons = [
    {
      text: modalData.confirmText,
      onClick: onConfirm,
      variant: 'contained',
    } as IModalButton,
  ];

  if (modalData.confirmCancel)
    buttons.push({ text: 'Cancel', variant: 'outlined' } as IModalButton);

  return (
    <SModal {...registerModal(ModalEnum.GLOBAL)}>
      <SModalPaper>
        <SModalHeader
          tag={modalData.tag || 'none'}
          modalName={ModalEnum.GLOBAL}
          title={modalData.title}
        />
        <SText color="text.light" maxWidth="450px">
          {modalData.text}
        </SText>
        <SModalButtons
          modalName={ModalEnum.GLOBAL}
          buttons={buttons.reverse()}
        />
      </SModalPaper>
    </SModal>
  );
};

export default DefaultModal;
