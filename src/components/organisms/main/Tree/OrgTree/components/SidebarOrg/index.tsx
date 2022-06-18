import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styled from '@emotion/styled';
import clone from 'clone';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { useRouter } from 'next/router';
import {
  selectGhoFilter,
  selectGhoId,
  selectGhoOpen,
  setGhoFilterValues,
  setGhoSearch,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  selectRiskAddExpand,
  setRiskAddState,
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

import { SideHeader } from './components/SideHeader';
import { SideRow } from './components/SideRow';
import { SideSelectViewContent } from './components/SideSelectViewContent';
import { SideTop } from './components/SideTop';
import { STBoxContainer, STBoxStack } from './styles';
import { IViewsRiskOption, ViewTypeEnum } from './utils/view-type.constant';

const STTableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
  min-width: 320px;

  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 24px;
    width: 5px;
    height: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 24px;
    background: ${({ theme }) => theme.palette.grey[300]};

    &:hover {
      background: ${({ theme }) => theme.palette.grey[500]};
    }
  }
`;

export const SidebarOrg = () => {
  const inputRef = useRef<HTMLInputElement>(null);
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

  const { companyId } = useGetCompanyId();

  const [viewType, setViewType] = useState(ViewTypeEnum.SIMPLE_BY_RISK);

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
        await deleteMutation.mutateAsync(id).catch(() => {});
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

  const handleChangeView = (option: IViewsRiskOption) => {
    setViewType(option.value);

    dispatch(setRiskAddState({ isEdited: false }));
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
            onChangeView={handleChangeView}
            viewType={viewType}
            handleSelectGHO={handleSelectGHO}
            riskInit={isRiskOpen}
          />
          <STTableContainer>
            {/* <table style={{ width: '100%' }}> */}
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
              {viewType === ViewTypeEnum.SIMPLE_BY_RISK &&
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
              {viewType === ViewTypeEnum.MULTIPLE && (
                <SideSelectViewContent
                  handleSelectGHO={handleSelectGHO}
                  handleEditGHO={handleEditGHO}
                  handleAddGHO={handleAddGHO}
                  inputRef={inputRef}
                  ghoQuery={ghoQuery}
                />
              )}
            </STBoxStack>
            {/* </table> */}
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
