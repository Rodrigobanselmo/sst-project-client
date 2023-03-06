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

import { IdsEnum } from 'core/enums/ids.enums';
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
  id?: string;
}

export const initialPhotoState = {
  title: '',
  subtitle: '',
  accept: 'image/*' as string | string[],
  files: [] as File[],
  imageExtension: 'jpeg' as 'jpeg' | 'png' | 'jpg' | 'gif',
  name: '',
  freeAspect: false,
  showInputName: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (arg: IUploadPhotoConfirm) => {},
};

const modalName = ModalEnum.UPLOAD_PHOTO;

export const ModalUploadPhoto: FC<SModalUploadPhoto> = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
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

  const CropImage = () => {
    document.getElementById(IdsEnum.CROP_IMAGE_BUTTON)?.click();
  };

  async function createBlob(base64: any) {
    const res = await fetch(base64);
    const myBlob = await res.blob();
    return myBlob;
  }

  const onSubmit: SubmitHandler<{ name: string }> = async (data) => {
    if (!completedCrop) return CropImage();

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

              const width = e.target.width > 1200 ? 1200 : e.target.width / 2;
              const height =
                e.target.height > 1200 ? 1200 : e.target.height / 2;
              const MAX_WIDTH = width > 2000 ? 2000 : width;
              const MAX_HEIGHT = height > 2000 ? 2000 : height;

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
                    big ? 0.5 : med ? 0.7 : 0.9,
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

    if (canvasRef.current) {
      return;
      // const MAX_WIDTH = 500;

      // const currentWidth = canvasRef.current.width;
      // const currentHeight = canvasRef.current.height;

      // let imageWidth = canvasRef.current.width;
      // let imageHeight = canvasRef.current.height;

      // const scaleSizeWidth = MAX_WIDTH / canvasRef.current.width;

      // if (imageWidth > 800) {
      //   imageWidth = 800;
      //   imageHeight = currentHeight * (800 / currentWidth);
      // }

      // if (imageHeight > 800) {
      //   imageHeight = 800;
      //   imageWidth = currentWidth * (800 / currentHeight);
      // }

      // const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
      // const file = new File(
      //   [await createBlob(dataUrl)],
      //   `${data.name || 'imagem'}.jpeg`,
      //   {
      //     type: 'image/jpeg',
      //   },
      // );

      // await photoData.onConfirm({
      //   file: file,
      //   name: data.name,
      //   src: dataUrl,
      // });

      // return;

      // canvasRef.current.toBlob((blob) => {
      //   if (blob) {
      //     const file = new File([blob], `${data.name || 'imagem'}.png`, {
      //       type: 'image/png',
      //     });
      //     const reader = new FileReader();
      //     reader.addEventListener('load', async () => {
      //       setIsLoading(true);
      //       if (reader.result)
      //         await photoData.onConfirm({
      //           file: file,
      //           name: data.name,
      //           src: reader.result.toString() || '',
      //         });
      //       setIsLoading(false);
      //       onClose();
      //     });
      //     reader.readAsDataURL(file);
      //   } else {
      //     onClose();
      //   }
      // }, 'image/png');
    }
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
      text: completedCrop ? 'Selecionar' : 'Cortar Imagem',
      variant: 'contained',
      type: 'submit',
      color: completedCrop ? 'primary' : 'success',
      onClick: () => {},
    },
  ] as IModalButton[];

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
          label="Legenda"
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
        <SModalButtons
          loading={isLoading}
          onClose={onClose}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
