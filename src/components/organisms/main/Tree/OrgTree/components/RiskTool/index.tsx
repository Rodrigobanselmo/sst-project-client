import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialGhoSelectState } from 'components/organisms/modals/ModalSelectGho';
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

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteGho';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import { useMutCopyCompany } from 'core/services/hooks/mutations/manager/useMutCopyCompany';
import { useMutCopyHomo } from 'core/services/hooks/mutations/manager/useMutCopyHomo';
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

export const RiskToolSlider = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { data: ghoQuery } = useQueryGHO();
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

  const viewType = useAppSelector((state) => state.riskAdd.viewType);
  const viewDataType = useAppSelector((state) => state.riskAdd.viewData);

  const isOpen = false;

  const { query } = useRouter();
  const isRiskOpen = useMemo(() => !!query.riskGroupId, [query]);

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

  const handleAddGHO = async () => {
    onStackOpenModal(ModalEnum.GHO_ADD);
  };

  const handleCopyGHO = async (data: IGho | IHierarchyTreeMapObject) => {
    const onSelectGhoData = async (gho: IGho, riskGroup: IRiskGroupData) => {
      const homoId = String(data.id).split('//');
      const isHierarchy = homoId.length > 1;

      copyHomoMutation.mutate({
        actualGroupId: homoId[0],
        riskGroupId: query.riskGroupId as string,
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
    dispatch(setRiskAddState({ viewType: option.value, isEdited: false }));
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
      return alert('Em breve!');
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
          />
          <STTableContainer>
            <RiskToolHeader
              handleCopyGHO={handleCopyGHO}
              handleSelectGHO={handleSelectGHO}
              handleEditGHO={handleEditGHO}
              handleAddGHO={handleAddGHO}
              isAddLoading={addMutation.isLoading}
              riskInit={isRiskOpen}
              inputRef={inputRef}
              viewDataType={viewDataType}
              viewType={viewType}
              ghoQuery={ghoQuery}
              loadingCopy={copyHomoMutation.isLoading}
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
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
