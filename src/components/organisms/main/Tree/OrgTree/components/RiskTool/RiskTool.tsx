import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { initialAutomateSubOfficeState } from 'components/organisms/modals/ModalAutomateSubOffice/hooks/useHandleActions';
import { useRouter } from 'next/router';
import { setGhoMultiState } from 'store/reducers/hierarchy/ghoMultiSlice';
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
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { usePushRoute } from 'core/hooks/actions-push/usePushRoute';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteGho';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import { useMutCopyHomo } from 'core/services/hooks/mutations/manager/useMutCopyHomo';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { RiskToolHeader } from './components/RiskToolHeader';
import { RiskToolTopButtons } from './components/RiskToolTopButtons';
import { RiskToolGSEView } from './components/RiskToolViews/RiskToolGSEView';
import { RiskToolRiskView } from './components/RiskToolViews/RiskToolRiskView';
import { IHierarchyTreeMapObject } from './components/RiskToolViews/RiskToolRiskView/types';
import { SideSelectViewContent } from './components/SideSelectViewContent';
import { useOpenRiskTool } from './hooks/useOpenRiskTool';
import { useRiskToolCopyGhoImportFlow } from '../RiskToolV2/hooks/useRiskToolCopyGhoImportFlow';
import {
  STBoxContainer,
  STBoxStack,
  STTableContainer,
} from './RiskTool.styles';
import {
  IViewsDataOption,
  ViewsDataEnum,
} from './utils/view-data-type.constant';
import {
  IViewsRiskOption,
  ViewTypeEnum,
} from './utils/view-risk-type.constant';

