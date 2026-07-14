/* eslint-disable react/display-name */
import React, { FC, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PixelCrop } from 'react-image-crop';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { Box, IconButton, styled } from '@mui/material';
import { InputForm } from 'components/molecules/form/input';
import SCropImage from 'components/molecules/SCropImage';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useSnackbar } from 'notistack';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { buildSequentialPhotoCaptions } from 'core/utils/helpers/buildSequentialPhotoCaptions';
import { photoSchema } from 'core/utils/schemas/photo.schema';

import { SFileDndUpload } from '../../../molecules/SFileDndUpload';
import { SModalUploadPhoto } from './types';
import dynamic from 'next/dynamic';
import SText from 'components/atoms/SText';
import {
  imageBlobCompress,
  ImageBlobCompressProps,
} from 'core/utils/helpers/imageBlobCompress';
import { IImageComponentProps } from 'components/molecules/SCanvasEditor/types/ICanvasMain.types';

const BulkPhotoPreviewThumb: FC<{ file: File; alt: string }> = ({
  file,
  alt,
}) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      style={{
        maxWidth: '100%',
        maxHeight: 100,
        objectFit: 'contain',
      }}
    />
  );
};

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

export interface IUploadPhotoBulkResult {
  successCount: number;
  failedFiles: File[];
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
  saveAsIs: false, // Skip cropping/resizing and save the original file (preserves transparency)
  /** When true and multiple files are selected, skip cropper and save the batch at once. */
  enableBulkUpload: false,
  compressProps: undefined as Partial<ImageBlobCompressProps> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (arg: IUploadPhotoConfirm) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirmBulk: async (
    _photos: IUploadPhotoConfirm[],
  ): Promise<IUploadPhotoBulkResult | void> => undefined,
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

