import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { api } from 'core/services/apiClient';
import {
  useMutUpsertDocumentCover,
  IDocumentCoverJson,
} from 'core/services/hooks/mutations/manager/document-cover/useMutUpsertDocumentCover';
import { useQueryDocumentCovers } from 'core/services/hooks/queries/useQueryDocumentCovers/useQueryDocumentCovers';

import { IUseAddCompany } from '../../../hooks/useEditCompany';

interface ICoverFormData {
  id?: number;
  name?: string;
  logoX?: number;
  logoY?: number;
  maxLogoWidth?: number;
  maxLogoHeight?: number;
  titleX?: number;
  titleY?: number;
  titleBoxX?: number;
  titleBoxY?: number;
  titleSize?: number;
  titleColor?: string;
  versionX?: number;
  versionY?: number;
  versionBoxX?: number;
  versionBoxY?: number;
  versionSize?: number;
  versionColor?: string;
  companyX?: number;
  companyY?: number;
  companyBoxX?: number;
  companyBoxY?: number;
  companySize?: number;
  companyColor?: string;
  backgroundImagePath?: string;
}

const DEFAULT_COVER_VALUES: ICoverFormData = {
  logoX: 200,
  logoY: 58,
  maxLogoWidth: 212,
  maxLogoHeight: 141,
  titleX: 103,
  titleY: 310,
  titleBoxX: 464,
  titleBoxY: 0,
  titleSize: 28,
  titleColor: 'FFFFFF',
  versionX: 103,
  versionY: 480,
  versionBoxX: 464,
  versionBoxY: 0,
  versionSize: 14,
  versionColor: 'FFFFFF',
  companyX: 103,
  companyY: 510,
  companyBoxX: 464,
  companyBoxY: 0,
  companySize: 14,
  companyColor: 'FFFFFF',
};

