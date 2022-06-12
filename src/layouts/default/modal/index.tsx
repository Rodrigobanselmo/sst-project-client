import React, { FC, useState } from 'react';

import { Typography } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

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
  selectModalGlobal,
  setModalAction,
  setModalGlobal,
} from '../../../store/reducers/modal/modalSlice';

const DefaultModal: FC = () => {
  const dispatch = useAppDispatch();
  const modalData = useAppSelector(selectModalData);
  const globalModal = useAppSelector(selectModalGlobal);
  const { onCloseGlobalModal } = useGlobalModal();
  const [inputConfirmText, setInputConfirmText] = useState('');

  const onConfirm = () => {
    dispatch(setModalAction(true));
    onCloseGlobalModal();
    setInputConfirmText('');
  };

  const buttons = [
    {
      text: modalData.confirmText,
      onClick: onConfirm,
      variant: 'contained',
      disabled: modalData.inputConfirm
        ? !(inputConfirmText == 'deletar')
        : false,
    } as IModalButton,
  ];

  if (modalData.confirmCancel)
    buttons.push({ text: 'Cancel', variant: 'outlined' } as IModalButton);

  return (
    <SModal open={globalModal} onClose={() => dispatch(setModalGlobal(false))}>
      <SModalPaper center>
        <SModalHeader
          tag={modalData.tag || 'none'}
          onClose={onCloseGlobalModal}
          title={modalData.title}
        />
        <SText color="text.light" maxWidth="450px">
          {modalData.text}
        </SText>

        {modalData.inputConfirm && (
          <>
            <Typography fontSize={14} color={'grey.500'} mb={5} mt={10}>
              Escreva <b>deletar</b> para continuar
            </Typography>
            <SInput
              value={inputConfirmText}
              onChange={(e) => setInputConfirmText(e.target.value)}
              fullWidth
              placeholder="deletar"
            />
          </>
        )}
        <SModalButtons
          onClose={onCloseGlobalModal}
          buttons={buttons.reverse()}
        />
      </SModalPaper>
    </SModal>
  );
};

export default DefaultModal;
