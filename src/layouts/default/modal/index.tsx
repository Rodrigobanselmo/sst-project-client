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
    setInputConfirmText('');
  };

  const confirmButton = {
    text: modalData.confirmText,
    onClick: onConfirm,
    variant: 'contained' as const,
    disabled: modalData.inputConfirm
      ? !(inputConfirmText == 'deletar')
      : false,
  } as IModalButton;

  /** Cancel primeiro (à esquerda), confirm por último — sem `.reverse()` mutável no array. */
  const footerButtons: IModalButton[] = modalData.confirmCancel
    ? [
        {
          text: modalData.confirmCancel,
          variant: 'outlined',
        } as IModalButton,
        confirmButton,
      ]
    : [confirmButton];

  return (
    <SModal
      open={globalModal}
      onClose={onCloseGlobalModal}
      /**
       * Notistack usa `theme.zIndex.snackbar` (1400); o Modal padrão usa 1300.
       * Com isso, toasts na base da tela ficam por cima do rodapé e “comem” o clique
       * no botão de confirmação sem disparar onClick (parece botão morto).
       */
      sx={(theme) => ({
        zIndex: theme.zIndex.snackbar + 100,
      })}
    >
      <SModalPaper center>
        <SModalHeader
          tag={modalData.tag || 'none'}
          onClose={onCloseGlobalModal}
          title={modalData.title}
        />
        <SText color="text.light" maxWidth="450px" whiteSpace="pre-line">
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
        <SModalButtons onClose={onCloseGlobalModal} buttons={footerButtons} />
      </SModalPaper>
    </SModal>
  );
};

export default DefaultModal;