export const useCoverEdit = ({
  companyData,
  onCloseUnsaved: onCloseUnsavedProp,
}: IUseAddCompany) => {
  const { previousStep } = useWizard();
  const { onStackOpenModal, onCloseModal } = useModal();
  const upsertCoverMutation = useMutUpsertDocumentCover();
  const { data: covers, isLoading: isLoadingCovers } = useQueryDocumentCovers(
    companyData.id,
  );

  const form = useForm<ICoverFormData>({
    defaultValues: DEFAULT_COVER_VALUES,
  });

  const { reset, handleSubmit, setValue, watch } = form;

  const backgroundImagePath = watch('backgroundImagePath');

  // Load existing cover data
  useEffect(() => {
    if (covers && covers.length > 0) {
      const cover = covers[0];
      const props = cover.json?.coverProps;

      reset({
        id: cover.id,
        name: cover.name,
        logoX: props?.logoProps?.x ?? DEFAULT_COVER_VALUES.logoX,
        logoY: props?.logoProps?.y ?? DEFAULT_COVER_VALUES.logoY,
        maxLogoWidth:
          props?.logoProps?.maxLogoWidth ?? DEFAULT_COVER_VALUES.maxLogoWidth,
        maxLogoHeight:
          props?.logoProps?.maxLogoHeight ?? DEFAULT_COVER_VALUES.maxLogoHeight,
        titleX: props?.titleProps?.x ?? DEFAULT_COVER_VALUES.titleX,
        titleY: props?.titleProps?.y ?? DEFAULT_COVER_VALUES.titleY,
        titleBoxX: props?.titleProps?.boxX ?? DEFAULT_COVER_VALUES.titleBoxX,
        titleBoxY: props?.titleProps?.boxY ?? DEFAULT_COVER_VALUES.titleBoxY,
        titleSize: props?.titleProps?.size ?? DEFAULT_COVER_VALUES.titleSize,
        titleColor: props?.titleProps?.color ?? DEFAULT_COVER_VALUES.titleColor,
        versionX: props?.versionProps?.x ?? DEFAULT_COVER_VALUES.versionX,
        versionY: props?.versionProps?.y ?? DEFAULT_COVER_VALUES.versionY,
        versionBoxX:
          props?.versionProps?.boxX ?? DEFAULT_COVER_VALUES.versionBoxX,
        versionBoxY:
          props?.versionProps?.boxY ?? DEFAULT_COVER_VALUES.versionBoxY,
        versionSize:
          props?.versionProps?.size ?? DEFAULT_COVER_VALUES.versionSize,
        versionColor:
          props?.versionProps?.color ?? DEFAULT_COVER_VALUES.versionColor,
        companyX: props?.companyProps?.x ?? DEFAULT_COVER_VALUES.companyX,
        companyY: props?.companyProps?.y ?? DEFAULT_COVER_VALUES.companyY,
        companyBoxX:
          props?.companyProps?.boxX ?? DEFAULT_COVER_VALUES.companyBoxX,
        companyBoxY:
          props?.companyProps?.boxY ?? DEFAULT_COVER_VALUES.companyBoxY,
        companySize:
          props?.companyProps?.size ?? DEFAULT_COVER_VALUES.companySize,
        companyColor:
          props?.companyProps?.color ?? DEFAULT_COVER_VALUES.companyColor,
        backgroundImagePath: props?.backgroundImagePath,
      });
    }
  }, [covers, reset]);

  const onCloseUnsaved = async () => {
    onCloseUnsavedProp(() => reset());
  };

  const toNumber = (
    value: number | string | undefined,
    defaultValue: number,
  ): number => {
    if (value === undefined || value === null || value === '')
      return defaultValue;
    return Number(value);
  };

  const buildCoverJson = (formData: ICoverFormData): IDocumentCoverJson => ({
    coverProps: {
      logoProps: {
        x: toNumber(formData.logoX, DEFAULT_COVER_VALUES.logoX!),
        y: toNumber(formData.logoY, DEFAULT_COVER_VALUES.logoY!),
        maxLogoWidth: toNumber(
          formData.maxLogoWidth,
          DEFAULT_COVER_VALUES.maxLogoWidth!,
        ),
        maxLogoHeight: toNumber(
          formData.maxLogoHeight,
          DEFAULT_COVER_VALUES.maxLogoHeight!,
        ),
      },
      titleProps: {
        x: toNumber(formData.titleX, DEFAULT_COVER_VALUES.titleX!),
        y: toNumber(formData.titleY, DEFAULT_COVER_VALUES.titleY!),
        boxX: toNumber(formData.titleBoxX, DEFAULT_COVER_VALUES.titleBoxX!),
        boxY: toNumber(formData.titleBoxY, DEFAULT_COVER_VALUES.titleBoxY!),
        size: toNumber(formData.titleSize, DEFAULT_COVER_VALUES.titleSize!),
        color: formData.titleColor ?? DEFAULT_COVER_VALUES.titleColor,
      },
      versionProps: {
        x: toNumber(formData.versionX, DEFAULT_COVER_VALUES.versionX!),
        y: toNumber(formData.versionY, DEFAULT_COVER_VALUES.versionY!),
        boxX: toNumber(formData.versionBoxX, DEFAULT_COVER_VALUES.versionBoxX!),
        boxY: toNumber(formData.versionBoxY, DEFAULT_COVER_VALUES.versionBoxY!),
        size: toNumber(formData.versionSize, DEFAULT_COVER_VALUES.versionSize!),
        color: formData.versionColor ?? DEFAULT_COVER_VALUES.versionColor,
      },
      companyProps: {
        x: toNumber(formData.companyX, DEFAULT_COVER_VALUES.companyX!),
        y: toNumber(formData.companyY, DEFAULT_COVER_VALUES.companyY!),
        boxX: toNumber(formData.companyBoxX, DEFAULT_COVER_VALUES.companyBoxX!),
        boxY: toNumber(formData.companyBoxY, DEFAULT_COVER_VALUES.companyBoxY!),
        size: toNumber(formData.companySize, DEFAULT_COVER_VALUES.companySize!),
        color: formData.companyColor ?? DEFAULT_COVER_VALUES.companyColor,
      },
      backgroundImagePath: formData.backgroundImagePath,
    },
  });

  const uploadBackgroundImage = async (file: File) => {
    const formData = form.getValues();
    const json = buildCoverJson(formData);

    const result = await upsertCoverMutation
      .mutateAsync({
        id: formData.id,
        name: formData.name,
        json,
        file,
        companyId: companyData.id,
      })
      .catch(() => null);

    if (result?.json?.coverProps?.backgroundImagePath) {
      setValue(
        'backgroundImagePath',
        result.json.coverProps.backgroundImagePath,
      );
      setValue('id', result.id);
    }
  };

  const handleFileDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await uploadBackgroundImage(acceptedFiles[0]);
    }
  };

  const handleAddBackgroundImage = () => {
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: 'Imagem de fundo da capa',
      freeAspect: true,
      accept: ['image/*', '.heic'],
      onConfirm: async (photo: { file?: File }) => {
        if (photo.file) {
          await uploadBackgroundImage(photo.file);
        }
      },
    } as Partial<typeof initialPhotoState>);
  };

  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handlePreview = async () => {
    const formData = form.getValues();
    const coverProps = buildCoverJson(formData).coverProps;

    const previewData = {
      logoUrl: companyData.logoUrl,
      backgroundImageUrl: formData.backgroundImagePath,
      title: 'Título do Documento',
      version: 'Versão 1.0',
      companyName: companyData.name || companyData.fantasy,
      coverProps,
    };

    const path = ApiRoutesEnum.DOCUMENT_COVER_PREVIEW.replace(
      ':companyId',
      companyData.id,
    );

    setIsPreviewLoading(true);
    try {
      const response = await api.post(path, previewData, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cover-preview.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const json = buildCoverJson(data);

    await upsertCoverMutation.mutateAsync({
      id: data.id,
      name: data.name,
      json,
      companyId: companyData.id,
    });

    onCloseModal(ModalEnum.COMPANY_EDIT);
  });

  return {
    form,
    onSubmit,
    loading: upsertCoverMutation.isLoading || isLoadingCovers,
    previousStep,
    onCloseUnsaved,
    handleAddBackgroundImage,
    handleFileDrop,
    backgroundImagePath,
    handlePreview,
    isPreviewLoading,
  };
};
