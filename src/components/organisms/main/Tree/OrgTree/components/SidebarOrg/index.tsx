import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStore } from 'react-redux';

import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import clone from 'clone';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { useRouter } from 'next/router';
import {
  setGhoMultiAddIds,
  setGhoMultiDisabledAddIds,
  setGhoMultiDisabledRemoveIds,
  setGhoMultiRemoveIds,
} from 'store/reducers/hierarchy/ghoMultiSlice';
import {
  selectGhoFilter,
  selectGhoId,
  selectGhoOpen,
  setGhoFilterValues,
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
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/useMutDeleteGho';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';
import { sortFilter } from 'core/utils/sorts/filter.sort';
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
  const { data: ghoQuery } = useQueryGHO();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();
  const store = useStore();
  const { companyId } = useGetCompanyId();

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

  useEffect(() => {
    dispatch(setGhoSearch(''));
  }, [dispatch, viewType]);

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
    const allToSelect = ghoQuery
      .filter((gho) =>
        stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputRef.current) inputRef.current.value = '';
    dispatch(setGhoSearch(''));

    dispatch(setGhoMultiAddIds(allToSelect));
  }, [ghoQuery, dispatch, store]);

  const handleUnselectAll = useCallback(() => {
    const search = store.getState().gho.searchSelect as string;
    const selectedIds = store.getState().ghoMulti.selectedIds as string;
    const allToSelect = ghoQuery
      .filter(
        (gho) =>
          selectedIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputSelectedRef.current) inputSelectedRef.current.value = '';
    dispatch(setGhoSearchSelect(''));

    dispatch(setGhoMultiRemoveIds(allToSelect));
  }, [ghoQuery, dispatch, store]);

  const handleInvertDisabled = useCallback(() => {
    const search = store.getState().gho.searchSelect as string;
    const selectedIds = store.getState().ghoMulti.selectedIds as string[];
    const selectedDisabledIds = store.getState().ghoMulti
      .selectedDisabledIds as string[];

    const allSelected = ghoQuery
      .filter(
        (gho) =>
          selectedIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    const allDisabledSelect = ghoQuery
      .filter(
        (gho) =>
          selectedDisabledIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputSelectedRef.current) inputSelectedRef.current.value = '';
    dispatch(setGhoSearchSelect(''));

    dispatch(setGhoMultiDisabledAddIds(allSelected));
    dispatch(setGhoMultiDisabledRemoveIds(allDisabledSelect));
  }, [ghoQuery, dispatch, store]);

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

  const handleChangeView = () => {
    setViewType(
      viewType === ViewTypeEnum.SELECT
        ? ViewTypeEnum.LIST
        : ViewTypeEnum.SELECT,
    );

    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
      }),
    );
  };

  const ghoOrderedData = useMemo(() => {
    console.log(selectedGhoFilter.key, selectedGhoFilter.value);
    if (!ghoQuery) return [];
    if (!selectedGhoFilter.value || !selectedGhoFilter.key) return ghoQuery;
    const riskData = queryClient.getQueryData([
      QueryEnum.RISK_DATA,
      companyId,
      query.riskGroupId,
      risk?.id,
    ]) as IRiskData[];

    if (!riskData) return ghoQuery;
    if (riskData.length === 0) return ghoQuery;

    const ghoData = ghoQuery.map((gho) => {
      const riskDataFilters = riskData.map((rd) => {
        const copyItem = clone(rd) as Partial<IRiskData>;
        Object.entries(copyItem).map(([key, value]) => {
          if (Array.isArray(value)) (copyItem as any)[key] = value.length;
        });
        delete copyItem.id;

        return copyItem;
      });

      const foundRiskData = riskDataFilters.find(
        (risk) => risk.homogeneousGroupId === gho.id,
      );

      return {
        ...foundRiskData,
        ...gho,
      };
    });

    return ghoData.sort((a, b) =>
      sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key),
    );
  }, [
    companyId,
    ghoQuery,
    query.riskGroupId,
    risk?.id,
    selectedGhoFilter.key,
    selectedGhoFilter.value,
  ]);

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
            onChangeView={handleChangeView}
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
                  ghoOrderedData.map((gho) => (
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
                      <SFlex sx={{ ml: 'auto', mr: 5 }}>
                        <STagButton
                          icon={SwapHorizIcon}
                          text="Inverter desabiitados"
                          large
                          mr={5}
                          tooltipTitle="Todos os items desabilitados seram ativadoes e vice-versa"
                          onClick={handleInvertDisabled}
                        />
                        <STagButton
                          icon={IndeterminateCheckBoxOutlinedIcon}
                          tooltipTitle="Remover todos os GHOs abaixo"
                          mr={5}
                          large
                          text="Remover todos"
                          onClick={handleUnselectAll}
                        />
                      </SFlex>
                    </SFlex>
                    <StyledGridMultiGho>
                      {ghoQuery.map((gho) => (
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
                      {ghoQuery.map((gho) => (
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
