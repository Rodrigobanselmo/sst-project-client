/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useStore } from 'react-redux';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteGho';
import {
  IUpdateGho,
  useMutUpdateGho,
} from 'core/services/hooks/mutations/checklist/gho/useMutUpdateGho';
import { useQueryGho } from 'core/services/hooks/queries/useQueryGho/useQueryGho';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { ghoSchema } from 'core/utils/schemas/gho.schema';

import { useRouter } from 'next/router';

import { useStartEndDate } from '../../ModalAddCharacterization/hooks/useStartEndDate';
import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { IWorkspace } from './../../../../../core/interfaces/api/ICompany';
import { getGseLinkedWorkspaceIds } from '../get-gse-linked-workspace-ids.util';
import { mapModalSelectIdsToGhoLinks } from './ghoHierarchyLinks';
import {
  buildGseCargoModalTitle,
  mapGhoHierarchiesToModalSelectIds,
} from './map-gho-hierarchies-to-modal-ids.util';
import {
  buildGhoStaySnapshot,
  getGhoEditorSnapshot,
  GhoSaveIntent,
  isGhoEditorDirty,
  resolveGhoSaveIntent,
  shouldStayAfterGhoSave,
} from '../gho-save-intent.util';

export type GhoAddLayout = 'modal' | 'page';

export const initialAddGhoState = {
  status: StatusEnum.ACTIVE,
  name: '',
  companyId: '',
  hierarchies: [] as IHierarchy[],
  description: '',
  workspaces: [] as IWorkspace[],
  workspaceIds: [] as string[],
  workspaceIdsTouched: false,
  id: '',
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  layout: 'modal' as GhoAddLayout,
  initialWizardStep: undefined as number | undefined,
};

