/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';
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
import { useMutAddEnvironmentPhoto } from 'core/services/hooks/mutations/manager/useMutAddEnvironmentPhoto';
import { useMutDeleteEnvironment } from 'core/services/hooks/mutations/manager/useMutDeleteEnvironment';
import { useMutDeleteEnvironmentPhoto } from 'core/services/hooks/mutations/manager/useMutDeleteEnvironmentPhoto';
import {
  IUpdateEnvironmentPhoto,
  useMutUpdateEnvironmentPhoto,
} from 'core/services/hooks/mutations/manager/useMutUpdateEnvironmentPhoto';
import {
  IAddEnvironmentPhoto,
  IUpsertEnvironment,
  useMutUpsertEnvironment,
} from 'core/services/hooks/mutations/manager/useMutUpsertEnvironment';
import { useQueryEnvironment } from 'core/services/hooks/queries/useQueryEnvironment';
import { useQueryEnvironments } from 'core/services/hooks/queries/useQueryEnvironments';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { queryClient } from 'core/services/queryClient';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { environmentSchema } from 'core/utils/schemas/environment.schema';
import { sortData } from 'core/utils/sorts/data.sort';

import { initialDocPgrSelectState } from '../../ModalSelectDocPgr';
import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { initialInputModalState } from '../../ModalSingleInput';
import { initialPhotoState } from '../../ModalUploadPhoto';

export const initialEnvironmentState = {
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
  considerations: [] as string[],
  parentId: '',
  type: '' as EnvironmentTypeEnum, //? missing
  parentEnvironmentId: '', //? missing
  photos: [] as IAddEnvironmentPhoto[],
  hierarchies: [] as (IHierarchy | ITreeMapObject)[],
};

interface ISubmit {
  name: string;
  description: string;
  noiseValue: string;
  temperature: string;
  luminosity: string;
  moisturePercentage: string;
}

const modalName = ModalEnum.ENVIRONMENT_ADD;

