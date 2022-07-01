import React, { FC, useEffect, useState } from 'react';
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

import { ModalEnum } from 'core/enums/modal.enums';
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
  onCloseWithoutSelect: () => {},
  hierarchiesIds: [] as string[],
  workspaceId: '' as string,
  lockWorkspace: true,
};

const modalName = ModalEnum.HIERARCHY_SELECT;

export const ModalSelectHierarchy: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { data: company } = useQueryCompany();
  const [selectData, setSelectData] = useState(initialHierarchySelectState);
  const { data } = useQueryHierarchies();
  const store = useStore();

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

        return newData;
      });
    }
  }, [getModalData]);

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    onCloseModal(modalName);
  };

  const handleSelect = () => {
    const nodesMap = store.getState().hierarchy.nodes as ITreeMap;
    const modalSelectIds = store.getState().hierarchy
      .modalSelectIds as string[];
    const hierarchies = modalSelectIds.map((id) => nodesMap[id]);

    onCloseModal(modalName);
    selectData.onSelect(hierarchies);
  };

  const hasWorkspace =
    company && company.workspace && company.workspace.length > 0;

  const hasHierarchy = data && Object.keys(data).length > 0;

  const buttons = [{}] as IModalButton[];

  if (hasWorkspace && hasHierarchy)
    buttons.push({
      text: 'Selecionar Ativos',
      variant: 'contained',
      onClick: () => handleSelect(),
    });

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
