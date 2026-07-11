import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { initialAutomateSubOfficeState } from 'components/organisms/modals/ModalAutomateSubOffice/hooks/useHandleActions';
import { useRouter } from 'next/router';
import { setGhoMultiState } from 'store/reducers/hierarchy/ghoMultiSlice';
import {
  selectGhoId,
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
import { usePushRoute } from 'core/hooks/actions-push/usePushRoute';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import { useMutCopyHomo } from 'core/services/hooks/mutations/manager/useMutCopyHomo';
import { useHierarchyTreeLoad } from '../../hooks/useHierarchyTreeLoad';
import { RiskToolHeader } from './components/RiskToolHeader';
import { RiskToolTopButtons } from './components/RiskToolTopButtons';
import { RiskToolGSEView } from './components/RiskToolViews/RiskToolGSEView';
import { RiskRowsExpandProvider } from './components/RiskToolViews/RiskToolGSEView/RiskRowsExpandContext';
import { IHierarchyTreeMapObject } from './components/RiskToolViews/RiskToolRiskView/types';
import { useOpenRiskTool } from './hooks/useOpenRiskTool';
import { useRiskToolCopyGhoImportFlow } from './hooks/useRiskToolCopyGhoImportFlow';
import {
  STBoxContainer,
  STBoxStack,
  STTableContainer,
} from './RiskTool.styles';
import {
  IViewsDataOption,
  ViewsDataEnum,
} from './utils/view-data-type.constant';
import { normalizeChildrenIds } from './utils/normalizeChildrenIds';
import {
  IViewsRiskOption,
  ViewTypeEnum,
} from './utils/view-risk-type.constant';

export type RiskToolV2Props = {
  riskGroupId: string;
  riskContextCompanyId?: string;
  embedded?: boolean;
  lockedViewData?: ViewsDataEnum;
  lockedGhoId?: string;
  lockedGhoName?: string;
  hideViewSwitcher?: boolean;
  hideGhoPicker?: boolean;
  disableEditGho?: boolean;
};

export const RiskToolV2 = ({
  riskGroupId,
  riskContextCompanyId,
  embedded = false,
  lockedViewData,
  lockedGhoId,
  lockedGhoName,
  hideViewSwitcher = false,
  hideGhoPicker = false,
  disableEditGho = false,
}: RiskToolV2Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const {
    gho: ghoQuery,
    hierarchies: hierarchyMap,
    isLoading: isHierarchyTreeLoading,
  } = useHierarchyTreeLoad();
  const { onStackOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const cleanMutation = useMutDeleteManyRiskData();
  const copyHomoMutation = useMutCopyHomo();
  const riskGroupIdMemo = riskGroupId;
  const { handleCopyGHO, loadingCopy: loadingCopyHomo } =
    useRiskToolCopyGhoImportFlow(riskGroupIdMemo, copyHomoMutation);
  const risk = useAppSelector(selectRisk);
  const { companyId: routerCompanyId } = useGetCompanyId();
  const companyId = riskContextCompanyId || routerCompanyId;
  const { handleAddCharacterization, handleAddEmployees } = usePushRoute();
  const viewType = ViewTypeEnum.SIMPLE_BY_GROUP;

  const { query, replace, pathname } = useRouter();
  const { onOpenSelected } = useOpenRiskTool();

  // Get viewDataType from URL query params or use default
  const viewDataTypeFromUrl = useMemo(() => {
    if (lockedViewData) return lockedViewData;
    const viewDataParam = query.viewData as string;
    if (
      viewDataParam &&
      Object.values(ViewsDataEnum).includes(viewDataParam as ViewsDataEnum)
    ) {
      return viewDataParam as ViewsDataEnum;
    }
    return ViewsDataEnum.HIERARCHY; // default
  }, [query.viewData, lockedViewData]);

  const viewDataType = useAppSelector(
    (state) => state.riskAdd.viewData,
  ) as unknown as ViewsDataEnum;

  const effectiveViewDataType = lockedViewData ?? viewDataType;

  // Get selected GHO ID from URL
  const selectedGhoIdFromUrl = useMemo(() => {
    return (query.ghoId as string) || null;
  }, [query.ghoId]);

  // Track user-initiated selections to avoid URL sync overwriting them
  const userSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lockedViewData) return;
    dispatch(setRiskAddState({ viewData: lockedViewData as any }));
  }, [dispatch, lockedViewData]);

  // Sync Redux state with URL on mount and when URL changes
  useEffect(() => {
    if (embedded) return;
    if (lockedViewData && viewDataTypeFromUrl !== viewDataType) {
      dispatch(setRiskAddState({ viewData: viewDataTypeFromUrl as any }));
      return;
    }
    if (viewDataTypeFromUrl !== viewDataType) {
      dispatch(setRiskAddState({ viewData: viewDataTypeFromUrl as any }));
    }
  }, [viewDataTypeFromUrl, dispatch, viewDataType, lockedViewData, embedded]);

  // Sync selected GHO/Hierarchy from URL to Redux (page load, back/forward)
  useEffect(() => {
    if (embedded) return;
    if (lockedGhoId) return;
    if (!selectedGhoIdFromUrl) return;
    // Skip if this URL change was triggered by a user selection we just made
    if (userSelectedIdRef.current === selectedGhoIdFromUrl) {
      userSelectedIdRef.current = null;
      return;
    }
    if (selectedGhoIdFromUrl === selectedGhoId) return;
    if (!ghoQuery && !hierarchyMap) return;

    // Try to find in GHO data first (for GSE, CHARACTERIZATION views)
    const gho = ghoQuery?.find((g) => g.id === selectedGhoIdFromUrl);
    if (gho) {
      const hierarchies =
        gho.hierarchyOnHomogeneous?.map((h) => h.hierarchyId) || [];
      dispatch(setGhoState({ data: gho, hierarchies }));
      dispatch(
        setGhoSelectedId({
          ...gho,
          childrenIds: normalizeChildrenIds((gho as any)?.children),
        } as any),
      );
      return;
    }

    // If not found in GHO, try to find in Hierarchy data
    const hierarchy = hierarchyMap?.[selectedGhoIdFromUrl];
    if (hierarchy) {
      dispatch(
        setGhoState({ data: hierarchy as any, hierarchies: [hierarchy.id] }),
      );
      dispatch(
        setGhoSelectedId({
          ...hierarchy,
          childrenIds: normalizeChildrenIds(hierarchy.children) || [],
        } as any),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGhoIdFromUrl, ghoQuery, hierarchyMap, dispatch]);

  // Initialize URL with viewData parameter if not present
  useEffect(() => {
    if (embedded || lockedViewData) return;
    if (!query.viewData) {
      const newQuery = { ...query, viewData: viewDataTypeFromUrl };
      replace({ pathname, query: newQuery }, undefined, { shallow: true });
    }
  }, []);

  // Clear search and selected GHO when view type changes
  useEffect(() => {
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [dispatch, viewDataType]);

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
    if (disableEditGho || hideGhoPicker) return;
    const isGSE = viewDataType == ViewsDataEnum.GSE;
    const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;
    const isCharacterization = viewDataType == ViewsDataEnum.CHARACTERIZATION;

    if (isGSE) onStackOpenModal(ModalEnum.GHO_ADD);
    if (isCharacterization) handleAddCharacterization();
    if (isHierarchy) handleAddEmployees();
  };

  const handleEditGHO = (data: IGho | IHierarchyTreeMapObject) => {
    if (disableEditGho) return;
    onStackOpenModal(ModalEnum.GHO_ADD, {
      id: data.id,
      name: data.name,
      description: 'description' in data ? data?.description : '',
      // status: data.status,
    });
  };

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
      if (lockedGhoId) {
        return;
      }
      if (!gho) {
        if (!selectExpanded) dispatch(setRiskAddToggleExpand());
        // Remove ghoId from URL when deselecting
        userSelectedIdRef.current = null;
        if (!embedded) {
          const newQuery = { ...query };
          delete newQuery.ghoId;
          replace({ pathname, query: newQuery }, undefined, { shallow: true });
        }
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

      // Update Redux first to avoid race condition with URL sync
      if (selectExpanded) dispatch(setRiskAddToggleExpand());
      dispatch(setGhoState(data));

      // Mark this as a user-initiated selection so URL sync skips it
      userSelectedIdRef.current = gho.id;
      // Embedded characterization editor: do not mutate parent page URL
      // (ghoId/viewData churn can blank the inline editor shell).
      if (!embedded) {
        const newQuery = { ...query, ghoId: gho.id };
        replace({ pathname, query: newQuery }, undefined, { shallow: true });
      }
    },
    [
      dispatch,
      selectExpanded,
      selectedGhoId,
      query,
      pathname,
      replace,
      lockedGhoId,
      embedded,
    ],
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
    if (hideViewSwitcher || lockedViewData) return;
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

    // Update URL with new viewData parameter and remove stale ghoId
    userSelectedIdRef.current = null;
    if (!embedded) {
      const newQuery: Record<string, any> = { ...query, viewData: option.value };
      delete newQuery.ghoId;
      replace({ pathname, query: newQuery }, undefined, { shallow: true });
    }

    dispatch(setGhoMultiState({ selectedDisabledIds: [], selectedIds: [] }));

    dispatch(setGhoSelectedId(null));
    dispatch(
      setRiskAddState({ viewData: option.value as any, isEdited: false }),
    );
    dispatch(setGhoState({ search: '', searchSelect: '', searchRisk: '' }));
    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
      }),
    );
  };

  return isHierarchyTreeLoading ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        minHeight: 280,
        width: '100%',
      }}
    >
      <CircularProgress size={32} />
      <Box
        component="span"
        sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}
      >
        Carregando vínculos e hierarquia…
      </Box>
    </Box>
  ) : (
    <STBoxContainer expanded={selectExpanded ? 1 : 0} risk_init={1} open={1}>
      <RiskToolTopButtons
        onChangeView={handleChangeView}
        onChangeViewData={handleChangeViewData}
        viewType={viewType}
        viewDataType={effectiveViewDataType}
        handleSelectGHO={handleSelectGHO}
        riskInit={true}
        riskGroupId={riskGroupIdMemo}
        hideViewSwitcher={hideViewSwitcher}
        hideCloseButton={embedded}
      />
      <STTableContainer>
        <RiskRowsExpandProvider>
          <RiskToolHeader
            handleCopyGHO={handleCopyGHO}
            handleSelectGHO={handleSelectGHO}
            handleEditGHO={handleEditGHO}
            handleAddGHO={handleAddGHO as any}
            isAddLoading={addMutation.isLoading}
            riskInit={true}
            inputRef={inputRef}
            viewDataType={effectiveViewDataType}
            viewType={viewType}
            ghoQuery={ghoQuery}
            loadingCopy={loadingCopyHomo}
            riskGroupId={riskGroupIdMemo}
            companyId={companyId}
            hideGhoPicker={hideGhoPicker}
            lockedGhoName={lockedGhoName}
            disableEditGho={disableEditGho}
          />
          <STBoxStack
            expanded={selectExpanded ? 1 : 0}
            risk_init={1}
            viewType={viewType}
          >
            {viewType === ViewTypeEnum.SIMPLE_BY_GROUP && (
              <RiskToolGSEView riskGroupId={riskGroupIdMemo} />
            )}
          </STBoxStack>
        </RiskRowsExpandProvider>
      </STTableContainer>
    </STBoxContainer>
  );
};
