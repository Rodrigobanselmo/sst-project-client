/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutAddCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutAddCharacterizationPhoto';
import { useMutDeleteCharacterization } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterization';
import { useMutDeleteCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterizationPhoto';
import {
  IAddCharacterizationPhoto,
  IUpsertCharacterization,
  useMutUpsertCharacterization,
} from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { characterizationSchema } from 'core/utils/schemas/characterization.schema';
import { sortData } from 'core/utils/sorts/data.sort';

import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { initialPhotoState } from '../../ModalUploadPhoto';

export const initialCharacterizationState = {
  id: '',
  name: '',
  description: '',
  noiseValue: '',
  temperature: '',
  luminosity: '',
  moisturePercentage: '',
  companyId: '',
  workspaceId: '',
  parentId: '',
  type: '' as CharacterizationTypeEnum, //? missing
  parentCharacterizationId: '', //? missing
  photos: [] as IAddCharacterizationPhoto[],
  hierarchies: [] as (IHierarchy | ITreeMapObject)[],
  considerations: [] as string[],
};

interface ISubmit {
  name: string;
  description: string;
  noiseValue: string;
  temperature: string;
  luminosity: string;
  moisturePercentage: string;
}

const modalName = ModalEnum.CHARACTERIZATION_ADD;

export const useEditCharacterization = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialCharacterizationState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(characterizationSchema),
  });

  const deleteMutation = useMutDeleteCharacterization();
  const upsertMutation = useMutUpsertCharacterization();
  const addPhotoMutation = useMutAddCharacterizationPhoto();
  const deletePhotoMutation = useMutDeleteCharacterizationPhoto();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [characterizationData, setCharacterizationData] = useState({
    ...initialCharacterizationState,
  });

  const isEdit = !!characterizationData.id;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialCharacterizationState>>(modalName);

    if (initialData) {
      setCharacterizationData((oldData) => {
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
    setCharacterizationData(initialCharacterizationState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...characterizationData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: IUpsertCharacterization = {
      name: data.name,
      description: data.description,
      companyId: characterizationData.companyId,
      workspaceId: characterizationData.workspaceId,
      photos: characterizationData.photos,
      type: characterizationData.type,
      id: characterizationData.id || undefined,
      hierarchyIds: characterizationData.hierarchies.map(
        (hierarchy) => String(hierarchy.id).split('//')[0],
      ),
    };

    if (isEdit) delete submitData.photos;

    await upsertMutation.mutateAsync(submitData).catch(() => {});

    onClose();
  };

  const handleAddPhoto = () => {
    onOpenModal(ModalEnum.UPLOAD_PHOTO, {
      onConfirm: async (photo) => {
        const addLocalPhoto = (src?: string) => {
          setCharacterizationData((oldData) => ({
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
          const characterization = await addPhotoMutation
            .mutateAsync({
              file: photo.file,
              name: photo.name || '',
              companyCharacterizationId: characterizationData.id,
            })
            .catch(() => {});

          if (characterization)
            addLocalPhoto(
              characterization.photos.sort((a, b) =>
                sortData(b, a, 'created_at'),
              )[0].photoUrl,
            );
        } else {
          addLocalPhoto();
        }
      },
    } as Partial<typeof initialPhotoState>);
  };

  const handlePhotoRemove = async (index: number) => {
    const photosCopy = [...characterizationData.photos];
    const deletedPhoto = photosCopy.splice(index, 1);

    if (isEdit && deletedPhoto[0]?.id)
      await deletePhotoMutation
        .mutateAsync({ id: deletedPhoto[0].id })
        .catch(() => {});

    setCharacterizationData((oldData) => {
      const photosCopy = [...oldData.photos];
      photosCopy.splice(index, 1);

      return {
        ...oldData,
        photos: photosCopy,
      };
    });
  };

  const onAddHierarchy = () => {
    const handleSelect = (hierarchies: ITreeMapObject[]) => {
      setCharacterizationData((oldData) => ({
        ...oldData,
        hierarchies: hierarchies,
      }));
    };

    onStackOpenModal(ModalEnum.HIERARCHY_SELECT, {
      onSelect: handleSelect,
      selectByGHO: true,
      workspaceId: characterizationData.workspaceId,
      hierarchiesIds: characterizationData.hierarchies.map((hierarchy) =>
        String(hierarchy.id).split('//').length == 1
          ? String(hierarchy.id) + '//' + characterizationData.workspaceId
          : String(hierarchy.id),
      ),
    } as typeof initialHierarchySelectState);
  };

  const onAddArray = (value: string) => {
    setCharacterizationData({
      ...characterizationData,
      considerations: [...characterizationData.considerations, value],
    });
  };

  const onDeleteArray = (value: string) => {
    setCharacterizationData({
      ...characterizationData,
      considerations: [
        ...characterizationData.considerations.filter(
          (item: string) => item !== value,
        ),
      ],
    });
  };

  const onRemove = async () => {
    await deleteMutation
      .mutateAsync(characterizationData.id)
      .then(() => {
        setCharacterizationData(initialCharacterizationState);
        reset();
        onClose();
      })
      .catch(() => {});
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    characterizationData,
    onSubmit,
    loading: upsertMutation.isLoading,
    loadingDelete: deletePhotoMutation.isLoading,
    control,
    handleSubmit,
    setCharacterizationData,
    modalName,
    handleAddPhoto,
    handlePhotoRemove,
    isEdit,
    onAddHierarchy,
    onAddArray,
    onDeleteArray,
    onRemove: () => preventDelete(onRemove),
  };
};

export type IUseEditCharacterization = ReturnType<
  typeof useEditCharacterization
>;