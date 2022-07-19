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
import {
  setHierarchySearch,
  setModalIds,
} from 'store/reducers/hierarchy/hierarchySlice';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';

import { EmptyHierarchyData } from '../empty/EmptyHierarchyData';
import { EmptyWorkspaceData } from '../empty/EmptyWorkspaceData';
import { useModalTree } from './hooks/useModalTree';
import { ModalTree } from './ModalTree';

export const ModalShowHierarchyTree: FC = () => {
  const props = useModalTree();
  const {
    company,
    registerModal,
    actualHierarchy,
    onCloseNoSelect,
    handleConfirm,
    modalName,
  } = props;

  const hasWorkspace =
    company && company.workspace && company.workspace.length > 0;

  const hasHierarchy =
    actualHierarchy && Object.keys(actualHierarchy).length > 0;

  const buttons = useMemo(() => {
    if (hasWorkspace && hasHierarchy)
      return [
        {},
        {
          text: 'Confirmar',
          variant: 'contained',
          onClick: () => handleConfirm(),
        },
      ] as IModalButton[];
    return [{}] as IModalButton[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, actualHierarchy]);

  return (
    <SModal {...registerModal(modalName)} keepMounted={false}>
      <SModalPaper
        sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
        semiFullScreen={hasWorkspace && hasHierarchy}
        center
        p={8}
      >
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box
          minHeight="100"
          sx={{
            display: 'flex',
            borderRadius: 2,
            flexDirection: 'column',
            flex: 1,
            backgroundColor: 'background.default',
          }}
          position="relative"
          mt={8}
        >
          {hasWorkspace && hasHierarchy && <ModalTree {...props} />}
          {(!hasWorkspace || !hasHierarchy) &&
            (!hasWorkspace ? <EmptyWorkspaceData /> : <EmptyHierarchyData />)}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
