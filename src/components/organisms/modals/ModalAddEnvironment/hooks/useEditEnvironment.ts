/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutAddEnvironmentPhoto } from 'core/services/hooks/mutations/manager/useMutAddEnvironmentPhoto';
import { useMutDeleteEnvironmentPhoto } from 'core/services/hooks/mutations/manager/useMutDeleteEnvironmentPhoto';
import {
  IAddEnvironmentPhoto,
  IUpsertEnvironment,
  useMutUpsertEnvironment,
} from 'core/services/hooks/mutations/manager/useMutUpsertEnvironment';
import { environmentSchema } from 'core/utils/schemas/environment.schema';
import { sortData } from 'core/utils/sorts/data.sort';

import { initialPhotoState } from '../../ModalUploadPhoto';

export const initialEnvironmentState = {
  id: '',
  name: '',
  description: '',
  companyId: '',
  workspaceId: '',
  parentId: '',
  type: '' as EnvironmentTypeEnum, //? missing
  parentEnvironmentId: '', //? missing
  photos: [] as IAddEnvironmentPhoto[],
};

interface ISubmit {
  name: string;
  description: string;
}

const modalName = ModalEnum.ENVIRONMENT_ADD;

export const useEditEnvironment = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const initialDataRef = useRef(initialEnvironmentState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(environmentSchema),
  });

  const upsertMutation = useMutUpsertEnvironment();
  const addPhotoMutation = useMutAddEnvironmentPhoto();
  const deletePhotoMutation = useMutDeleteEnvironmentPhoto();

  const { preventUnwantedChanges } = usePreventAction();

  const [environmentData, setEnvironmentData] = useState({
    ...initialEnvironmentState,
  });

  const isEdit = !!environmentData.id;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEnvironmentState>>(modalName);

    if (initialData) {
      setEnvironmentData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setEnvironmentData(initialEnvironmentState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...environmentData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: IUpsertEnvironment = {
      name: data.name,
      description: data.description,
      companyId: environmentData.companyId,
      workspaceId: environmentData.workspaceId,
      photos: environmentData.photos,
      type: environmentData.type,
      id: environmentData.id || undefined,
    };

    if (isEdit) delete submitData.photos;

    await upsertMutation.mutateAsync(submitData).catch(() => {});

    onClose();
  };

  const handleAddPhoto = () => {
    onOpenModal(ModalEnum.UPLOAD_PHOTO, {
      onConfirm: async (photo) => {
        const addLocalPhoto = (src?: string) => {
          setEnvironmentData((oldData) => ({
            ...oldData,
            photos: [
              ...oldData.photos,
              {
                photoUrl: src || photo.src || '',
                file: photo.file,
                name: photo.name,
              },
            ],
          }));
        };

        if (isEdit) {
          const environment = await addPhotoMutation
            .mutateAsync({
              file: photo.file,
              name: photo.name || '',
              companyEnvironmentId: environmentData.id,
            })
            .catch(() => {});

          if (environment)
            addLocalPhoto(
              environment.photos.sort((a, b) => sortData(b, a, 'created_at'))[0]
                .photoUrl,
            );
        } else {
          addLocalPhoto();
        }
      },
    } as Partial<typeof initialPhotoState>);
  };

  const handlePhotoRemove = async (index: number) => {
    const photosCopy = [...environmentData.photos];
    const deletedPhoto = photosCopy.splice(index, 1);

    if (isEdit && deletedPhoto[0]?.id)
      await deletePhotoMutation
        .mutateAsync({ id: deletedPhoto[0].id })
        .catch(() => {});

    setEnvironmentData((oldData) => {
      const photosCopy = [...oldData.photos];
      photosCopy.splice(index, 1);

      return {
        ...oldData,
        photos: photosCopy,
      };
    });
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    environmentData,
    onSubmit,
    loading: upsertMutation.isLoading,
    loadingDelete: deletePhotoMutation.isLoading,
    control,
    handleSubmit,
    setEnvironmentData,
    modalName,
    handleAddPhoto,
    handlePhotoRemove,
    isEdit,
  };
};

export type IUseEditEnvironment = ReturnType<typeof useEditEnvironment>;
