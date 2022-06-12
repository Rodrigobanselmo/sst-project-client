/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { EnvironmentType } from 'project/enum/environment-type.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IAddEnvironmentPhoto,
  IUpsertEnvironment,
  useMutUpsertEnvironment,
} from 'core/services/hooks/mutations/manager/useMutUpsertEnvironment';
import { photoSchema } from 'core/utils/schemas/photo.schema';

import { initialPhotoState } from '../../ModalUploadPhoto';

export const initialEnvironmentState = {
  id: '',
  name: '',
  description: '',
  companyId: '',
  workspaceId: '',
  parentId: '',
  type: '' as EnvironmentType, //? missing
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
    resolver: yupResolver(photoSchema),
  });

  const upsertMutation = useMutUpsertEnvironment();

  const { preventUnwantedChanges } = usePreventAction();

  const [environmentData, setEnvironmentData] = useState({
    ...initialEnvironmentState,
  });

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
    };

    await upsertMutation.mutateAsync(submitData);

    onClose();
  };

  const handleAddPhoto = () => {
    onOpenModal(ModalEnum.UPLOAD_PHOTO, {
      onConfirm: (photo) =>
        setEnvironmentData((oldData) => ({
          ...oldData,
          photos: [
            ...oldData.photos,
            { src: photo.src || '', file: photo.file, name: photo.name },
          ],
        })),
    } as Partial<typeof initialPhotoState>);
  };

  const handlePhotoRemove = (index: number) => {
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
    control,
    handleSubmit,
    setEnvironmentData,
    modalName,
    handleAddPhoto,
    handlePhotoRemove,
  };
};

export type IUseEditEnvironment = ReturnType<typeof useEditEnvironment>;
