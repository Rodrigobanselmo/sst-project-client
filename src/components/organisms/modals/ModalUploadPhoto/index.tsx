import React, { FC, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PixelCrop } from 'react-image-crop';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { InputForm } from 'components/molecules/form/input';
import SCropImage from 'components/molecules/SCropImage';
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

import { SFileDndUpload } from '../../../molecules/SFileDndUpload';
import { SModalUploadPhoto } from './types';

const StyledCanvas = styled('canvas')`
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

export interface IUploadPhotoConfirm {
  file: File;
  name?: string;
  src?: string;
}

export const initialPhotoState = {
  title: '',
  subtitle: '',
  accept: 'image/*',
  files: [] as File[],
  name: '',
  showInputName: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: (arg: IUploadPhotoConfirm) => {},
};

const modalName = ModalEnum.UPLOAD_PHOTO;

export const ModalUploadPhoto: FC<SModalUploadPhoto> = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const { onCloseModal } = useModal();

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(photoSchema),
  });

  const [photoData, setPhotoData] = useState({
    ...initialPhotoState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialPhotoState>>(modalName);

    if (initialData) {
      setPhotoData((oldData) => ({
        ...oldData,
        ...initialData,
      }));
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(ModalEnum.UPLOAD_PHOTO);
    setCompletedCrop(undefined);
    setPhotoData(initialPhotoState);
    reset();
  };

  const onSubmit: SubmitHandler<{ name: string }> = async (data) => {
    if (canvasRef.current)
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${data.name || 'imagem'}.png`, {
            type: 'image/png',
          });
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            if (reader.result)
              photoData.onConfirm({
                file: file,
                name: data.name,
                src: reader.result.toString() || '',
              });
            onClose();
          });
          reader.readAsDataURL(file);
        } else {
          onClose();
        }
      }, 'image/png');
  };

  const onSetFiles = async (files: File[]) => {
    setPhotoData((data) => ({ ...data, files }));
  };

  const handleRemove = async () => {
    setPhotoData((data) => ({ ...data, files: [] }));
    setCompletedCrop(undefined);
  };

  const buttons = [
    {},
    {
      text: 'Selecionar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
      disabled: !completedCrop,
    },
  ] as IModalButton[];

  // console.log('photoData', canvasRef.current.toDataURL());

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
        <SModalHeader onClose={onClose} title={'Adicionar foto'} />
        <InputForm
          autoFocus
          defaultValue={photoData.name}
          label="Nome"
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 5 }}
          placeholder={'descrição breve da imagem...'}
          name="name"
          size="small"
        />
        <DndProvider backend={HTML5Backend}>
          {!photoData.files.length ? (
            <SFileDndUpload
              maxFiles={1}
              accept={photoData.accept}
              onChange={onSetFiles}
              text={'Arraste ou click aqui \n para adicionar uma foto'}
            />
          ) : (
            !completedCrop && (
              <>
                <SCropImage
                  canvasRef={canvasRef}
                  onSelect={setCompletedCrop}
                  files={photoData.files}
                />
                <SButton onClick={handleRemove} xsmall color="error">
                  Remover
                </SButton>
              </>
            )
          )}
          <div>
            <StyledCanvas
              ref={canvasRef}
              style={{
                display: completedCrop ? 'inherit' : 'none',
                width: completedCrop?.width,
                height: completedCrop?.height,
              }}
            />
          </div>
          {completedCrop && (
            <SButton onClick={handleRemove} xsmall color="error">
              Remover
            </SButton>
          )}
        </DndProvider>
        <SModalButtons onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
