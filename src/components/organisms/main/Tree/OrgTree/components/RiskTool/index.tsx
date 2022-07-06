import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { useRouter } from 'next/router';
import {
  setGhoMultiAddIds,
  setGhoMultiState,
} from 'store/reducers/hierarchy/ghoMultiSlice';
import {
  selectGhoId,
  selectGhoOpen,
  setGhoFilterValues,
  setGhoSearch,
  setGhoSearchSelect,
  setGhoSelectedId,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  selectRiskAddExpand,
  setRiskAddState,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/useMutDeleteGho';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';

import { RiskToolHeader } from './components/RiskToolHeader';
import { RiskToolTopButtons } from './components/RiskToolTopButtons';
import { RiskToolGSEView } from './components/RiskToolViews/RiskToolGSEView';
import { RiskToolRiskView } from './components/RiskToolViews/RiskToolRiskView';
import { IHierarchyTreeMapObject } from './components/RiskToolViews/RiskToolRiskView/types';
import { SideSelectViewContent } from './components/SideSelectViewContent';
import { STBoxContainer, STBoxStack, STTableContainer } from './styles';
import {
  IViewsDataOption,
  ViewsDataEnum,
} from './utils/view-data-type.constant';
import {
  IViewsRiskOption,
  ViewTypeEnum,
} from './utils/view-risk-type.constant';

export const SidebarOrg = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { data: ghoQuery } = useQueryGHO();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();
  const cleanMutation = useMutDeleteManyRiskData();
  const risk = useAppSelector(selectRisk);

  const [viewType, setViewType] = useState(ViewTypeEnum.SIMPLE_BY_GROUP);
  const [viewDataType, setViewDataType] = useState(ViewsDataEnum.HIERARCHY);

  const isOpen = false;

  const { query } = useRouter();
  const isRiskOpen = useMemo(() => !!query.riskGroupId, [query]);

  useEffect(() => {
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [dispatch, viewType]);

  const handleAddGHO = async () => {
    onOpenModal(ModalEnum.GHO_ADD);
  };

  const handleEditGHO = (data: IGho | IHierarchyTreeMapObject) => {
    onOpenModal(ModalEnum.GHO_ADD, {
      id: data.id,
      name: data.name,
      description: 'description' in data ? data?.description : '',
      // status: data.status,
    });
  };

  const handleDeleteGHO = useCallback(
    (id: string, data?: IGho) => {
      if (query.riskGroupId && risk)
        preventDelete(
          async () => {
            cleanMutation.mutate({
              riskFactorGroupDataId: query.riskGroupId as string,
              homogeneousGroupIds: [id],
              riskIds: [risk.id],
            });
          },
          <span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{data?.name}</p>
            Você tem certeza que deseja remover todos os dados relativo ao fator
            de risco/perigo:{' '}
            <span
              style={{
                fontSize: '0.95rem',
                textDecoration: 'underline',
                fontWeight: 500,
              }}
            >
              {risk.name}
            </span>
          </span>,
        );
    },
    [cleanMutation, preventDelete, query.riskGroupId, risk],
  );

  const handleDelete = useCallback(
    (id: string, data?: IGho | IHierarchyTreeMapObject) => {
      if (query.riskGroupId && risk)
        preventDelete(
          async () => {
            cleanMutation.mutate({
              riskFactorGroupDataId: query.riskGroupId as string,
              homogeneousGroupIds: [id],
              riskIds: [risk.id],
            });
          },
          <span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{data?.name}</p>
            Você tem certeza que deseja remover todos os dados relativo ao fator
            de risco/perigo:{' '}
            <span
              style={{
                fontSize: '0.95rem',
                textDecoration: 'underline',
                fontWeight: 500,
              }}
            >
              {risk.name}
            </span>
          </span>,
        );
    },
    [cleanMutation, preventDelete, query.riskGroupId, risk],
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
    dispatch(setGhoState({ search: '', searchSelect: '', searchRisk: '' }));
    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
      }),
    );
  };

  const handleChangeViewData = (option: IViewsDataOption) => {
    if (option.value === ViewsDataEnum.EMPLOYEE) {
      alert('Em breve!');
    }

    setViewDataType(option.value);
    dispatch(setGhoMultiState({ selectedDisabledIds: [], selectedIds: [] }));

    dispatch(setGhoSelectedId(null));
    dispatch(setRiskAddState({ isEdited: false }));
    dispatch(setGhoState({ search: '', searchSelect: '', searchRisk: '' }));
    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
      }),
    );
  };

  return (
    <>
      {(isGhoOpen || isRiskOpen) && (
        <STBoxContainer
          expanded={selectExpanded ? 1 : 0}
          risk_init={isRiskOpen ? 1 : 0}
          open={isOpen ? 1 : 0}
        >
          <RiskToolTopButtons
            onChangeView={handleChangeView}
            onChangeViewData={handleChangeViewData}
            viewType={viewType}
            viewDataType={viewDataType}
            handleSelectGHO={handleSelectGHO}
            riskInit={isRiskOpen}
          />
          <STTableContainer>
            <RiskToolHeader
              handleSelectGHO={handleSelectGHO}
              handleEditGHO={handleEditGHO}
              handleAddGHO={handleAddGHO}
              isAddLoading={addMutation.isLoading}
              riskInit={isRiskOpen}
              inputRef={inputRef}
              viewDataType={viewDataType}
              viewType={viewType}
              ghoQuery={ghoQuery}
            />
            <STBoxStack
              expanded={selectExpanded ? 1 : 0}
              risk_init={isRiskOpen ? 1 : 0}
              viewType={viewType}
            >
              {viewType === ViewTypeEnum.SIMPLE_BY_GROUP && <RiskToolGSEView />}
              {viewType === ViewTypeEnum.SIMPLE_BY_RISK && (
                <RiskToolRiskView
                  handleEditGHO={handleEditGHO}
                  handleSelectGHO={handleSelectGHO}
                  handleDeleteGHO={handleDelete}
                  selectedGhoId={selectedGhoId}
                  isDeleteLoading={deleteMutation.isLoading}
                  isRiskOpen={isRiskOpen}
                  viewDataType={viewDataType}
                />
              )}
              {viewType === ViewTypeEnum.MULTIPLE && (
                <SideSelectViewContent
                  viewDataType={viewDataType}
                  handleSelectGHO={handleSelectGHO}
                  handleEditGHO={handleEditGHO}
                  handleAddGHO={handleAddGHO}
                  inputRef={inputRef}
                  ghoQuery={ghoQuery}
                />
              )}
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