export const useEditEnvironment = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialEnvironmentState);
  const saveRef = useRef(false);
  const { query, push, asPath } = useRouter();
  const { data: ghoQuery, isLoading: ghoLoading } = useQueryGHO();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { data: environmentsQuery } = useQueryEnvironments();

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(environmentSchema),
  });

  const upsertMutation = useMutUpsertEnvironment();
  const deleteMutation = useMutDeleteEnvironment();
  const addPhotoMutation = useMutAddEnvironmentPhoto();
  const deletePhotoMutation = useMutDeleteEnvironmentPhoto();
  const updatePhotoMutation = useMutUpdateEnvironmentPhoto();

  const isRiskOpen = query.riskGroupId;

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [environmentData, setEnvironmentData] = useState({
    ...initialEnvironmentState,
  });

  const { data: environmentQuery, isLoading: environmentLoading } =
    useQueryEnvironment(environmentData.id);

  const isEdit = !!environmentData.id || !!environmentQuery.id;

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

      if (asPath.includes('riskGroupId'))
        push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const hierarchies = useMemo(() => {
    if (environmentQuery.hierarchies) {
      return removeDuplicate(
        [...environmentQuery.hierarchies, ...environmentData.hierarchies],
        { removeById: 'id' },
      );
    }
    return [...environmentData.hierarchies];
  }, [environmentData.hierarchies, environmentQuery.hierarchies]);

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
      noiseValue: data.noiseValue,
      temperature: data.temperature,
      luminosity: data.luminosity,
      moisturePercentage: data.moisturePercentage,
      photos: environmentData.photos,
      order: environmentData.order,
      type: environmentData.type,
      considerations: environmentData.considerations,
      companyId: environmentData.companyId,
      workspaceId: environmentData.workspaceId,
      id: environmentData.id || undefined,
      hierarchyIds: hierarchies.map(
        (hierarchy) => String(hierarchy.id).split('//')[0],
      ),
    };

    if (isEdit) delete submitData.photos;
    if (!isEdit) queryClient.invalidateQueries([QueryEnum.GHO]);

    await upsertMutation
      .mutateAsync(submitData)
      .then((environment) => {
        if (!environmentData.id) queryClient.invalidateQueries([QueryEnum.GHO]);
        if (!saveRef.current) {
          onClose();
        } else {
          initialDataRef.current = {
            ...environmentData,
            ...data,
            id: environment.id,
          };
          setEnvironmentData({ ...environmentData, id: environment.id });
        }
      })
      .catch(() => {});
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

  const handlePhotoUpdate = async (
    index: number,
    data: Partial<IUpdateEnvironmentPhoto>,
  ) => {
    const photosCopy = [...environmentData.photos];
    const updatePhoto = photosCopy.splice(index, 1);

    if (isEdit && updatePhoto[0]?.id)
      await updatePhotoMutation
        .mutateAsync({ ...data, id: updatePhoto[0].id })
        .catch(() => {});

    setEnvironmentData((oldData) => {
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
    const photosCopy = [...environmentData.photos];
    const updatePhoto = photosCopy.splice(index, 1);

    onStackOpenModal(ModalEnum.SINGLE_INPUT, {
      onConfirm: (name) => handlePhotoUpdate(index, { name: name }),
      placeholder: 'nome da foto',
      title: 'Editar Photo',
      label: 'Nome',
      name: updatePhoto[0].name,
    } as typeof initialInputModalState);
  };

  const onRemove = async () => {
    await deleteMutation
      .mutateAsync(environmentData.id)
      .then(() => {
        setEnvironmentData(initialEnvironmentState);
        reset();
        onClose();
      })
      .catch(() => {});
  };

  const onAddHierarchy = () => {
    const handleSelect = (hierarchies: ITreeMapObject[]) => {
      const values = getValues();

      if (isEdit) {
        const submitData: IUpsertEnvironment = {
          ...values,
          companyId: environmentData.companyId,
          workspaceId: environmentData.workspaceId,
          id: environmentData.id,
          photos: environmentData.photos,
          type: environmentData.type,
          considerations: environmentData.considerations,
          hierarchyIds: hierarchies.map(
            (hierarchy) => String(hierarchy.id).split('//')[0],
          ),
        };
        if (isEdit) delete submitData.photos;

        upsertMutation.mutateAsync(submitData).catch(() => {});
      } else {
        setEnvironmentData((oldData) => ({
          ...oldData,
          hierarchies: hierarchies,
        }));
      }
    };

    onStackOpenModal(ModalEnum.HIERARCHY_SELECT, {
      onSelect: handleSelect,
      selectByGHO: true,
      workspaceId: environmentData.workspaceId,
      hierarchiesIds: hierarchies.map((hierarchy) =>
        String(hierarchy.id).split('//').length == 1
          ? String(hierarchy.id) + '//' + environmentData.workspaceId
          : String(hierarchy.id),
      ),
    } as typeof initialHierarchySelectState);
  };

  const onAddArray = (value: string) => {
    setEnvironmentData({
      ...environmentData,
      considerations: [...environmentData.considerations, value],
    });
  };

  const onDeleteArray = (value: string) => {
    setEnvironmentData({
      ...environmentData,
      considerations: [
        ...environmentData.considerations.filter(
          (item: string) => item !== value,
        ),
      ],
    });
  };

  const onAddRisk = () => {
    if (!isEdit)
      return enqueueSnackbar('Salve antes de vincular riscos ao ambiente', {
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
            viewData: ViewsDataEnum.ENVIRONMENT,
            isEdited: false,
          }),
        );
        const foundGho = ghoQuery.find((g) => g.id === environmentQuery?.id);
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
    environmentData,
    onSubmit,
    loading: upsertMutation.isLoading || deleteMutation.isLoading,
    loadingDelete: deletePhotoMutation.isLoading,
    control,
    handleSubmit,
    setEnvironmentData,
    modalName,
    handleAddPhoto,
    handlePhotoRemove,
    isEdit,
    onAddHierarchy,
    onAddArray,
    onDeleteArray,
    onRemove: () => preventDelete(onRemove),
    isRiskOpen,
    onAddRisk,
    environmentQuery,
    hierarchies,
    environmentLoading: environmentLoading && ghoLoading,
    saveRef,
    handlePhotoUpdate,
    handlePhotoName,
    environmentsQuery: environmentsQuery.filter(
      (e) => e.type === environmentData.type,
    ),
  };
};

export type IUseEditEnvironment = ReturnType<typeof useEditEnvironment>;
