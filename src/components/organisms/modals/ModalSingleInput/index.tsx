import React, { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { photoSchema } from 'core/utils/schemas/photo.schema';

import { SModalUploadPhoto } from './types';

export enum TypeInputModal {
  TEXT = 'text',
  TEXT_AREA = 'text-area',
  PROFESSIONAL = 'professional',
  COUNCIL = 'COUNCIL',
  CONTACT = 'CONTACT',
  EMPLOYEE = 'EMPLOYEE',
}

export const initialInputModalState = {
  title: '',
  placeholder: '',
  label: '',
  name: '',
  type: TypeInputModal.TEXT,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (value: string) => {},
};

const modalName = ModalEnum.SINGLE_INPUT;

export const ModalSingleInput: FC<SModalUploadPhoto> = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(photoSchema),
  });

  const [data, setData] = useState({
    ...initialInputModalState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialInputModalState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setData((oldData) => ({
        ...oldData,
        ...initialData,
      }));
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(modalName);
    setData(initialInputModalState);
    reset();
  };

  const onSubmit: SubmitHandler<{ name: string }> = async (formData) => {
    data.onConfirm && (await data.onConfirm(formData.name));
    onClose();
  };

  const buttons = [
    {},
    {
      text: 'Confirmar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  // console.log('photoData', canvasRef.current.toDataURL());

  const inputProps = () => {
    if (data.type == TypeInputModal.TEXT) return {};
    if (data.type == TypeInputModal.TEXT_AREA)
      return {
        multiline: true,
        maxRows: 5,
        minRows: 3,
      };
  };
  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper
        onSubmit={handleSubmit(onSubmit)}
        component="form"
        center
        p={8}
        width={'fit-content'}
        minWidth={600}
      >
        <SModalHeader onClose={onClose} title={data.title || 'Adicionar'} />
        <InputForm
          autoFocus
          defaultValue={data.name}
          label={data.label || 'descrição'}
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 5 }}
          placeholder={data.placeholder || 'descrição...'}
          name="name"
          size="small"
          {...inputProps()}
        />
        <SModalButtons onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
