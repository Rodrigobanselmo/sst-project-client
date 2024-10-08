/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useEffect, useState } from 'react';
import { UseMutationResult } from 'react-query';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { UsersTable } from 'components/organisms/tables/UsersTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

export const initialBlankState = {
  title: '',
  subtitle: '',
  closeButtonText: 'Calcelar' as string | undefined,
  submitButtonText: 'Confirmar' as string | undefined,
  handleOnClose: false,
  handleOnCloseWithoutSelect: false as boolean | undefined,
  hideButton: false as boolean | undefined,
  onSelect: (d: any, onClose?: () => void) => {},
  onCloseWithoutSelect: (onClose?: () => void) => {},
  content: (setData: React.Dispatch<React.SetStateAction<any>>, data: any) => (
    <></>
  ),
};

export const ModalBlank: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialBlankState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.MODAL_BLANK,
    ) as typeof initialBlankState;

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(ModalEnum.MODAL_BLANK);
    setData(initialBlankState);
  };

  const onCloseNoSelect = () => {
    data.onCloseWithoutSelect?.(onClose);
    if (!data.handleOnCloseWithoutSelect) onClose();
  };

  const onSubmit = () => {
    data.onSelect?.(data, onClose);
    if (!data.handleOnClose) onClose();
  };

  const buttons = [
    {
      variant: 'outlined',
      text: data.closeButtonText,
      onClick: () => onCloseNoSelect(),
    },
    {
      text: data.submitButtonText,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.MODAL_BLANK)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper
        sx={{
          backgroundColor: 'grey.200',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        // semiFullScreen
        center
        p={8}
      >
        <SModalHeader
          subtitle={data.subtitle}
          onClose={onCloseNoSelect}
          title={data.title || ' '}
        />

        <Box maxHeight={400} minHeight={200}>
          <Box mt={8}>{data.content(setData, data)}</Box>
        </Box>

        {!data.hideButton && (
          <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
        )}
      </SModalPaper>
    </SModal>
  );
};
