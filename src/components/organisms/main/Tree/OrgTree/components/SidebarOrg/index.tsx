import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useStore } from 'react-redux';

import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { useRouter } from 'next/router';
import {
  setGhoMultiEditIds,
  setGhoMultiRemoveIds,
} from 'store/reducers/hierarchy/ghoMultiSlice';
import {
  selectGhoId,
  selectGhoOpen,
  setGhoSearch,
  setGhoSearchSelect,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
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
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { SideHeader } from './components/SideHeader';
import { SideInput } from './components/SIdeInput';
import { SideRow } from './components/SideRow';
import { SideTop } from './components/SideTop';
import { SideSelectedGho } from './components/SideToSelectedGho/SideSelectedGho';
import { SideUnselectedGho } from './components/SideToSelectedGho/SideUnselectedGho';
import { STBoxContainer, STBoxStack, StyledGridMultiGho } from './styles';
import { ViewTypeEnum } from './utils/view-type.enum';

export const SidebarOrg = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputSelectedRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { data } = useQueryGHO();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();
  const store = useStore();

  const [viewType, setViewType] = useState(ViewTypeEnum.SELECT);

  const isOpen = false;

  const { query } = useRouter();
  const isRiskOpen = useMemo(() => !!query.riskGroupId, [query]);

  const risk = useAppSelector(selectRisk);

  //! performance optimization here
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

  const handleSelectAll = useCallback(() => {
    const search = store.getState().gho.search as string;
    const allToSelect = data
      .filter((gho) =>
        stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputRef.current) inputRef.current.value = '';
    dispatch(setGhoSearch(''));

    dispatch(setGhoMultiEditIds(allToSelect));
  }, [data, dispatch, store]);

  const handleUnselectAll = useCallback(() => {
    const search = store.getState().gho.searchSelect as string;
    const selectedIds = store.getState().ghoMulti.selectedIds as string;
    const allToSelect = data
      .filter(
        (gho) =>
          selectedIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputSelectedRef.current) inputSelectedRef.current.value = '';
    dispatch(setGhoSearchSelect(''));

    dispatch(setGhoMultiEditIds(allToSelect));
  }, [data, dispatch, store]);

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
          <SideTop
            //! make it better for
            onChangeView={() =>
              setViewType(
                viewType === ViewTypeEnum.SELECT
                  ? ViewTypeEnum.LIST
                  : ViewTypeEnum.SELECT,
              )
            }
            handleSelectGHO={handleSelectGHO}
            riskInit={isRiskOpen}
          />
          <div style={{ overflow: 'auto', minWidth: '320px' }}>
            <table style={{ width: '100%' }}>
              <SideHeader
                handleSelectGHO={handleSelectGHO}
                handleEditGHO={handleEditGHO}
                handleAddGHO={handleAddGHO}
                isAddLoading={addMutation.isLoading}
                riskInit={isRiskOpen}
                inputRef={inputRef}
                viewType={viewType}
              />
              <STBoxStack
                expanded={selectExpanded ? 1 : 0}
                risk_init={isRiskOpen ? 1 : 0}
              >
                {viewType === ViewTypeEnum.LIST &&
                  data.map((gho) => (
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
                {viewType === ViewTypeEnum.SELECT && (
                  <>
                    <SFlex align="center">
                      <SideInput
                        ref={inputSelectedRef}
                        onSearch={(value) =>
                          dispatch(setGhoSearchSelect(value))
                        }
                        handleSelectGHO={handleSelectGHO}
                        handleEditGHO={handleEditGHO}
                      />
                      <STagButton
                        icon={IndeterminateCheckBoxOutlinedIcon}
                        tooltipTitle="Remover todos os GHOs abaixo"
                        sx={{ ml: 'auto', mr: 5 }}
                        large
                        text="Remover todos"
                        onClick={handleUnselectAll}
                      />
                    </SFlex>
                    <StyledGridMultiGho>
                      {data.map((gho) => (
                        <SideSelectedGho key={gho.id} data={gho} />
                      ))}
                    </StyledGridMultiGho>
                    <SFlex align="center">
                      <SideInput
                        ref={inputRef}
                        onSearch={(value) => dispatch(setGhoSearch(value))}
                        handleSelectGHO={handleSelectGHO}
                        handleEditGHO={handleEditGHO}
                        handleAddGHO={handleAddGHO}
                      />
                      <STagButton
                        icon={LibraryAddCheckOutlinedIcon}
                        tooltipTitle="Selecione todos os GHOs abaixo"
                        sx={{ ml: 'auto', mr: 5 }}
                        large
                        text="Selecione todos"
                        onClick={handleSelectAll}
                      />
                    </SFlex>
                    <StyledGridMultiGho>
                      {data.map((gho) => (
                        <SideUnselectedGho key={gho.id} data={gho} />
                      ))}
                    </StyledGridMultiGho>
                  </>
                )}
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
