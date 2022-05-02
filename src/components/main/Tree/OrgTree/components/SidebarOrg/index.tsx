import React, { useCallback, useMemo, useRef } from 'react';

import { Slide } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  selectGhoId,
  selectGhoOpen,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRiskAddExpand,
  selectRiskAddInit,
  setRemoveGhoRisk,
} from 'store/reducers/hierarchy/riskAddSlice';

import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/useMutDeleteGho';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';

import { SideHeader } from './components/SideHeader';
import { SideItems } from './components/SideItems';
import { SideTable } from './components/SideTable';
import { SideTop } from './components/SideTop';
import { STBoxContainer, STBoxStack } from './styles';

export const SidebarOrg = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { data } = useQueryGHO();
  const { isOpen } = useSidebarDrawer();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const riskInit = useAppSelector(selectRiskAddInit);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();

  const handleAddGHO = async () => {
    onOpenModal(ModalEnum.GHO_ADD);
  };

  const handleEditGHO = (data: IGho) => {
    onOpenModal(ModalEnum.GHO_ADD, {
      id: data.id,
      name: data.name,
      status: data.status,
    });
  };

  const handleDeleteGHO = useCallback(
    (id: string) => {
      preventDelete(async () => {
        await deleteMutation.mutateAsync(id);
        dispatch(setGhoState({ hierarchies: [], data: null }));
        dispatch(setRemoveGhoRisk({ ghoId: id }));
      });
    },
    [deleteMutation, dispatch, preventDelete],
  );

  const handleSelectGHO = useCallback(
    (gho: IGho | null, hierarchies: string[]) => {
      if (!gho) return dispatch(setGhoState({ hierarchies: [], data: null }));

      const isSelected = selectedGhoId === gho.id;

      const data = {
        hierarchies: isSelected ? [] : hierarchies,
        data: gho,
      };

      dispatch(setGhoState(data));
    },
    [dispatch, selectedGhoId],
  );

  const memoItems = useMemo(() => {
    if (!data) return null;

    return data.map((gho) => {
      const isSelected = selectedGhoId === gho.id;

      return (
        <SFlex
          key={gho.id}
          sx={{
            gridTemplateColumns: '285px 1fr',
            display: 'grid',
          }}
          gap={5}
        >
          <SideItems
            data={gho}
            isSelected={isSelected}
            handleSelectGHO={handleSelectGHO}
            handleDeleteGHO={handleDeleteGHO}
            isDeleteLoading={deleteMutation.isLoading}
          />
          {riskInit && <SideTable isSelected={isSelected} gho={gho} />}
        </SFlex>
      );
    });
  }, [
    data,
    deleteMutation.isLoading,
    handleDeleteGHO,
    handleSelectGHO,
    selectedGhoId,
    riskInit,
  ]);

  return (
    <Slide
      direction="left"
      in={isGhoOpen || riskInit}
      mountOnEnter
      unmountOnExit
    >
      <STBoxContainer
        expanded={selectExpanded ? 1 : 0}
        risk_init={riskInit ? 1 : 0}
        open={isOpen ? 1 : 0}
      >
        <SideTop handleSelectGHO={handleSelectGHO} riskInit={riskInit} />
        <div style={{ overflow: 'auto', minWidth: '320px' }}>
          <table style={{ width: '100%' }}>
            <SideHeader
              handleSelectGHO={handleSelectGHO}
              handleEditGHO={handleEditGHO}
              handleAddGHO={handleAddGHO}
              isAddLoading={addMutation.isLoading}
              riskInit={riskInit}
              inputRef={inputRef}
            />
            <STBoxStack
              expanded={selectExpanded ? 1 : 0}
              risk_init={riskInit ? 1 : 0}
            >
              {memoItems}
            </STBoxStack>
          </table>
        </div>
      </STBoxContainer>
    </Slide>
  );
};
