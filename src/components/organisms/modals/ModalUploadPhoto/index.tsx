/* eslint-disable react/display-name */
import React, { FC, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PixelCrop } from 'react-image-crop';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { Box, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { InputForm } from 'components/molecules/form/input';
import SCropImage from 'components/molecules/SCropImage';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useSnackbar } from 'notistack';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { photoSchema } from 'core/utils/schemas/photo.schema';

import { SFileDndUpload } from '../../../molecules/SFileDndUpload';
import { SModalUploadPhoto } from './types';
import { calculateDimensionsWithMaxSize } from 'core/utils/helpers/calculateDimensionsWithMaxSize';
import { ImageResizer } from './ImageResizer/ImageResizer';
import dynamic from 'next/dynamic';
import SFlex from 'components/atoms/SFlex';
import {
  imageBlobCompress,
  ImageBlobCompressProps,
} from 'core/utils/helpers/imageBlobCompress';
import { IImageComponentProps } from 'components/molecules/SCanvasEditor/types/ICanvasMain.types';

const StyledCanvas = styled('canvas')`
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

const SCanvasEditorMainSSR = dynamic(
  () => import('components/molecules/SCanvasEditor/SCanvasEditorMain'),
  { ssr: false },
);

const SCanvasEditorMain = React.forwardRef<any, IImageComponentProps>(
  (props, ref) => <SCanvasEditorMainSSR {...props} editorRef={ref} />,
);

export interface IUploadPhotoConfirm {
  file?: File;
  name?: string;
  src?: string;
  id?: string;
}

export const initialPhotoState = {
  id: '' as string | number,
  title: '',
  subtitle: '',
  accept: 'image/*' as string | string[],
  files: [] as File[],
  url: undefined as string | undefined,
  imageExtension: 'jpeg' as 'jpeg' | 'png' | 'jpg' | 'gif',
  name: '',
  freeAspect: false,
  showInputName: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (arg: IUploadPhotoConfirm) => {},
};

const modalName = ModalEnum.UPLOAD_PHOTO;

export const ModalUploadPhoto: FC<
  { children?: any } & SModalUploadPhoto
> = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { onCloseModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();

  const { handleSubmit, control, reset, setValue } = useForm<any>({
    resolver: yupResolver(photoSchema),
  });

  const konvaRef = useRef<{
    handleGetCanvas: (data?: {
      compressProps?: Partial<ImageBlobCompressProps>;
    }) => Promise<{
      dataUrl: string;
      file: File;
    }>;
  }>(null);

  const [photoData, setPhotoData] = useState({
    ...initialPhotoState,
  });

  const isPhotoSelected = !!photoData.files.length || !!photoData.url;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialPhotoState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      if (initialData.id && (initialData?.files?.[0] || initialData.url)) {
        setCompletedCrop({} as any);

        if (initialData?.files?.[0]) {
          const reader = new FileReader();

          reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = canvasRef.current;

              if (canvas) {
                const MAX_WIDTH = 700;
                const MAX_HEIGHT = 400;

                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > MAX_WIDTH) {
                  height = Math.round((height * MAX_WIDTH) / width);
                  width = MAX_WIDTH;
                }

                if (height > MAX_HEIGHT) {
                  width = Math.round((width * MAX_HEIGHT) / height);
                  height = MAX_HEIGHT;
                }

                // Resize image using canvas
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
              }
            };

            img.src = reader.result as string;
          };

          reader.readAsDataURL(initialData?.files?.[0]);
        }
      }

      setPhotoData((oldData) => ({
        ...oldData,
        ...initialData,
      }));
    }
  }, [getModalData]);

  const onClose = () => {
    setIsLoading(false);
    setCompletedCrop(undefined);

    if (photoData.files.length > 1) {
      setPhotoData((data) => ({
        ...data,
        files: data.files.slice(1),
      }));

      return;
    }

    onCloseModal(ModalEnum.UPLOAD_PHOTO);
    setPhotoData(initialPhotoState);
    reset();
  };

  const CropImage = () => {
    document.getElementById(IdsEnum.CROP_IMAGE_BUTTON)?.click();
  };

  const onSubmit: SubmitHandler<{ name: string }> = async (data) => {
    if (!isPhotoSelected)
      return enqueueSnackbar('Selecione uma imagem', { variant: 'error' });
    if (!completedCrop) {
      CropImage();

      if (canvasRef.current)
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            try {
              const { file, dataUrl } = await imageBlobCompress({ blob });
              await photoData.onConfirm({
                file,
                name: data.name,
                src: dataUrl,
              });
              setIsLoading(false);
              onClose();
            } catch {
              setIsLoading(false);
            }
          } else {
            onClose();
          }
        }, `image/${photoData.imageExtension}`);
    } else {
      setIsLoading(true);
      if (konvaRef.current?.handleGetCanvas) {
        try {
          const { dataUrl, file } = await konvaRef.current.handleGetCanvas({
            compressProps: { imageExtension: photoData.imageExtension },
          });

          await photoData.onConfirm({
            file,
            name: data.name,
            src: dataUrl,
          });
        } catch {
          setIsLoading(false);
        }
        setIsLoading(false);
        onClose();
      }
    }
  };

  const onSetFiles = async (files: File[]) => {
    setPhotoData((data) => ({ ...data, files }));
  };

  const handleRemove = async () => {
    setPhotoData((data) => ({ ...data, files: [], url: undefined }));
    setCompletedCrop(undefined);
  };

  const handleStartCrop = async (options: { dataUrl: string; file: File }) => {
    setPhotoData((data) => ({
      ...data,
      files: [options.file],
      url: options.dataUrl,
    }));
    setCompletedCrop(undefined);
  };

  const handleCrop = async ({
    crop,
    dataUrl,
  }: {
    dataUrl?: string;
    crop?: PixelCrop;
  }) => {
    setPhotoData((data) => ({
      ...data,
      url: dataUrl,
    }));
    setCompletedCrop(crop || ({} as any));
  };

  const buttons = [
    {
      text: 'Substituir Foto',
      variant: 'contained',
      type: 'submit',
      disabled: !isPhotoSelected,
      color: 'error',
      onClick: handleRemove,
      sx: { mr: 'auto' },
    },
    {
      text: 'Cancelar',
      variant: 'outlined',
      type: 'button',
    },
    {
      text: completedCrop ? 'Salvar' : 'Cortar e Salvar',
      variant: 'contained',
      type: 'submit',
      disabled: !isPhotoSelected,
      color: 'primary',
      onClick: () => {},
    },
  ] as IModalButton[];

  const showFileUploader = !isPhotoSelected && !completedCrop;
  const showCrop = isPhotoSelected && !completedCrop;
  const showEditor = !!completedCrop;

  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper
        onSubmit={(handleSubmit as any)(onSubmit)}
        component="form"
        center
        p={8}
        semiFullScreen={isPhotoSelected}
        width={'fit-content'}
        minWidth={600}
        {...(isPhotoSelected && {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        })}
      >
        <SModalHeader onClose={onClose} title={'Adicionar foto'} />
        <InputForm
          autoFocus
          defaultValue={photoData.name}
          setValue={setValue}
          label="Legenda"
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 5 }}
          placeholder={'descrição breve da imagem...'}
          name="name"
          size="small"
        />
        {showFileUploader && (
          <DndProvider backend={HTML5Backend}>
            <SFileDndUpload
              maxFiles={15}
              accept={photoData.accept}
              onChange={onSetFiles}
              text={'Arraste ou click aqui \n para adicionar uma foto'}
            />
          </DndProvider>
        )}

        {showCrop && (
          <Box flex={1}>
            <SCropImage
              maxHeight={520}
              canCancel={!!photoData.id}
              freeAspect={photoData.freeAspect}
              canvasRef={canvasRef}
              onSelect={handleCrop}
              file={photoData.files?.[0]}
            />
            {/* <SButton onClick={handleRemove} xsmall color="error">
              Substituir
            </SButton> */}
          </Box>
        )}

        {showEditor && (
          // <Box height={520} width={'100%'} sx={{ backgroundColor: 'red' }}>
          <SCanvasEditorMain
            minHeight={520}
            ref={konvaRef}
            onCrop={handleStartCrop}
            imageUrl={photoData.url}
            canvasRef={canvasRef}
            // minWidth={1000}
          />
          // </Box>
        )}

        <StyledCanvas
          ref={canvasRef}
          style={{
            width: 0,
            height: 0,
          }}
        />
        <SModalButtons
          loading={isLoading}
          onClose={onClose}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
