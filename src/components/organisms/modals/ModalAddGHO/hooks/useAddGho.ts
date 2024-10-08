/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

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

import { useStartEndDate } from '../../ModalAddCharacterization/hooks/useStartEndDate';
import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { IWorkspace } from './../../../../../core/interfaces/api/ICompany';

export const initialAddGhoState = {
  status: StatusEnum.ACTIVE,
  name: '',
  companyId: '',
  hierarchies: [] as IHierarchy[],
  description: '',
  workspaces: [] as IWorkspace[],
  workspaceIds: [] as string[],
  id: '',
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
};

export const useAddGho = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const { selectStartEndDate } = useStartEndDate();
  const initialDataRef = useRef(initialAddGhoState);

  const { handleSubmit, control, reset, getValues, setValue } = useForm<any>({
    resolver: yupResolver(ghoSchema),
  });

  const createGhoMut = useMutCreateGho();
  const updateGhoMut = useMutUpdateGho();
  const deleteGhoMut = useMutDeleteGho();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

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
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setGhoData((oldData) => {
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
    onCloseModal(ModalEnum.GHO_ADD, data);
    setGhoData(initialAddGhoState);
    reset();
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

  const onSubmit: SubmitHandler<{ name: string; description: string }> = async (
    data,
  ) => {
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
          hierarchies: ghoData.hierarchies.reduce((acc, hierarchy) => {
            acc = [
              ...acc,
              ...hierarchy.workspaceIds.map((workspaceId) => ({
                id: hierarchy.id,
                workspaceId,
              })),
            ];

            return acc;
          }, [] as { id: string; workspaceId: string }[]),
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
    } else {
      await updateGhoMut
        .mutateAsync({
          ...submitData,
          ...(ghoData.workspaceIds.length && {
            workspaceIds: ghoData.workspaceIds,
          }),
          id: ghoData.id,
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
    }
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...ghoData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onAddHierarchy = () => {
    const handleSelect = (
      hierarchies: IHierarchy[],
      startDate: Date,
      endDate: Date,
      close?: () => void,
    ) => {
      if (isEdit) {
        const submitData: IUpdateGho = {
          companyId: ghoData.companyId,
          id: ghoData.id,
          startDate,
          endDate,
          hierarchies: hierarchies.reduce((acc, hierarchy) => {
            acc = [
              ...acc,
              ...hierarchy.workspaceIds.map((workspaceId) => ({
                id: hierarchy.id,
                workspaceId,
              })),
            ];

            return acc;
          }, [] as { id: string; workspaceId: string }[]),
        };

        updateGhoMut
          .mutateAsync(submitData)
          .then(() => close?.())
          .catch(() => {});
      } else {
        setGhoData((oldData) => ({
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
      addSubOffice: true,
      lockWorkspace: false,
      workspaceIdsFilter: ghoQuery.workspaceIds,
      workspaceId: ghoQuery.workspaceIds[0],

      allHierarchiesIds: hierarchies
        .filter((h) =>
          (h as any)?.hierarchyOnHomogeneous?.some((hg: any) => !hg?.endDate),
        )
        .reduce((acc, hierarchy) => {
          acc = [
            ...acc,
            ...(hierarchy?.workspaces || []).map(
              (workspace) => String(hierarchy.id) + '//' + workspace.id,
            ),
          ];

          return acc;
        }, [] as string[]),
    } as typeof initialHierarchySelectState);
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
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
  };
};
