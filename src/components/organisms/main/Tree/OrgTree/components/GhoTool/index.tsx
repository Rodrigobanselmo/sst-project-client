import React, { useCallback, useEffect, useRef } from 'react';

import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import {
  selectGhoId,
  selectGhoOpen,
  setGhoSearch,
  setGhoSearchSelect,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRiskAddExpand,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/useMutDeleteGho';

import { GhoToolHeader } from './components/GhoToolHeader';
import { GhoToolTopButtons } from './components/GhoToolTopButtons';
import { GhoToolView } from './components/GhoToolView';
import { STBoxContainer, STBoxStack, STTableContainer } from './styles';

export const GhoTool = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();

  useEffect(() => {
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [dispatch]);

  const handleAddGHO = async () => {
    onOpenModal(ModalEnum.GHO_ADD);
  };

  const handleEditGHO = (data: IGho) => {
    onOpenModal(ModalEnum.GHO_ADD, {
      id: data.id,
      name: data.name,
      status: data.status,
      description: data.description,
    });
  };

  const handleDeleteGHO = useCallback(
    (id: string, data?: IGho) => {
      preventDelete(
        async () => {
          await deleteMutation.mutateAsync(id).catch(() => {});
          dispatch(setGhoState({ hierarchies: [], data: null }));
        },
        <span>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Deletar {data?.name}
          </p>
          Você tem certeza que deseja remover permanentemente o grupo similar de
          esposição <b>{data?.name}</b>.
          <br />
          <br />
          Todos os dados de <b>Fatores de Risco / Perigos</b> vinculados a ele
          seram perdidos
        </span>,
        { inputConfirm: true },
      );
    },
    [deleteMutation, dispatch, preventDelete],
  );

  const handleSelectGHO = useCallback(
    (gho: IGho | null, hierarchies: string[]) => {
      if (!gho) {
        if (!selectExpanded) dispatch(setRiskAddToggleExpand());
        return dispatch(setGhoState({ hierarchies: [], data: null }));
      }

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
      {isGhoOpen && (
        <STBoxContainer expanded={selectExpanded ? 1 : 0}>
          <GhoToolTopButtons handleSelectGHO={handleSelectGHO} />
          <STTableContainer>
            <GhoToolHeader
              handleSelectGHO={handleSelectGHO}
              handleEditGHO={handleEditGHO}
              handleAddGHO={handleAddGHO}
              isAddLoading={addMutation.isLoading}
              inputRef={inputRef}
            />
            <STBoxStack expanded={selectExpanded ? 1 : 0}>
              <GhoToolView
                handleEditGHO={handleEditGHO}
                handleSelectGHO={handleSelectGHO}
                handleDeleteGHO={handleDeleteGHO}
                selectedGhoId={selectedGhoId}
                isDeleteLoading={deleteMutation.isLoading}
              />
            </STBoxStack>
          </STTableContainer>
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
