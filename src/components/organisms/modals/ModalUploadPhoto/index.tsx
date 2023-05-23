import React, { FC, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PixelCrop } from 'react-image-crop';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
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

const StyledCanvas = styled('canvas')`
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

const CanvasEditor = dynamic(
  () => import('components/molecules/SCanvasEditor/SCanvasEditorMain'),
  {
    ssr: false,
  },
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
  const [isEditing, setIsEditing] = useState(true);

  const { handleSubmit, control, reset, setValue } = useForm({
    resolver: yupResolver(photoSchema),
  });

  const [photoData, setPhotoData] = useState({
    ...initialPhotoState,
  });

  const isPhotoSelected = !!photoData.files.length || !!photoData.url;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialPhotoState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
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
    setIsEditing(false);
    setIsLoading(false);
    onCloseModal(ModalEnum.UPLOAD_PHOTO);
    setCompletedCrop(undefined);
    setPhotoData(initialPhotoState);
    reset();
  };

  const CropImage = () => {
    document.getElementById(IdsEnum.CROP_IMAGE_BUTTON)?.click();
  };

  async function createBlob(base64: any) {
    const res = await fetch(base64);
    const myBlob = await res.blob();
    return myBlob;
  }

  const onSubmit: SubmitHandler<{ name: string }> = async (data) => {
    if (!isPhotoSelected)
      return enqueueSnackbar('Selecione uma imagem', { variant: 'error' });
    if (!completedCrop) CropImage();
    // if (!completedCrop) return CropImage();

    if (photoData.id && photoData.url) {
      setIsLoading(true);
      await photoData.onConfirm({
        name: data.name,
      });
      setIsLoading(false);
      return;
    }

    if (canvasRef.current)
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File(
            [blob],
            `${data.name || 'imagem'}.${photoData.imageExtension}`,
            {
              type: `image/${photoData.imageExtension}`,
            },
          );
          const reader = new FileReader();
          reader.addEventListener('load', async (event) => {
            const imgElement = document.createElement('img');
            if (event.target?.result)
              imgElement.src = event.target.result.toString();

            imgElement.onload = async function (e: any) {
              const canvas = document.createElement('canvas');

              const width = e.target.width;
              const height = e.target.heigh;
              const MAX_WIDTH = width > 1200 ? 1200 : width;
              const MAX_HEIGHT = height > 1200 ? 1200 : height;

              if (e && e.target && e.target?.width) {
                const isVertical = e.target.width < e.target.height;

                canvas.width = e.target.width;
                canvas.height = e.target.height;

                if (!isVertical && e.target.width > MAX_WIDTH) {
                  const scaleSize = MAX_WIDTH / e.target.width;
                  canvas.width = MAX_WIDTH;
                  canvas.height = e.target.height * scaleSize;
                }

                if (isVertical && e.target.height > MAX_HEIGHT) {
                  const scaleSizeHeight = MAX_HEIGHT / e.target.height;
                  canvas.height = MAX_HEIGHT;
                  canvas.width = e.target.width * scaleSizeHeight;
                }

                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);

                  const big = file.size > 5000000;
                  const med = file.size > 2000000;

                  const dataUrl = canvas.toDataURL(
                    `image/${photoData.imageExtension}`,
                    photoData.id ? 1 : big ? 0.5 : med ? 0.7 : 0.9,
                  );

                  const fileFromUrl = new File(
                    [await createBlob(dataUrl)],
                    `${data.name || 'imagem'}.${photoData.imageExtension}`,
                    {
                      type: `image/${photoData.imageExtension}`,
                    },
                  );
                  setIsLoading(true);
                  await photoData.onConfirm({
                    file: fileFromUrl,
                    name: data.name,
                    src: dataUrl,
                  });
                  setIsLoading(false);
                  onClose();
                }
              }
            };
          });
          reader.readAsDataURL(file);
        } else {
          onClose();
        }
      }, `image/${photoData.imageExtension}`);
  };

  const onSetFiles = async (files: File[]) => {
    setPhotoData((data) => ({ ...data, files }));
  };

  const handleRemove = async () => {
    setPhotoData((data) => ({ ...data, files: [], url: undefined }));
    setCompletedCrop(undefined);
  };

  const buttons = [
    {},
    {
      text: completedCrop ? 'Salvar' : 'Cortar e Salvar',
      variant: 'contained',
      type: 'submit',
      disabled: !isPhotoSelected,
      color: 'primary',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper
        onSubmit={(handleSubmit as any)(onSubmit)}
        component="form"
        center
        p={8}
        semiFullScreen={isEditing}
        width={'fit-content'}
        minWidth={600}
        {...(isEditing && {
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
        {isEditing && photoData.url ? (
          <CanvasEditor imageUrl={photoData.url} />
        ) : (
          <DndProvider backend={HTML5Backend}>
            {!isPhotoSelected ? (
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
                    freeAspect={photoData.freeAspect}
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
            {photoData.url ? (
              <ImageResizer
                maxWidth={800}
                maxHeight={400}
                url={photoData.url}
              />
            ) : (
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
            )}
            {completedCrop && (
              <>
                <SButton
                  sx={{ mr: 4 }}
                  onClick={() => setIsEditing(true)}
                  xsmall
                  color="info"
                >
                  Editar
                </SButton>
                <SButton
                  onClick={handleRemove}
                  variant="outlined"
                  xsmall
                  color="error"
                >
                  Remover
                </SButton>
              </>
            )}
          </DndProvider>
        )}

        <SModalButtons
          loading={isLoading}
          onClose={onClose}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
