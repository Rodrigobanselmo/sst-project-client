/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { Box } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import {
  CharacterizationTypeEnum,
  getIsEnvironment,
} from 'project/enum/characterization-type.enum';
import { ParagraphEnum } from 'project/enum/paragraph.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  ICharacterization,
  ICharacterizationFile,
} from 'core/interfaces/api/ICharacterization';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { IHierarchy, IHierarchyChildren } from 'core/interfaces/api/IHierarchy';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutAddCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutAddCharacterizationPhoto';
import { useMutCopyCharacterization } from 'core/services/hooks/mutations/manager/useMutCopyCharacterization';
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
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { queryClient } from 'core/services/queryClient';
import {
  cleanObjectNullValues,
  cleanObjectValues,
} from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { urlToFile } from 'core/utils/helpers/urlToFile.utils';
import { characterizationSchema } from 'core/utils/schemas/characterization.schema';
import { sortDate } from 'core/utils/sorts/data.sort';

import { ViewsDataEnum } from '../../../main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { initialBlankState } from '../../ModalBlank/ModalBlank';
import { initialCharacterizationSelectState } from '../../ModalSelectCharacterization';
import { initialCompanySelectState } from '../../ModalSelectCompany';
import { initialDocPgrSelectState } from '../../ModalSelectDocPgr';
import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { initialWorkspaceSelectState } from '../../ModalSelectWorkspace';
import { initialInputModalState } from '../../ModalSingleInput';
import { initialPhotoState } from '../../ModalUploadPhoto';
import { useStartEndDate } from './useStartEndDate';

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
  profileParentId: '',
  profileName: '',
  profiles: [] as ICharacterization[],
  workspaceId: '',
  parentId: '',
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  status: undefined as StatusEnum | undefined,
  type: '' as CharacterizationTypeEnum, //? missing
  parentCharacterizationId: '', //? missing
  photos: [] as IAddCharacterizationPhoto[],
  hierarchies: [] as (IHierarchy | ITreeMapObject)[],
  paragraphs: [] as string[],
  considerations: [] as string[],
  activities: [] as string[],
  files: [] as ICharacterizationFile[],
};

interface ISubmit {
  name: string;
  profileName: string;
  description: string;
  noiseValue: string;
  temperature: string;
  luminosity: string;
  moisturePercentage: string;
  type: CharacterizationTypeEnum;
}

const modalNameInit = ModalEnum.CHARACTERIZATION_ADD;

