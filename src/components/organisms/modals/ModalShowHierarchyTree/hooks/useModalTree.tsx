import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'react-redux';

import { TreeTypeEnum } from 'components/organisms/main/Tree/OrgTree/enums/tree-type.enums';
import {
  ITreeMap,
  ITreeMapObject,
} from 'components/organisms/main/Tree/OrgTree/interfaces';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutUpdateSimpleManyHierarchy } from 'core/services/hooks/mutations/checklist/hierarchy/useMutUpdateManyHierarchy';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';

export const initialHierarchyTreeState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: () => {},
  actualCompanyId: '',
  copyFromCompanyId: '',
};

const modalName = ModalEnum.HIERARCHY_TREE;

export const useModalTree = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { data: company } = useQueryCompany();
  const [selectData, setSelectData] = useState(initialHierarchyTreeState);
  const dispatch = useAppDispatch();
  const updateSimpleManyMutation = useMutUpdateSimpleManyHierarchy();
  const store = useStore<any>();

  const { data: actualHierarchy } = useQueryHierarchies(
    selectData.actualCompanyId || '-',
  );

  const { data: copyFromHierarchy } = useQueryHierarchies(
    selectData.copyFromCompanyId || '-',
  );

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialHierarchyTreeState;

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setSelectData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData, company, dispatch]);

  const onCloseNoSelect = () => {
    onCloseModal(modalName);
  };

  const handleConfirm = async () => {
    const nodes = store.getState().hierarchy.nodes as ITreeMap;

    const upsertDataHierarchy = Object.values(nodes)
      .filter(
        (node) =>
          ![TreeTypeEnum.COMPANY, TreeTypeEnum.WORKSPACE].includes(node.type),
      )
      .map((node) => ({
        id: String(node.id).split('//')[0],
        refName: node.idRef,
      }));

    updateSimpleManyMutation
      .mutateAsync(upsertDataHierarchy)
      .then(() => {
        selectData.onSelect?.();
      })
      .catch(() => {});
  };

  return {
    onCloseNoSelect,
    setSelectData,
    selectData,
    registerModal,
    company,
    actualHierarchy,
    copyFromHierarchy,
    isLoading: updateSimpleManyMutation.isLoading,
    handleConfirm,
    modalName,
  };
};

export type IUseModalTree = ReturnType<typeof useModalTree>;