export const useAddGho = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const router = useRouter();
  const { selectStartEndDate } = useStartEndDate();
  const store = useStore<any>();
  const initialDataRef = useRef(
    getGhoEditorSnapshot(initialAddGhoState, { name: '', description: '' }),
  );
  const saveIntentRef = useRef<GhoSaveIntent>('exit');
  const absorbedQueryKeyRef = useRef('');
  const isHydratingRef = useRef(true);

  const { handleSubmit, control, reset, getValues, setValue, watch } =
    useForm<any>({
      resolver: yupResolver(ghoSchema),
    });

  const createGhoMut = useMutCreateGho();
  const updateGhoMut = useMutUpdateGho();
  const deleteGhoMut = useMutDeleteGho();

  const { preventDiscardIf, preventDelete, preventWarn } = usePreventAction();

  const [ghoData, setGhoData] = useState({
    ...initialAddGhoState,
  });

  const { data: ghoQuery, isLoading: loadingQuery } = useQueryGho(ghoData.id);
  const isEdit = !!ghoData.id && !!ghoQuery?.id;

  const hierarchies = useMemo(() => {
    const data = ghoData.hierarchies.map((hierarch) => ({
      ...hierarch,
      id: `${String(hierarch.id).split('//')[0]}`,
    }));

    if (ghoQuery.hierarchies) {
      return removeDuplicate(
        [...(ghoQuery?.hierarchies || []), ...(isEdit ? [] : data)],
        {
          removeById: 'id',
        },
      );
    }

    return removeDuplicate([...data], {
      removeById: 'id',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghoData.hierarchies, ghoQuery?.hierarchies]);

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialAddGhoState>>(
      ModalEnum.GHO_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setGhoData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = getGhoEditorSnapshot(newData, {
          name: newData.name || '',
          description: newData.description || '',
        });
        absorbedQueryKeyRef.current = '';
        isHydratingRef.current = true;

        return newData;
      });
      reset({
        name: (initialData.name as string) || '',
        description: (initialData.description as string) || '',
      });
    }
  }, [getModalData, reset]);

  useEffect(() => {
    if (!ghoQuery?.id || !ghoData.id || ghoQuery.id !== ghoData.id) return;

    const key = `${ghoQuery.id}:${ghoQuery.name || ''}:${ghoQuery.description || ''}`;
    if (absorbedQueryKeyRef.current === key) return;

    const loadedName = ghoData.name || ghoQuery.name || '';
    const loadedDescription = ghoData.description || ghoQuery.description || '';
    if (loadedName === (ghoData.name || '') && loadedDescription === (ghoData.description || '')) {
      absorbedQueryKeyRef.current = key;
      return;
    }

    const form = getValues();
    const userEditedName =
      !!form.name &&
      form.name !== (ghoData.name || '') &&
      form.name !== (ghoQuery.name || '');
    const userEditedDescription =
      !!form.description &&
      form.description !== (ghoData.description || '') &&
      form.description !== (ghoQuery.description || '');

    absorbedQueryKeyRef.current = key;

    if (userEditedName || userEditedDescription) return;

    const next = {
      ...ghoData,
      name: loadedName,
      description: loadedDescription,
    };
    const nextForm = { name: loadedName, description: loadedDescription };
    setGhoData(next);
    reset(nextForm);
    initialDataRef.current = getGhoEditorSnapshot(next, nextForm);
    isHydratingRef.current = false;
  }, [
    ghoData,
    ghoQuery?.description,
    ghoQuery?.id,
    ghoQuery?.name,
    getValues,
    reset,
  ]);

  const onClose = (data?: any) => {
    saveIntentRef.current = 'exit';
    onCloseModal(ModalEnum.GHO_ADD, data);
    setGhoData(initialAddGhoState);
    reset();
    isHydratingRef.current = true;
    absorbedQueryKeyRef.current = '';
    initialDataRef.current = getGhoEditorSnapshot(initialAddGhoState, {
      name: '',
      description: '',
    });
  };

  const onRemove = () => {
    deleteGhoMut
      .mutateAsync(ghoData.id)
      .then(() => {
        onClose();
        reset();
      })
      .catch(() => null);
  };

  const setSaveIntent = (intent: GhoSaveIntent) => {
    saveIntentRef.current = intent;
  };

  const applyStay = (params: {
    savedId: string;
    form: { name: string; description: string };
    workspaceIds?: string[];
  }) => {
    const next = buildGhoStaySnapshot({
      current: ghoData,
      form: params.form,
      savedId: params.savedId,
      workspaceIds: params.workspaceIds,
    });
    initialDataRef.current = getGhoEditorSnapshot(next, params.form);
    setGhoData(next);
    reset({
      name: params.form.name || '',
      description: params.form.description || '',
    });
    isHydratingRef.current = false;
    saveIntentRef.current = 'exit';
  };

  const finishSubmit = (params: {
    intent: GhoSaveIntent;
    savedId?: string | null;
    form: { name: string; description: string };
    workspaceIds?: string[];
  }) => {
    if (shouldStayAfterGhoSave({ intent: params.intent, savedId: params.savedId })) {
      applyStay({
        savedId: params.savedId as string,
        form: params.form,
        workspaceIds: params.workspaceIds,
      });
      return;
    }
    saveIntentRef.current = 'exit';
    onClose();
  };

  const onSubmit: SubmitHandler<{
    name: string;
    description: string;
  }> = async (data) => {
    const intent = resolveGhoSaveIntent({
      layout: ghoData.layout,
      requestedIntent: saveIntentRef.current,
    });
    saveIntentRef.current = 'exit';

    const submitData = {
      status: ghoData.status,
      ...data,
    };

    if (ghoData.id == '') {
      await createGhoMut
        .mutateAsync({
          ...submitData,
          startDate: ghoData.startDate,
          endDate: ghoData.endDate,
          ...(ghoData.workspaceIds.length && {
            workspaceIds: ghoData.workspaceIds,
          }),
          hierarchies: ghoData.hierarchies.reduce(
            (acc, hierarchy) => {
              acc = [
                ...acc,
                ...hierarchy.workspaceIds.map((workspaceId) => ({
                  id: hierarchy.id,
                  workspaceId,
                })),
              ];

              return acc;
            },
            [] as { id: string; workspaceId: string }[],
          ),
        })
        .then((resp) => {
          finishSubmit({
            intent,
            savedId: resp?.id,
            form: data,
            workspaceIds: ghoData.workspaceIds.length
              ? ghoData.workspaceIds
              : undefined,
          });
        })
        .catch(() => {});
    } else {
      const originalWorkspaceIds = removeDuplicate(
        [
          ...((ghoQuery.workspaces || []).map((w) => w.id) || []),
          ...((ghoQuery.workspaceIds || []) as string[]),
        ].filter(Boolean),
      );

      const selectedWorkspaceIds = ghoData.workspaceIdsTouched
        ? ghoData.workspaceIds
        : originalWorkspaceIds;

      const removedWorkspaceIds = originalWorkspaceIds.filter(
        (workspaceId) => !selectedWorkspaceIds.includes(workspaceId),
      );

      const hierarchyWorkspaceIds = removeDuplicate(
        (ghoQuery.hierarchies || []).reduce((acc, hierarchy) => {
          const hierarchyWorkspaceIdsFromId = hierarchy.workspaceId
            ? [hierarchy.workspaceId]
            : [];
          const hierarchyWorkspaceIdsFromObjects =
            hierarchy.workspaces?.map((w) => w.id) || [];

          return [
            ...acc,
            ...hierarchyWorkspaceIdsFromId,
            ...hierarchyWorkspaceIdsFromObjects,
          ];
        }, [] as string[]),
      );

      const hasLinkedHierarchyInRemovedWorkspace = removedWorkspaceIds.some(
        (workspaceId) => hierarchyWorkspaceIds.includes(workspaceId),
      );

      const updatePayloadBase: IUpdateGho = {
        ...submitData,
        workspaceIds: selectedWorkspaceIds,
        id: ghoData.id,
      };

      const updateWithWorkspaceGuard = async (
        withConfirmUnlinkWorkspaces = false,
      ) => {
        await updateGhoMut
          .mutateAsync({
            ...updatePayloadBase,
            ...(withConfirmUnlinkWorkspaces && {
              confirmUnlinkWorkspaces: true,
            }),
          })
          .then(() => {
            finishSubmit({
              intent,
              savedId: ghoData.id,
              form: data,
              workspaceIds: selectedWorkspaceIds,
            });
          })
          .catch((error: any) => {
            const status = error?.response?.status;

            if (status === 409 && !withConfirmUnlinkWorkspaces) {
              preventWarn(
                'Você está removendo um ou mais estabelecimentos deste GSE.\n\nExistem cargos/grupos de cargos vinculados a este GSE nesses estabelecimentos. Ao confirmar, esses vínculos também serão removidos do grupo.\n\nCaso esses cargos possuam riscos vinculados, esses riscos deixarão de compor a caracterização da empresa para este GSE e poderão desaparecer dos documentos e módulos derivados, incluindo Inventário de Riscos, Plano de Ação, Ordens de Serviço e demais relatórios onde essas informações são utilizadas.\n\nEssa ação altera a rastreabilidade das exposições ocupacionais associadas ao GSE.\n\nDeseja continuar?',
                () => {
                  updateWithWorkspaceGuard(true);
                },
                {
                  title: 'Atenção: esta remoção impacta vínculos do GSE',
                  confirmText: 'Confirmar remoção',
                  confirmCancel: 'Cancelar',
                  tag: 'warning',
                },
              );
            }
          });
      };

      if (hasLinkedHierarchyInRemovedWorkspace) {
        preventWarn(
          'Você está removendo um ou mais estabelecimentos deste GSE.\n\nExistem cargos/grupos de cargos vinculados a este GSE nesses estabelecimentos. Ao confirmar, esses vínculos também serão removidos do grupo.\n\nCaso esses cargos possuam riscos vinculados, esses riscos deixarão de compor a caracterização da empresa para este GSE e poderão desaparecer dos documentos e módulos derivados, incluindo Inventário de Riscos, Plano de Ação, Ordens de Serviço e demais relatórios onde essas informações são utilizadas.\n\nEssa ação altera a rastreabilidade das exposições ocupacionais associadas ao GSE.\n\nDeseja continuar?',
          () => {
            updateWithWorkspaceGuard(true);
          },
          {
            title: 'Atenção: esta remoção impacta vínculos do GSE',
            confirmText: 'Confirmar remoção',
            confirmCancel: 'Cancelar',
            tag: 'warning',
          },
        );
        return;
      }

      await updateWithWorkspaceGuard(false);
    }
  };

  const formValues = watch();
  const isDirty = isGhoEditorDirty(
    getGhoEditorSnapshot(ghoData, formValues),
    initialDataRef.current,
  );

  useEffect(() => {
    if (!isHydratingRef.current) return;
    const form = getValues();
    const formName = form.name || '';
    const dataName = ghoData.name || '';
    if (formName && dataName && formName !== dataName) {
      isHydratingRef.current = false;
      return;
    }
    initialDataRef.current = getGhoEditorSnapshot(ghoData, form);
    if (dataName && formName === dataName) {
      isHydratingRef.current = false;
    }
  }, [formValues, ghoData, getValues]);

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventDiscardIf(
        isGhoEditorDirty(
          getGhoEditorSnapshot(ghoData, values),
          initialDataRef.current,
        ),
        onClose,
      )
    )
      return;
    onClose();
  };

  const onAddHierarchy = () => {
    const handleSelect = (
      hierarchiesSelected: IHierarchy[],
      startDate: Date,
      endDate: Date,
      close?: () => void,
    ) => {
      const modalSelectIds = store.getState().hierarchy
        .modalSelectIds as string[];
      const fallbackWorkspaceId = ghoQuery.workspaceIds?.[0];
      const selectedLinks = mapModalSelectIdsToGhoLinks(
        modalSelectIds,
        fallbackWorkspaceId,
      );

      if (isEdit) {
        const submitData: IUpdateGho = {
          companyId: ghoData.companyId,
          id: ghoData.id,
          startDate,
          endDate,
          hierarchies: selectedLinks,
        };

        updateGhoMut
          .mutateAsync(submitData)
          .then(() => close?.())
          .catch(() => {});
      } else {
        const newHierarchies = hierarchiesSelected.map((h) => ({
          ...h,
          id: String(h.id).split('//')[0],
          hierarchyOnHomogeneous: [{ startDate, endDate } as any],
        }));

        setGhoData((oldData) => ({
          ...oldData,
          hierarchies: removeDuplicate(
            [...oldData.hierarchies, ...newHierarchies],
            { removeById: 'id' },
          ),
          startDate,
          endDate,
        }));
        close?.();
      }
    };

    const linkedWorkspaceIds = getGseLinkedWorkspaceIds(ghoData, ghoQuery);
    const persistedModalIds = mapGhoHierarchiesToModalSelectIds(
      hierarchies as IHierarchy[],
    );
    const headerWorkspaceId = String(
      router.query.tabWorkspaceId || router.query.workspaceId || '',
    );
    const initialWorkspaceId = linkedWorkspaceIds.includes(headerWorkspaceId)
      ? headerWorkspaceId
      : linkedWorkspaceIds[0] || ghoQuery.workspaceIds?.[0];
    const gseName = String(ghoData.name || ghoQuery?.name || '').trim();

    onStackOpenModal(ModalEnum.HIERARCHY_SELECT, {
      keepOpen: true,
      onSelect: (hIds, onClose) =>
        selectStartEndDate((d) => {
          handleSelect(hIds, d.startDate, d.endDate, onClose);
        }),
      addSubOffice: true,
      lockWorkspace: false,
      workspaceIdsFilter: linkedWorkspaceIds,
      workspaceId: initialWorkspaceId,
      gseCargoSelect: true,
      title: buildGseCargoModalTitle(gseName),
      hierarchiesIds: persistedModalIds,
      allHierarchiesIds: persistedModalIds,
    } as typeof initialHierarchySelectState);
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    isDirty,
    loading: createGhoMut.isLoading || updateGhoMut.isLoading,
    loadingQuery,
    ghoData,
    setGhoData,
    control,
    hierarchies,
    handleSubmit,
    onRemove: () => preventDelete(onRemove),
    onAddHierarchy,
    ghoQuery,
    setValue,
    setSaveIntent,
  };
};