export const useEditCharacterization = (modalName = modalNameInit) => {
  const { registerModal, getModalData } = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialCharacterizationState);
  const saveRef = useRef<boolean | string>(false);
  const { query, push, asPath } = useRouter();
  const { selectStartEndDate } = useStartEndDate();
  const { data: ghoQuery, isLoading: ghoLoading } = useQueryGHOAll();
  const dispatch = useAppDispatch();
  const { data: characterizationsQuery } = useQueryCharacterizations();
  const { enqueueSnackbar } = useSnackbar();

  const {
    handleSubmit,
    control,
    setFocus,
    reset,
    getValues,
    setValue,
    setError,
  } = useForm<any>({
    resolver: yupResolver(characterizationSchema),
  });

  const copyMutation = useMutCopyCharacterization();
  const deleteMutation = useMutDeleteCharacterization();
  const upsertMutation = useMutUpsertCharacterization();
  const addPhotoMutation = useMutAddCharacterizationPhoto();
  const deletePhotoMutation = useMutDeleteCharacterizationPhoto();
  const updatePhotoMutation = useMutUpdateCharacterizationPhoto();

  const isRiskOpen = query.riskGroupId;

  const { preventUnwantedChanges, preventDelete } = usePreventAction();
  const { onOpenSelected } = useOpenRiskTool();

  const [characterizationData, setCharacterizationData] = useState({
    ...initialCharacterizationState,
  });

  const {
    data: characterizationDataQuery,
    isLoading: characterizationLoading,
  } = useQueryCharacterization(
    characterizationData.profileParentId || characterizationData.id,
  );

  const characterizationQuery = characterizationData.profileParentId
    ? characterizationDataQuery.profiles?.find(
        (profile) => profile.id === characterizationData.id,
      ) || ({} as ICharacterization)
    : characterizationDataQuery;

  const isEdit = !!characterizationData.id && !!characterizationQuery?.id;
  const principalProfile = characterizationDataQuery;
  const profiles = characterizationDataQuery.profiles;
  const manyProfiles =
    principalProfile?.profiles?.length >= 1 ||
    !!characterizationData.profileParentId;
  const notPrincipalProfile =
    manyProfiles && !!characterizationData.profileParentId;
  const photos = notPrincipalProfile
    ? characterizationDataQuery.photos
    : characterizationData.photos;
  const isPrincipalNew = !characterizationData.id && !manyProfiles;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialCharacterizationState>>(modalName);

    if (
      initialData &&
      !characterizationData.profileParentId &&
      !(initialData as any).passBack
    ) {
      setCharacterizationData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
          ...(characterizationsQuery?.find((c) => c.id === initialData?.id) ||
            {}),
          profileParentId: '',
        };

        setValue('type', newData.type);

        initialDataRef.current = newData;
        return newData;
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData, characterizationsQuery]);

  useEffect(() => {
    queryClient.invalidateQueries([QueryEnum.ENVIRONMENT]);
    queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);
  }, [query.riskGroupId]);

  const hierarchies = useMemo(() => {
    const data = characterizationData.hierarchies.map((hierarch) => ({
      ...hierarch,
      id: `${String(hierarch.id).split('//')[0]}`,
    }));

    if (characterizationQuery.hierarchies) {
      return removeDuplicate(
        [
          ...(characterizationQuery?.hierarchies || []),
          ...(isEdit ? [] : data),
        ],
        {
          removeById: 'id',
        },
      );
    }

    return removeDuplicate([...data], {
      removeById: 'id',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterizationData.hierarchies, characterizationQuery.hierarchies]);

  const onClose = useCallback(
    (data?: any) => {
      onCloseModal(modalName, data);
      setCharacterizationData(initialCharacterizationState);
      reset();
      const url = new URL(window.location.href);
      url.searchParams.delete('riskGroupId');

      push(url.pathname + url.search, undefined, { shallow: true });
    },
    [modalName, onCloseModal, push, reset],
  );

  const onCloseUnsaved = () => {
    const { name, description, type } = getValues();

    const afterObject = cleanObjectValues({
      ...characterizationData,
      ...cleanObjectValues({ name, description, type }),
      photos: photos?.length,
    });
    const beforeObject = cleanObjectValues({
      ...initialDataRef.current,
      photos: initialDataRef.current.photos?.length,
    });
    if (preventUnwantedChanges(afterObject, beforeObject, onClose)) return;
    onClose();
  };

  const changeProfile = () => {
    const characterizationQuery =
      principalProfile?.profiles.find(
        (profile) => profile.id === saveRef.current,
      ) || principalProfile;

    setValue(
      'moisturePercentage',
      characterizationQuery.moisturePercentage || '',
    );
    setValue('type', characterizationData.type);
    setValue('name', characterizationData.name);
    setValue('description', characterizationQuery.description || '');
    setValue('luminosity', characterizationQuery.luminosity || '');
    setValue('temperature', characterizationQuery.temperature || '');
    setValue('noiseValue', characterizationQuery.noiseValue || '');
    setValue('profileName', characterizationQuery.profileName || '');

    return setCharacterizationData({
      ...(characterizationQuery as any),
      activities: characterizationQuery.activities,
      considerations: characterizationQuery.considerations,
      paragraphs: characterizationQuery.paragraphs,
      temperature: characterizationQuery.temperature,
      luminosity: characterizationQuery.luminosity,
      noiseValue: characterizationQuery.noiseValue,
      moisturePercentage: characterizationQuery.moisturePercentage,
      description: characterizationQuery.description,
      type: principalProfile.type,
      name: principalProfile.name,
    });
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const clickOnSameProfile = saveRef.current === characterizationData.id;
    if (clickOnSameProfile) return;
    if (notPrincipalProfile && !data.profileName) {
      setFocus('profileName');
      return setError('profileName', { message: 'Campo obrigatório' });
    }

    if (!characterizationData.type) {
      return setError('type', { message: 'Campo obrigatório' });
    }

    if (notPrincipalProfile && data.profileName === data.name) {
      setFocus('profileName');
      return setError('profileName', {
        message: 'Nome de perfil precisa ser diferente do nome principal',
      });
    }

    const submitData: IUpsertCharacterization = {
      name: notPrincipalProfile
        ? `${data.name} (${data.profileName})`
        : data.name,
      description: data.description,
      noiseValue: data.noiseValue,
      moisturePercentage: data.moisturePercentage,
      temperature: data.temperature,
      luminosity: data.luminosity,
      profileName: data.profileName,
      startDate: characterizationData.startDate,
      type: characterizationData.type,
      activities: characterizationData.activities,
      considerations: characterizationData.considerations,
      paragraphs: characterizationData.paragraphs,
      companyId: characterizationData.companyId,
      workspaceId: characterizationData.workspaceId,
      order: characterizationData.order,
      photos: characterizationData.photos,
      status: characterizationData.status,
      profileParentId: characterizationData.profileParentId,
      id: characterizationData.id || undefined,
      hierarchyIds: hierarchies.map(
        (hierarchy) => String(hierarchy.id).split('//')[0],
      ),
    };

    if (isEdit) delete submitData.photos;
    if (isEdit) delete submitData.hierarchyIds;

    await upsertMutation
      .mutateAsync(submitData)
      .then((characterization) => {
        try {
          if (!characterizationData.id)
            queryClient.invalidateQueries([QueryEnum.GHO]);

          const isString = typeof saveRef.current === 'string';

          // is add profile
          if (isString && saveRef.current === 'add-profile') {
            const profileParentId = isPrincipalNew
              ? characterization.id
              : principalProfile.id;
            const type = isPrincipalNew
              ? characterization.type
              : principalProfile.type;
            const name = isPrincipalNew
              ? characterization.name
              : principalProfile.name;

            reset();

            setValue('type', type);
            setValue('name', name);

            return setCharacterizationData({
              ...initialCharacterizationState,
              name: data.name,
              workspaceId: characterizationData.workspaceId,
              companyId: characterizationData.companyId,
              type: characterizationData.type,
              profileParentId: profileParentId,
              activities: characterizationData.activities,
              considerations: characterizationData.considerations,
              paragraphs: characterizationData.paragraphs,
            });
          }

          // is add risks
          if (isString && saveRef.current == 'risk') {
            initialDataRef.current = {
              ...characterizationData,
              ...data,
              id: characterization.id,
            };
            setCharacterizationData({
              ...characterizationData,
              id: characterization.id,
            });
            return onAddRisk();
          }

          // is change profile
          if (isString && saveRef.current) {
            return changeProfile();
          }

          // is close and save
          if (!saveRef.current) {
            onClose();
          }

          // is only save
          if (saveRef.current) {
            initialDataRef.current = {
              ...characterizationData,
              ...data,
              id: characterization.id,
            };

            setCharacterizationData({
              ...characterizationData,
              name: data.name,
              id: characterization.id,
            });
          }
        } catch (error) {
          console.error(error);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleAddPhoto = () => {
    const values = getValues();
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: values?.name || '',
      onConfirm: async (photo) => {
        const addLocalPhoto = (src?: string, data?: { id?: string }) => {
          setCharacterizationData((oldData) => ({
            ...oldData,
            photos: [
              ...oldData.photos,
              {
                photoUrl: src || photo.src || '',
                file: photo.file,
                name: photo.name,
                ...data,
              },
            ],
          }));
        };

        if (isEdit && photo.file) {
          setIsLoading(true);

          const characterization = await addPhotoMutation
            .mutateAsync({
              file: photo.file,
              name: photo.name || '',
              companyCharacterizationId: characterizationData.id,
            })
            .catch(() => {});

          setIsLoading(false);

          if (characterization)
            setCharacterizationData((oldData) => ({
              ...oldData,
              photos: characterization.photos,
            }));
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
    setIsLoading(true);

    if (isEdit && updatePhoto[0]?.id)
      await updatePhotoMutation
        .mutateAsync({ ...data, id: updatePhoto[0].id })
        .catch(() => {});

    setCharacterizationData((oldData) => {
      const photosCopy = oldData.photos.map((photo, indexPhoto) => {
        if (index === indexPhoto)
          return { ...photo, ...data, updated_at: new Date() };
        return photo;
      });

      return {
        ...oldData,
        photos: photosCopy,
      };
    });

    setIsLoading(false);
  };

  const handlePhotoName = async (index: number) => {
    const updatePhoto = characterizationData.photos[index];

    onStackOpenModal(ModalEnum.SINGLE_INPUT, {
      onConfirm: (name) => handlePhotoUpdate(index, { name: name }),
      placeholder: 'nome da foto',
      title: 'Editar Photo',
      label: 'Nome',
      name: updatePhoto.name,
    } as typeof initialInputModalState);
  };

  const handleEditPhoto = async (index: number) => {
    const updatePhoto = characterizationData.photos[index];
    const name = updatePhoto.name;

    setIsLoading(true);
    // const file = await urlToFile({ url: updatePhoto.photoUrl, name });

    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: name || '',
      id: updatePhoto.id,
      // files: [file],
      url: updatePhoto.photoUrl + `?timestamp=${updatePhoto.updated_at}`,
      onConfirm: async (photo) => {
        handlePhotoUpdate(index, { name: photo.name, file: photo.file });
      },
    } as Partial<typeof initialPhotoState>);

    setIsLoading(false);
  };

  const onAddHierarchy = () => {
    const handleSelect = (
      hierarchies: IHierarchyChildren[],
      startDate: Date,
      endDate: Date,
      close?: () => void,
    ) => {
      const values = getValues();
      if (isEdit) {
        const submitData: IUpsertCharacterization = {
          ...values,
          companyId: characterizationData.companyId,
          workspaceId: characterizationData.workspaceId,
          id: characterizationData.id,
          photos: characterizationData.photos,
          type: characterizationData.type,
          activities: characterizationData.activities,
          considerations: characterizationData.considerations,
          paragraphs: characterizationData.paragraphs,
          startDate,
          endDate,
          hierarchyIds: hierarchies.map(
            (hierarchy) => String(hierarchy.id).split('//')[0],
          ),
        };
        if (isEdit) delete submitData.photos;
        upsertMutation
          .mutateAsync(submitData)
          .then(() => close?.())
          .catch(() => {});
      } else {
        setCharacterizationData((oldData) => ({
          ...oldData,
          hierarchies: hierarchies.map((h) => ({
            ...h,
            hierarchyOnHomogeneous: [{ startDate, endDate } as any],
          })),
          startDate,
          endDate,
        }));
        close?.();
      }
    };

    onStackOpenModal(ModalEnum.HIERARCHY_SELECT, {
      keepOpen: true,
      onSelect: (hIds, onClose) =>
        selectStartEndDate((d) => {
          handleSelect(hIds, d.startDate, d.endDate, onClose);
        }),
      selectByGHO: ghoQuery.some((gho) => !gho.type),
      workspaceId: characterizationData.workspaceId,
      addSubOffice: true,
      allHierarchiesIds: hierarchies
        .filter((h) =>
          (h as any)?.hierarchyOnHomogeneous?.some((hg: any) => !hg?.endDate),
        )
        .map((hierarchy) =>
          String(hierarchy.id).split('//').length == 1
            ? String(hierarchy.id) + '//' + characterizationData.workspaceId
            : String(hierarchy.id),
        ),
    } as typeof initialHierarchySelectState);
  };

  const onAddArray = (
    value: string,
    type = 'considerations' as 'considerations' | 'activities' | 'paragraphs',
  ) => {
    const values = value
      ?.split('\n\n')
      .flat()
      .map((a) => a.split('\n'))
      .flat()
      .map((a) =>
        a
          .replace(/^-\s*/, '@!@')
          .replace(/^\s\s\s\s-\s*/, '@!!@')
          .replace(/^\s*-\s*/, '@!!!@')
          .replace(/^\d+\.\s*/, '@!@')
          .replace(/^\s\s\s\s\d+\.\s*/, '@!!@')
          .replace(/^\s*\d+\.\s*/, '@!!!@')
          .replace(/^(#+\s*)(.*)/, '**$2**'),
      );

    if (characterizationData[type])
      setCharacterizationData({
        ...characterizationData,
        [type]: [
          ...characterizationData[type],
          ...values.map(
            (value) =>
              value
                .replace('@!@', '')
                .replace('@!!@', '')
                .replace('@!!!@', '') +
              '{type}=' +
              (values.length > 1
                ? value.includes('@!@')
                  ? ParagraphEnum.BULLET_0
                  : value.includes('@!!@')
                  ? ParagraphEnum.BULLET_1
                  : value.includes('@!!!@')
                  ? ParagraphEnum.BULLET_2
                  : ParagraphEnum.PARAGRAPH
                : type === 'paragraphs'
                ? ParagraphEnum.PARAGRAPH
                : ParagraphEnum.BULLET_0),
          ),
        ],
      });
  };

  const onDeleteArray = (
    value: string,
    type = 'considerations' as 'considerations' | 'activities' | 'paragraphs',
    index?: number,
  ) => {
    if (characterizationData[type])
      setCharacterizationData({
        ...characterizationData,
        [type]: [
          ...characterizationData[type].filter(
            (item: string, i: number) =>
              i !== index ||
              item.split('{type}=')[0] !== value.split('{type}=')[0],
          ),
        ],
      });
  };

  const onEditArray = (
    value: string,
    paragraphType: ParagraphEnum,
    type = 'considerations' as 'considerations' | 'activities' | 'paragraphs',
    i: number,
  ) => {
    if (characterizationData[type])
      setCharacterizationData({
        ...characterizationData,
        [type]: [
          ...characterizationData[type].map((item: string, index?: number) => {
            return i != index ||
              item.split('{type}=')[0] !== value.split('{type}=')[0]
              ? item
              : item.split('{type}=')[0] + '{type}=' + paragraphType;
          }),
        ],
      });
  };

  const onEditArrayContent = (
    values: { name: string; type: ParagraphEnum }[],
    type = 'considerations' as 'considerations' | 'activities' | 'paragraphs',
    defaultValue = ParagraphEnum.BULLET_0,
  ) => {
    if (characterizationData[type])
      setCharacterizationData({
        ...characterizationData,
        [type]: values.map(
          ({ name, type }) => name + '{type}=' + (type || defaultValue),
        ),
      });
  };

  const onRemove = async () => {
    if (!characterizationData.id) {
      return changeProfile();
    }

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
    if (!isEdit) {
      return enqueueSnackbar('Salve antes de adicionar um risco', {
        variant: 'warning',
      });
      // return document
      //   .getElementById(IdsEnum.ADD_RISK_CHARACTERIZATION_ID)
      //   ?.click();
    }

    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
      onSelect: (docPgr: IRiskGroupData) => {
        const url = new URL(window.location.href);
        url.searchParams.set('riskGroupId', docPgr.id);

        push(url.pathname + url.search, undefined, { shallow: true });
        const isEnvironment = getIsEnvironment(characterizationData.type);
        const viewData = isEnvironment
          ? ViewsDataEnum.ENVIRONMENT
          : ViewsDataEnum.CHARACTERIZATION;

        const foundGho = ghoQuery.find(
          (g) => g.id === characterizationQuery?.id,
        );
        if (foundGho)
          setTimeout(() => {
            onOpenSelected({
              viewData,
              ghoId: foundGho.id,
              ghoName: foundGho.description.split('(//)')[0],
            });
          }, 500);
      },
    } as Partial<typeof initialDocPgrSelectState>);
  };

  const onAddProfile = () => {
    saveRef.current = 'add-profile';
    document.getElementById(IdsEnum.ADD_PROFILE_CHARACTERIZATION_ID)?.click();
  };

  const onChangeProfile = (id: string) => {
    const profileName = getValues('profileName');
    if (!characterizationData.id && !profileName) {
      changeProfile();
    }

    saveRef.current = id;
    document.getElementById(IdsEnum.ADD_PROFILE_CHARACTERIZATION_ID)?.click();
  };

  const handleCopy = useCallback(() => {
    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      onSelect: (companySelected: ICompany) =>
        onStackOpenModal(ModalEnum.WORKSPACE_SELECT, {
          title: 'Selecione o Estabelecimento',
          companyId: companySelected.id,
          onSelect: (workspace: IWorkspace) => {
            onStackOpenModal(ModalEnum.CHARACTERIZATION_SELECT, {
              companyId: companySelected.id,
              workspaceId: workspace.id,
              multiple: true,
              onSelect: (char: ICharacterization[]) => {
                copyMutation
                  .mutateAsync({
                    companyCopyFromId: companySelected.id,
                    workspaceId:
                      characterizationData.workspaceId ||
                      (query.workspaceId as string),
                    characterizationIds: char.map((c) => c.id),
                    companyId: characterizationData.companyId,
                  })
                  .then(() => {
                    onClose();
                  });
              },
            } as Partial<typeof initialCharacterizationSelectState>);
          },
        } as typeof initialWorkspaceSelectState),
    } as Partial<typeof initialCompanySelectState>);
  }, [
    characterizationData.companyId,
    characterizationData.workspaceId,
    copyMutation,
    onClose,
    onStackOpenModal,
    query.workspaceId,
  ]);

  return {
    control,
    data: characterizationData,
    dataLoading: characterizationLoading || ghoLoading,
    filterQuery: characterizationsQuery.filter(
      (e) => e.type === characterizationData.type,
    ),
    handleAddPhoto,
    handlePhotoName,
    handleEditPhoto,
    handlePhotoRemove,
    handlePhotoUpdate,
    handleSubmit,
    hierarchies,
    isEdit,
    isRiskOpen,
    loading: upsertMutation.isLoading || copyMutation.isLoading,
    loadingDelete: deletePhotoMutation.isLoading,
    manyProfiles,
    modalName,
    notPrincipalProfile,
    onAddArray,
    onAddHierarchy,
    onAddProfile,
    onAddRisk,
    onChangeProfile,
    onClose,
    onCloseUnsaved,
    onDeleteArray,
    onEditArray,
    onEditArrayContent,
    onRemove: () => preventDelete(onRemove),
    onSubmit,
    photos,
    principalProfile,
    profiles,
    query: characterizationQuery,
    registerModal,
    saveRef,
    setData: setCharacterizationData,
    setValue,
    handleCopy,
    isLoading,
  };
};

export type IUseEditCharacterization = ReturnType<
  typeof useEditCharacterization
>;
