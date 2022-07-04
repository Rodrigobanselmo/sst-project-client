import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'react-redux';

import { Box } from '@mui/material';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import {
  ITreeMap,
  ITreeMapObject,
} from 'components/organisms/main/Tree/OrgTree/interfaces';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';

import { EmptyHierarchyData } from '../empty/EmptyHierarchyData';
import { EmptyWorkspaceData } from '../empty/EmptyWorkspaceData';
import { ModalSelectHierarchyData } from './SelectData';

export const initialHierarchySelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (hierarchies: ITreeMapObject[]) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSingleSelect: (hierarchy: ITreeMapObject) => {},
  onCloseWithoutSelect: () => {},
  hierarchiesIds: [] as string[],
  workspaceId: '' as string,
  singleSelect: false,
  lockWorkspace: true,
  selectionHierarchy: Object.values(HierarchyEnum),
};

const modalName = ModalEnum.HIERARCHY_SELECT;

export const ModalSelectHierarchy: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { data: company } = useQueryCompany();
  const [selectData, setSelectData] = useState(initialHierarchySelectState);
  const { data } = useQueryHierarchies();
  const store = useStore();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialHierarchySelectState;

    if (initialData) {
      setSelectData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        if (company.workspace && company.workspace[0] && !newData.workspaceId) {
          newData.workspaceId = company.workspace[0].id;
        }

        return newData;
      });
    }
  }, [getModalData, company]);

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    onCloseModal(modalName);
    dispatch(setHierarchySearch(''));
  };

  const handleSelect = useCallback(() => {
    const nodesMap = store.getState().hierarchy.nodes as ITreeMap;
    const modalSelectIds = store.getState().hierarchy
      .modalSelectIds as string[];
    const hierarchies = modalSelectIds.map((id) => nodesMap[id]);

    onCloseModal(modalName);
    dispatch(setHierarchySearch(''));
    selectData.onSelect(hierarchies);
  }, [dispatch, onCloseModal, selectData, store]);

  const handleSingleSelect = useCallback(
    (id: string) => {
      const nodesMap = store.getState().hierarchy.nodes as ITreeMap;
      onCloseModal(modalName);
      dispatch(setHierarchySearch(''));
      selectData.onSingleSelect(nodesMap[id]);
    },
    [dispatch, onCloseModal, selectData, store],
  );

  const hasWorkspace =
    company && company.workspace && company.workspace.length > 0;

  const hasHierarchy = data && Object.keys(data).length > 0;

  const buttons = useMemo(() => {
    if (hasWorkspace && hasHierarchy)
      return [
        {},
        {
          text: 'Selecionar Ativos',
          variant: 'contained',
          onClick: () => handleSelect(),
        },
      ] as IModalButton[];
    return [{}] as IModalButton[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, data, handleSelect]);

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper semiFullScreen={hasWorkspace && hasHierarchy} center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8}>
          {hasWorkspace && hasHierarchy && (
            <ModalSelectHierarchyData
              selectedData={selectData}
              company={company}
              handleSingleSelect={handleSingleSelect}
            />
          )}
          {(!hasWorkspace || !hasHierarchy) &&
            (!hasWorkspace ? <EmptyWorkspaceData /> : <EmptyHierarchyData />)}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
