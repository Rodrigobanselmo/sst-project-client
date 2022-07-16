/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { setGhoSelectedId } from 'store/reducers/hierarchy/ghoSlice';
import { setRiskAddState } from 'store/reducers/hierarchy/riskAddSlice';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutAddCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutAddCharacterizationPhoto';
import { useMutDeleteCharacterization } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterization';
import { useMutDeleteCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterizationPhoto';
import {
  IUpdateCharacterizationPhoto,
  useMutUpdateCharacterizationPhoto,
} from 'core/services/hooks/mutations/manager/useMutUpdateCharacterizationPhoto';
import {
  IAddCharacterizationPhoto,
  IUpsertCharacterization,
  useMutUpsertCharacterization,
} from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { useQueryCharacterizations } from 'core/services/hooks/queries/useQueryCharacterizations';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { queryClient } from 'core/services/queryClient';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { characterizationSchema } from 'core/utils/schemas/characterization.schema';
import { sortData } from 'core/utils/sorts/data.sort';

import { initialDocPgrSelectState } from '../../ModalSelectDocPgr';
import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { initialInputModalState } from '../../ModalSingleInput';
import { initialPhotoState } from '../../ModalUploadPhoto';
import { ViewsDataEnum } from './../../../main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

export const initialCharacterizationState = {
  id: '',
  name: '',
  description: '',
  order: 0,
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
  const saveRef = useRef(false);
  const { query, push, asPath } = useRouter();
  const { data: ghoQuery, isLoading: ghoLoading } = useQueryGHO();
  const dispatch = useAppDispatch();
  const { data: characterizationsQuery } = useQueryCharacterizations();
  const { enqueueSnackbar } = useSnackbar();

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(characterizationSchema),
  });

  const deleteMutation = useMutDeleteCharacterization();
  const upsertMutation = useMutUpsertCharacterization();
  const addPhotoMutation = useMutAddCharacterizationPhoto();
  const deletePhotoMutation = useMutDeleteCharacterizationPhoto();
  const updatePhotoMutation = useMutUpdateCharacterizationPhoto();

  const isRiskOpen = query.riskGroupId;

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [characterizationData, setCharacterizationData] = useState({
    ...initialCharacterizationState,
  });

  const { data: characterizationQuery, isLoading: characterizationLoading } =
    useQueryCharacterization(characterizationData.id);

  const isEdit = !!characterizationData.id || !!characterizationQuery.id;

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

      if (asPath.includes('riskGroupId'))
        push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const hierarchies = useMemo(() => {
    if (characterizationQuery.hierarchies) {
      return removeDuplicate(
        [
          ...characterizationQuery.hierarchies,
          ...characterizationData.hierarchies,
        ],
        { removeById: 'id' },
      );
    }
    return [...characterizationData.hierarchies];
  }, [characterizationData.hierarchies, characterizationQuery.hierarchies]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setCharacterizationData(initialCharacterizationState);
    reset();
  };

  const onCloseUnsaved = () => {
    const { name, description } = getValues();
    if (
      preventUnwantedChanges(
        { ...characterizationData, name, description },
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
      order: characterizationData.order,
      photos: characterizationData.photos,
      type: characterizationData.type,
      id: characterizationData.id || undefined,
      hierarchyIds: hierarchies.map(
        (hierarchy) => String(hierarchy.id).split('//')[0],
      ),
    };

    if (isEdit) delete submitData.photos;

    await upsertMutation
      .mutateAsync(submitData)
      .then((characterization) => {
        if (!characterizationData.id)
          queryClient.invalidateQueries([QueryEnum.GHO]);
        if (!saveRef.current) {
          onClose();
        } else {
          initialDataRef.current = {
            ...characterizationData,
            ...data,
            id: characterization.id,
          };
          setCharacterizationData({
            ...characterizationData,
            id: characterization.id,
          });
        }
      })
      .catch(() => {});
  };

  const handleAddPhoto = () => {
    const values = getValues();
    onOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: values?.name || '',
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

  const handlePhotoUpdate = async (
    index: number,
    data: Partial<IUpdateCharacterizationPhoto>,
  ) => {
    const photosCopy = [...characterizationData.photos];
    const updatePhoto = photosCopy.splice(index, 1);

    if (isEdit && updatePhoto[0]?.id)
      await updatePhotoMutation
        .mutateAsync({ ...data, id: updatePhoto[0].id })
        .catch(() => {});

    setCharacterizationData((oldData) => {
      const photosCopy = oldData.photos.map((photo, indexPhoto) => {
        if (index === indexPhoto) return { ...photo, ...data };
        return photo;
      });

      return {
        ...oldData,
        photos: photosCopy,
      };
    });
  };

  const handlePhotoName = async (index: number) => {
    const photosCopy = [...characterizationData.photos];
    const updatePhoto = photosCopy.splice(index, 1);

    onStackOpenModal(ModalEnum.SINGLE_INPUT, {
      onConfirm: (name) => handlePhotoUpdate(index, { name: name }),
      placeholder: 'nome da foto',
      title: 'Editar Photo',
      label: 'Nome',
      name: updatePhoto[0].name,
    } as typeof initialInputModalState);
  };

  const onAddHierarchy = () => {
    const handleSelect = (hierarchies: ITreeMapObject[]) => {
      const values = getValues();

      if (isEdit) {
        const submitData: IUpsertCharacterization = {
          ...values,
          companyId: characterizationData.companyId,
          workspaceId: characterizationData.workspaceId,
          id: characterizationData.id,
          photos: characterizationData.photos,
          type: characterizationData.type,
          considerations: characterizationData.considerations,
          hierarchyIds: hierarchies.map(
            (hierarchy) => String(hierarchy.id).split('//')[0],
          ),
        };
        if (isEdit) delete submitData.photos;

        upsertMutation.mutateAsync(submitData).catch(() => {});
      } else {
        setCharacterizationData((oldData) => ({
          ...oldData,
          hierarchies: hierarchies,
        }));
      }
    };

    onStackOpenModal(ModalEnum.HIERARCHY_SELECT, {
      onSelect: handleSelect,
      selectByGHO: true,
      workspaceId: characterizationData.workspaceId,
      hierarchiesIds: hierarchies.map((hierarchy) =>
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

  const onAddRisk = () => {
    if (!isEdit)
      return enqueueSnackbar('Salve antes de vincular riscos', {
        variant: 'warning',
      });

    onOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
      onSelect: (docPgr: IRiskGroupData) => {
        push(asPath + '/?riskGroupId=' + docPgr.id, undefined, {
          shallow: true,
        });
        dispatch(
          setRiskAddState({
            viewData: ViewsDataEnum.CHARACTERIZATION,
            isEdited: false,
          }),
        );
        const foundGho = ghoQuery.find(
          (g) => g.id === characterizationQuery?.id,
        );
        if (foundGho)
          setTimeout(() => {
            dispatch(setGhoSelectedId(foundGho));
          }, 500);
      },
    } as Partial<typeof initialDocPgrSelectState>);
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
    hierarchies,
    characterizationQuery,
    onAddRisk,
    isRiskOpen,
    characterizationLoading: characterizationLoading || ghoLoading,
    saveRef,
    handlePhotoUpdate,
    handlePhotoName,
    characterizationsQuery: characterizationsQuery.filter(
      (e) => e.type === characterizationData.type,
    ),
  };
};

export type IUseEditCharacterization = ReturnType<
  typeof useEditCharacterization
>;