export const RiskTool = ({ riskGroupId }: { riskGroupId?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { data: ghoQuery } = useQueryGHOAll();
  const { onStackOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();
  const cleanMutation = useMutDeleteManyRiskData();
  const copyHomoMutation = useMutCopyHomo();
  const risk = useAppSelector(selectRisk);
  const { companyId } = useGetCompanyId();
  const { handleAddCharacterization, handleAddEmployees } = usePushRoute();

  const viewType = useAppSelector((state) => state.riskAdd.viewType);
  const viewDataType = useAppSelector((state) => state.riskAdd.viewData);

  const isOpen = false;

  const { query } = useRouter();
  const riskGroupIdMemo = useMemo(
    () => (riskGroupId || query.riskGroupId || '') as string,

    [query.riskGroupId, riskGroupId],
  );
  const { handleCopyGHO, loadingCopy: loadingCopyHomo } =
    useRiskToolCopyGhoImportFlow(riskGroupIdMemo, copyHomoMutation);
  const isRiskOpen = useMemo(() => !!riskGroupIdMemo, [riskGroupIdMemo]);
  const { onOpenSelected } = useOpenRiskTool();

  useEffect(() => {
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [dispatch, viewType, viewDataType]);

  useEffect(() => {
    dispatch(setRiskAddState({ isEdited: false }));
    dispatch(setGhoState({ search: '', searchSelect: '', searchRisk: '' }));
    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
      }),
    );
  }, [dispatch]);

  const handleAddGHO = async (e: any) => {
    e.stopPropagation();
    const isGSE = viewDataType == ViewsDataEnum.GSE;
    const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;
    const isCharacterization =
      viewDataType == ViewsDataEnum.CHARACTERIZATION ||
      viewDataType == ViewsDataEnum.ENVIRONMENT;

    if (isGSE) onStackOpenModal(ModalEnum.GHO_ADD);
    if (isCharacterization) handleAddCharacterization();
    if (isHierarchy) handleAddEmployees();
  };

  const handleEditGHO = (data: IGho | IHierarchyTreeMapObject) => {
    onStackOpenModal(ModalEnum.GHO_ADD, {
      id: data.id,
      name: data.name,
      description: 'description' in data ? data?.description : '',
      // status: data.status,
    });
  };

  // const handleDeleteGHO = useCallback(
  //   (id: string, data?: IGho) => {
  //     if (riskGroupIdMemo && risk)
  //       preventDelete(
  //         async () => {
  //           cleanMutation.mutate({
  //             riskFactorGroupDataId: riskGroupIdMemo as string,
  //             homogeneousGroupIds: [id],
  //             riskIds: [risk.id],
  //             // ids: [riskData.id],
  //           });
  //         },
  //         <span>
  //           <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{data?.name}</p>
  //           Você tem certeza que deseja remover todos os dados relativo ao fator
  //           de risco/perigo:{' '}
  //           <span
  //             style={{
  //               fontSize: '0.95rem',
  //               textDecoration: 'underline',
  //               fontWeight: 500,
  //             }}
  //           >
  //             {risk.name}
  //           </span>
  //         </span>,
  //       );
  //   },
  //   [cleanMutation, preventDelete, riskGroupIdMemo, risk],
  // );

  const handleDelete = useCallback(
    (id: string, data?: IGho | IHierarchyTreeMapObject) => {
      if (riskGroupIdMemo && risk)
        preventDelete(
          async () => {
            cleanMutation.mutate({
              // riskFactorGroupDataId: riskGroupIdMemo as string,
              // homogeneousGroupIds: [id],
              // riskIds: [risk.id],
              ids: [id],
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
    [cleanMutation, preventDelete, riskGroupIdMemo, risk],
  );

  const handleSelectGHO = useCallback(
    (gho: IGho | null, hierarchies: string[]) => {
      if (!gho) {
        if (!selectExpanded) dispatch(setRiskAddToggleExpand());
        return dispatch(setGhoState({ hierarchies: [], data: null }));
      }

      const isSelected = selectedGhoId === gho.id;

      // If already selected, do nothing (keep selection)
      if (isSelected) {
        return;
      }

      const data = {
        hierarchies: hierarchies,
        data: gho,
      };

      if (selectExpanded) dispatch(setRiskAddToggleExpand());
      dispatch(setGhoState(data));
    },
    [dispatch, selectExpanded, selectedGhoId],
  );

  const handleChangeView = (option: IViewsRiskOption) => {
    dispatch(setRiskAddState({ viewType: option.value, isEdited: false }));
    dispatch(setGhoState({ search: '', searchSelect: '', searchRisk: '' }));
    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
      }),
    );
  };

  const handleChangeViewData = (
    option: Omit<IViewsDataOption, 'name' | 'placeholder'>,
  ) => {
    if (option.value === ViewsDataEnum.EMPLOYEE) {
      return onStackOpenModal(ModalEnum.AUTOMATE_SUB_OFFICE, {
        callback: (hierarchy) => {
          onOpenSelected({
            ghoId: hierarchy?.id || '',
            ghoName: hierarchy?.name || '',
          });
        },
      } as typeof initialAutomateSubOfficeState);
    }

    dispatch(setGhoMultiState({ selectedDisabledIds: [], selectedIds: [] }));

    dispatch(setGhoSelectedId(null));
    dispatch(setRiskAddState({ viewData: option.value, isEdited: false }));
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
            riskGroupId={riskGroupIdMemo}
          />
          <STTableContainer>
            <RiskToolHeader
              handleCopyGHO={handleCopyGHO}
              handleSelectGHO={handleSelectGHO}
              handleEditGHO={handleEditGHO}
              handleAddGHO={handleAddGHO as any}
              isAddLoading={addMutation.isLoading}
              riskInit={isRiskOpen}
              inputRef={inputRef}
              viewDataType={viewDataType}
              viewType={viewType}
              ghoQuery={ghoQuery}
              loadingCopy={loadingCopyHomo}
              riskGroupId={riskGroupIdMemo}
            />
            <STBoxStack
              expanded={selectExpanded ? 1 : 0}
              risk_init={isRiskOpen ? 1 : 0}
              viewType={viewType}
            >
              {viewType === ViewTypeEnum.SIMPLE_BY_GROUP && (
                <RiskToolGSEView riskGroupId={riskGroupIdMemo} />
              )}
              {viewType === ViewTypeEnum.SIMPLE_BY_RISK && (
                <RiskToolRiskView
                  handleEditGHO={handleEditGHO}
                  handleSelectGHO={handleSelectGHO}
                  handleDeleteGHO={handleDelete}
                  selectedGhoId={selectedGhoId}
                  isDeleteLoading={cleanMutation.isLoading}
                  isRiskOpen={isRiskOpen}
                  viewDataType={viewDataType}
                  riskGroupId={riskGroupIdMemo}
                />
              )}
              {viewType === ViewTypeEnum.MULTIPLE && (
                <SideSelectViewContent
                  viewDataType={viewDataType}
                  handleSelectGHO={handleSelectGHO}
                  handleEditGHO={handleEditGHO}
                  handleAddGHO={handleAddGHO as any}
                  inputRef={inputRef}
                  ghoQuery={ghoQuery}
                />
              )}
            </STBoxStack>
          </STTableContainer>
        </STBoxContainer>
      )}
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
