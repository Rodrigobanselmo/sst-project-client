import { useCallback, useEffect, useMemo, useRef } from 'react';

import { initialAutomateSubOfficeState } from 'components/organisms/modals/ModalAutomateSubOffice/hooks/useHandleActions';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialGhoSelectState } from 'components/organisms/modals/ModalSelectGho';
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

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { usePushRoute } from 'core/hooks/actions-push/usePushRoute';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import { useMutCopyHomo } from 'core/services/hooks/mutations/manager/useMutCopyHomo';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { queryClient } from 'core/services/queryClient';

import { RiskToolHeader } from './components/RiskToolHeader';
import { RiskToolTopButtons } from './components/RiskToolTopButtons';
import { RiskToolGSEView } from './components/RiskToolViews/RiskToolGSEView';
import { IHierarchyTreeMapObject } from './components/RiskToolViews/RiskToolRiskView/types';
import { useOpenRiskTool } from './hooks/useOpenRiskTool';
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

export const RiskToolV2 = ({ riskGroupId }: { riskGroupId: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { data: ghoQuery } = useQueryGHOAll();
  const { data: hierarchyMap } = useQueryHierarchies();
  const { onStackOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const cleanMutation = useMutDeleteManyRiskData();
  const copyHomoMutation = useMutCopyHomo();
  const risk = useAppSelector(selectRisk);
  const { companyId } = useGetCompanyId();
  const { handleAddCharacterization, handleAddEmployees } = usePushRoute();

  const riskGroupIdMemo = riskGroupId;
  const viewType = ViewTypeEnum.SIMPLE_BY_GROUP;

  const { query, push, pathname } = useRouter();
  const { onOpenSelected } = useOpenRiskTool();

  // Get viewDataType from URL query params or use default
  const viewDataTypeFromUrl = useMemo(() => {
    const viewDataParam = query.viewData as string;
    if (
      viewDataParam &&
      Object.values(ViewsDataEnum).includes(viewDataParam as ViewsDataEnum)
    ) {
      return viewDataParam as ViewsDataEnum;
    }
    return ViewsDataEnum.HIERARCHY; // default
  }, [query.viewData]);

  const viewDataType = useAppSelector(
    (state) => state.riskAdd.viewData,
  ) as unknown as ViewsDataEnum;

  // Get selected GHO ID from URL
  const selectedGhoIdFromUrl = useMemo(() => {
    return (query.ghoId as string) || null;
  }, [query.ghoId]);

  // Sync Redux state with URL on mount and when URL changes
  useEffect(() => {
    if (viewDataTypeFromUrl !== viewDataType) {
      dispatch(setRiskAddState({ viewData: viewDataTypeFromUrl as any }));
    }
  }, [viewDataTypeFromUrl, dispatch, viewDataType]);

  // Sync selected GHO/Hierarchy from URL to Redux on mount
  useEffect(() => {
    if (
      selectedGhoIdFromUrl &&
      selectedGhoIdFromUrl !== selectedGhoId &&
      (ghoQuery || hierarchyMap)
    ) {
      // Try to find in GHO data first (for GSE, CHARACTERIZATION views)
      const gho = ghoQuery?.find((g) => g.id === selectedGhoIdFromUrl);
      if (gho) {
        const hierarchies =
          gho.hierarchyOnHomogeneous?.map((h) => h.hierarchyId) || [];

        // Update both the GHO state and the selected state for UI highlighting
        dispatch(setGhoState({ data: gho, hierarchies }));
        dispatch(
          setGhoSelectedId({
            childrenIds: (gho as any)?.children?.map((i: any) => i?.id),
            ...gho,
          } as any),
        );
        return;
      }

      // If not found in GHO, try to find in Hierarchy data (for SIMPLE_BY_GROUP view)
      const hierarchy = hierarchyMap?.[selectedGhoIdFromUrl];
      if (hierarchy) {
        // Update both the GHO state and the selected state for UI highlighting
        dispatch(
          setGhoState({ data: hierarchy as any, hierarchies: [hierarchy.id] }),
        );
        dispatch(
          setGhoSelectedId({
            childrenIds: hierarchy.children || [],
            ...hierarchy,
          } as any),
        );
      }
    }
  }, [selectedGhoIdFromUrl, ghoQuery, hierarchyMap, dispatch, selectedGhoId]);

  // Initialize URL with viewData parameter if not present
  useEffect(() => {
    if (!query.viewData) {
      const newQuery = { ...query, viewData: viewDataTypeFromUrl };
      push({ pathname, query: newQuery }, undefined, { shallow: true });
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
    const isGSE = viewDataType == ViewsDataEnum.GSE;
    const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;
    const isCharacterization = viewDataType == ViewsDataEnum.CHARACTERIZATION;

    if (isGSE) onStackOpenModal(ModalEnum.GHO_ADD);
    if (isCharacterization) handleAddCharacterization();
    if (isHierarchy) handleAddEmployees();
  };

  const handleCopyGHO = async (
    data: IGho | IHierarchyTreeMapObject | IHierarchy,
  ) => {
    const onSelectGhoData = async (gho: IGho, riskGroup: IRiskGroupData) => {
      const homoId = String(data.id).split('//');
      const isHierarchy = homoId.length > 1;
      copyHomoMutation.mutate({
        actualGroupId: homoId[0],
        riskGroupId: riskGroupIdMemo as string,
        companyId: companyId,
        companyIdFrom: gho.companyId,
        copyFromHomoGroupId: gho.id,
        riskGroupIdFrom: riskGroup.id,
        workspaceId: homoId.length == 2 ? homoId[1] : undefined,
        ...(isHierarchy ? { type: HomoTypeEnum.HIERARCHY } : {}),
      });
    };

    const onSelectRiskGroupData = async (
      riskGroup: IRiskGroupData,
      company: ICompany,
    ) => {
      queryClient.invalidateQueries([QueryEnum.GHO]);
      onStackOpenModal(ModalEnum.HOMOGENEOUS_SELECT, {
        // title: 'Selecione o Sistema de Gestão SST do GSE',
        onSelect: (gho) => onSelectGhoData(gho as IGho, riskGroup),
        companyId: company.id,
      } as Partial<typeof initialGhoSelectState>);
    };

    const onSelectCompany = async (company: ICompany) => {
      onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
        title: 'Selecione o Sistema de Gestão SST do GSE',
        onSelect: (riskGroup) =>
          onSelectRiskGroupData(riskGroup as IRiskGroupData, company),
        companyId: company.id,
      } as Partial<typeof initialDocPgrSelectState>);
    };

    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      multiple: false,
      onSelect: onSelectCompany,
    } as Partial<typeof initialCompanySelectState>);
  };

  const handleEditGHO = (data: IGho | IHierarchyTreeMapObject) => {
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
      if (!gho) {
        if (!selectExpanded) dispatch(setRiskAddToggleExpand());
        // Remove ghoId from URL when deselecting
        const newQuery = { ...query };
        delete newQuery.ghoId;
        push({ pathname, query: newQuery }, undefined, { shallow: true });
        return dispatch(setGhoState({ hierarchies: [], data: null }));
      }

      const isSelected = selectedGhoId === gho.id;

      const data = {
        hierarchies: isSelected ? [] : hierarchies,
        data: isSelected ? null : gho,
      };

      // Update URL with selected GHO ID
      if (!isSelected) {
        const newQuery = { ...query, ghoId: gho.id };
        push({ pathname, query: newQuery }, undefined, { shallow: true });
      } else {
        // Remove ghoId from URL when deselecting
        const newQuery = { ...query };
        delete newQuery.ghoId;
        push({ pathname, query: newQuery }, undefined, { shallow: true });
      }

      if (selectExpanded) dispatch(setRiskAddToggleExpand());
      dispatch(setGhoState(data));
    },
    [dispatch, selectExpanded, selectedGhoId, query, pathname, push],
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

    // Update URL with new viewData parameter
    const newQuery = { ...query, viewData: option.value };
    push({ pathname, query: newQuery }, undefined, { shallow: true });

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

  return (
    <>
      <STBoxContainer expanded={selectExpanded ? 1 : 0} risk_init={1} open={1}>
        <RiskToolTopButtons
          onChangeView={handleChangeView}
          onChangeViewData={handleChangeViewData}
          viewType={viewType}
          viewDataType={viewDataType}
          handleSelectGHO={handleSelectGHO}
          riskInit={true}
          riskGroupId={riskGroupIdMemo}
        />
        <STTableContainer>
          <RiskToolHeader
            handleCopyGHO={handleCopyGHO}
            handleSelectGHO={handleSelectGHO}
            handleEditGHO={handleEditGHO}
            handleAddGHO={handleAddGHO as any}
            isAddLoading={addMutation.isLoading}
            riskInit={true}
            inputRef={inputRef}
            viewDataType={viewDataType}
            viewType={viewType}
            ghoQuery={ghoQuery}
            loadingCopy={copyHomoMutation.isLoading}
            riskGroupId={riskGroupIdMemo}
            companyId={companyId}
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
        </STTableContainer>
      </STBoxContainer>
    </>
  );
};
