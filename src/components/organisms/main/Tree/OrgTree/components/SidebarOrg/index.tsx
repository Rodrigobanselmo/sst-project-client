import React, { useCallback, useMemo, useRef } from 'react';

import { Slide } from '@mui/material';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { useRouter } from 'next/router';
import {
  selectGhoId,
  selectGhoOpen,
  setGhoOpen,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  selectRiskAddExpand,
  setRiskAddToggleExpand,
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
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';

import { SideHeader } from './components/SideHeader';
import { SideRow } from './components/SideRow';
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
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();

  const { query } = useRouter();
  const isRiskOpen = useMemo(() => !!query.riskGroupId, [query]);

  const risk = useAppSelector(selectRisk);
  const { data: riskData } = useQueryRiskData(
    query.riskGroupId as string,
    risk?.id as string,
  );

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
      });
    },
    [deleteMutation, dispatch, preventDelete],
  );

  const handleSelectGHO = useCallback(
    (gho: IGho | null, hierarchies: string[]) => {
      if (!gho) {
        if (!selectExpanded) dispatch(setRiskAddToggleExpand());
        return dispatch(setGhoState({ hierarchies: [], data: null }));
      }
      // push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
      // dispatch(setGhoOpen(true));

      const isSelected = selectedGhoId === gho.id;

      const data = {
        hierarchies: isSelected ? [] : hierarchies,
        data: gho,
      };

      if (selectExpanded) dispatch(setRiskAddToggleExpand());
      dispatch(setGhoState(data));
    },
    [dispatch, selectExpanded, selectedGhoId],
  );

  return (
    <>
      {(isGhoOpen || isRiskOpen) && (
        <STBoxContainer
          expanded={selectExpanded ? 1 : 0}
          risk_init={isRiskOpen ? 1 : 0}
          open={isOpen ? 1 : 0}
        >
          <SideTop handleSelectGHO={handleSelectGHO} riskInit={isRiskOpen} />
          <div style={{ overflow: 'auto', minWidth: '320px' }}>
            <table style={{ width: '100%' }}>
              <SideHeader
                handleSelectGHO={handleSelectGHO}
                handleEditGHO={handleEditGHO}
                handleAddGHO={handleAddGHO}
                isAddLoading={addMutation.isLoading}
                riskInit={isRiskOpen}
                inputRef={inputRef}
              />
              <STBoxStack
                expanded={selectExpanded ? 1 : 0}
                risk_init={isRiskOpen ? 1 : 0}
              >
                {data.map((gho) => (
                  <SideRow
                    key={gho.id}
                    gho={gho}
                    handleEditGHO={handleEditGHO}
                    handleSelectGHO={handleSelectGHO}
                    handleDeleteGHO={handleDeleteGHO}
                    selectedGhoId={selectedGhoId}
                    isDeleteLoading={deleteMutation.isLoading}
                    isRiskOpen={isRiskOpen}
                    riskData={riskData.find(
                      (data) => data.homogeneousGroupId == gho.id,
                    )}
                  />
                ))}
              </STBoxStack>
            </table>
          </div>
        </STBoxContainer>
      )}
      <ModalAddProbability />
      <ModalExcelHierarchies />
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