  const { handleSubmit, control, reset, setValue, getValues, watch } =
    useForm<any>({
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

  const watchedName = watch('name');
  const isPhotoSelected = !!photoData.files.length || !!photoData.url;
  const isBulkMode =
    !!photoData.enableBulkUpload && photoData.files.length > 1;
  const bulkCaptions = isBulkMode
    ? buildSequentialPhotoCaptions(
        String(watchedName ?? photoData.name ?? ''),
        photoData.files.length,
      )
    : [];

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

  const onCloseFull = () => {
    setIsLoading(false);
    setCompletedCrop(undefined);
    onCloseModal(ModalEnum.UPLOAD_PHOTO);
    setPhotoData(initialPhotoState);
    reset();
  };

  const onClose = () => {
    setIsLoading(false);
    setCompletedCrop(undefined);

    // Bulk mode: close entirely (no sequential peel)
    if (photoData.enableBulkUpload && photoData.files.length > 1) {
      onCloseFull();
      return;
    }

    if (photoData.files.length > 1) {
      setPhotoData((data) => ({
        ...data,
        files: data.files.slice(1),
      }));

      return;
    }

    onCloseFull();
  };

  const CropImage = () => {
    document.getElementById(IdsEnum.CROP_IMAGE_BUTTON)?.click();
  };

  const handleRemoveBulkFile = (index: number) => {
    setPhotoData((data) => {
      const nextFiles = data.files.filter((_, fileIndex) => fileIndex !== index);
      return { ...data, files: nextFiles };
    });
  };

  const handleBulkSave = async () => {
    if (!photoData.files.length) {
      return enqueueSnackbar('Selecione uma imagem', { variant: 'error' });
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const baseCaption = String(
        getValues('name') ?? photoData.name ?? '',
      ).trim();
      const captions = buildSequentialPhotoCaptions(
        baseCaption,
        photoData.files.length,
      );

      const prepared: IUploadPhotoConfirm[] = [];
      const compressFailed: File[] = [];

      for (let index = 0; index < photoData.files.length; index += 1) {
        const original = photoData.files[index];
        try {
          const { file, dataUrl } = await imageBlobCompress({
            blob: original,
            name: captions[index],
            imageExtension: photoData.imageExtension,
            ...photoData.compressProps,
          });
          prepared.push({
            file,
            name: captions[index],
            src: dataUrl,
          });
        } catch {
          compressFailed.push(original);
        }
      }

      if (!prepared.length) {
        enqueueSnackbar('Não foi possível processar as imagens selecionadas', {
          variant: 'error',
        });
        setIsLoading(false);
        return;
      }

      const result = await photoData.onConfirmBulk(prepared);
      const failedFromUpload = result?.failedFiles ?? [];
      const failedFiles = [...compressFailed, ...failedFromUpload];

      if (failedFiles.length) {
        setPhotoData((data) => ({ ...data, files: failedFiles }));
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onCloseFull();
    } catch {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<{ name: string }> = async (data) => {
    if (isBulkMode) {
      await handleBulkSave();
      return;
    }

    if (!isPhotoSelected)
      return enqueueSnackbar('Selecione uma imagem', { variant: 'error' });

    // If editing existing photo (has id) and no file changes (only url), just update the name
    if (
      photoData.id &&
      photoData.url &&
      !photoData.files?.length &&
      !completedCrop
    ) {
      setIsLoading(true);
      try {
        await photoData.onConfirm({
          name: data.name,
          id: String(photoData.id),
        });
        setIsLoading(false);
        onClose();
      } catch {
        setIsLoading(false);
      }
      return;
    }

    // Save file as-is without cropping/resizing (preserves transparency)
    if (photoData.saveAsIs && photoData.files?.[0]) {
      setIsLoading(true);
      try {
        const file = photoData.files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await photoData.onConfirm({
            file,
            name: data.name,
            src: dataUrl,
          });
          setIsLoading(false);
          onClose();
        };
        reader.onerror = () => {
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch {
        setIsLoading(false);
      }
      return;
    }

    if (!completedCrop) {
      CropImage();

      setIsLoading(true);
      if (canvasRef.current)
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            try {
              const { file, dataUrl } = await imageBlobCompress({
                blob,
                ...photoData.compressProps,
              });
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
            setIsLoading(false);
            onClose();
          }
        }, `image/${photoData.imageExtension}`);
    } else {
      setIsLoading(true);
      if (konvaRef.current?.handleGetCanvas) {
        try {
          const { dataUrl, file } = await konvaRef.current.handleGetCanvas({
            compressProps: {
              imageExtension: photoData.imageExtension,
              ...photoData.compressProps,
            },
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
      disabled: !isPhotoSelected || isBulkMode,
      color: 'error',
      onClick: handleRemove,
      sx: { mr: 'auto', ...(isBulkMode && { display: 'none' }) },
    },
    {
      text: 'Cancelar',
      variant: 'outlined',
      type: 'button',
    },
    {
      text: isBulkMode
        ? `Salvar ${photoData.files.length} fotos`
        : photoData.saveAsIs || completedCrop
          ? 'Salvar'
          : 'Cortar e Salvar',
      variant: 'contained',
      type: isBulkMode ? 'button' : 'submit',
      disabled: !isPhotoSelected || isLoading,
      color: 'primary',
      onClick: isBulkMode ? () => handleBulkSave() : () => {},
    },
  ] as IModalButton[];

  const showFileUploader = !isPhotoSelected && !completedCrop;
  const showCrop =
    isPhotoSelected && !completedCrop && !photoData.saveAsIs && !isBulkMode;
  const showEditor = !!completedCrop && !photoData.saveAsIs && !isBulkMode;
  const showPreview =
    isPhotoSelected && photoData.saveAsIs && !isBulkMode;
  const showBulkPreview = isBulkMode;

  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper
        onSubmit={(event) => {
          if (isBulkMode) {
            event.preventDefault();
            void handleBulkSave();
            return;
          }
          (handleSubmit as any)(onSubmit)(event);
        }}
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
          placeholder={
            isBulkMode || photoData.enableBulkUpload
              ? 'legenda-base para todas as fotos (opcional)...'
              : 'descrição breve da imagem...'
          }
          name="name"
          size="small"
        />
        {isBulkMode && (
          <SText fontSize={13} color="text.secondary" mb={4}>
            A legenda será aplicada como base em todas as fotos (ex.:{' '}
            {bulkCaptions[0] || 'Foto 1'}).
          </SText>
        )}
        {showFileUploader && (
          <DndProvider backend={HTML5Backend}>
            <SFileDndUpload
              maxFiles={15}
              accept={photoData.accept}
              onChange={onSetFiles}
              text={
                photoData.enableBulkUpload
                  ? 'Arraste ou click aqui \n para adicionar uma ou mais fotos'
                  : 'Arraste ou click aqui \n para adicionar uma foto'
              }
            />
          </DndProvider>
        )}

        {showBulkPreview && (
          <Box
            flex={1}
            sx={{
              maxHeight: 480,
              overflowY: 'auto',
              mb: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 2,
            }}
          >
            {photoData.files.map((file, index) => (
              <Box
                key={`${file.name}-${file.lastModified}-${index}`}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  position: 'relative',
                  backgroundColor: 'grey.100',
                }}
              >
                <IconButton
                  type="button"
                  size="small"
                  onClick={() => handleRemoveBulkFile(index)}
                  disabled={isLoading}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'common.white',
                    '&:hover': { backgroundColor: 'grey.200' },
                  }}
                  aria-label={`Remover ${file.name}`}
                >
                  <SDeleteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                </IconButton>
                <Box
                  sx={{
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: 1,
                    backgroundColor: 'grey.200',
                  }}
                >
                  <BulkPhotoPreviewThumb file={file} alt={file.name} />
                </Box>
                <SText fontSize={12} fontWeight={600} color="primary.main">
                  Foto {index + 1}
                </SText>
                <SText
                  fontSize={11}
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={file.name}
                >
                  {file.name}
                </SText>
                <SText
                  fontSize={11}
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {bulkCaptions[index]}
                </SText>
              </Box>
            ))}
          </Box>
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
              imageUrl={!photoData.files?.[0] ? photoData.url : undefined}
            />
          </Box>
        )}

        {showEditor && (
          <SCanvasEditorMain
            minHeight={520}
            ref={konvaRef}
            onCrop={handleStartCrop}
            imageUrl={photoData.url}
            canvasRef={canvasRef}
          />
        )}

        {showPreview && photoData.files?.[0] && (
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              maxHeight: 520,
              backgroundColor: 'grey.200',
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <img
              src={URL.createObjectURL(photoData.files[0])}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: 500,
                objectFit: 'contain',
              }}
            />
          </Box>
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
