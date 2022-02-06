import React, { FC } from 'react';

import SText from '../../../components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from '../../../components/molecules/SModal';
import { IModalButton } from '../../../components/molecules/SModal/components/SModalButtons/types';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { useGlobalModal } from '../../../core/hooks/useGlobalModal';
import {
  selectModalData,
  setModalAction,
} from '../../../store/reducers/modal/modalSlice';

const DefaultModal: FC = () => {
  const dispatch = useAppDispatch();
  const modalData = useAppSelector(selectModalData);
  const { registerModal, onCloseGlobalModal } = useGlobalModal();

  const onConfirm = () => {
    dispatch(setModalAction(true));
    onCloseGlobalModal();
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
    <SModal {...registerModal()}>
      <SModalPaper center>
        <SModalHeader
          tag={modalData.tag || 'none'}
          onClose={onCloseGlobalModal}
          title={modalData.title}
        />
        <SText color="text.light" maxWidth="450px">
          {modalData.text}
        </SText>
        <SModalButtons
          onClose={onCloseGlobalModal}
          buttons={buttons.reverse()}
        />
      </SModalPaper>
    </SModal>
  );
};

export default DefaultModal;
