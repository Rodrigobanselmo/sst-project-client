/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useEffect, useMemo } from 'react';

import { Box, Divider, Icon } from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import { SInput } from 'components/atoms/SInput';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { GhoSelect } from 'components/organisms/tagSelects/GhoSelect';
import { IGHOTypeSelectProps } from 'components/organisms/tagSelects/GhoSelect/types';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import { IHierarchyTypeSelectProps } from 'components/organisms/tagSelects/HierarchySelect/types';
import {
  setGhoSearchRisk,
  setGhoSelectedId,
} from 'store/reducers/hierarchy/ghoSlice';

import { SCopyIcon } from 'assets/icons/SCopyIcon';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useMutSyncDerivedMeasuresFromPlan } from 'core/services/hooks/mutations/checklist/riskData/useMutSyncDerivedMeasuresFromPlan';
import { queryClient } from 'core/services/queryClient';
import { useHorizontalScroll } from 'core/hooks/useHorizontalScroll';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

import { ITypeSelectProps } from '../../../../Selects/TypeSelect/types';
import { useListHierarchy } from '../../../hooks/useListHierarchy';
import {
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from '../../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';
import { SideInput } from '../../SIdeInput';
import { RiskToolColumns } from '../RiskToolColumns';
import { SideSelectViewContentProps } from './types';

export const getFilter = ({
  viewDataType,
}: {
  viewDataType: ViewsDataEnum;
}) => {
  const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;

  if (isHierarchy) return undefined;

  const filterOptions = [] as any;
  const defaultValue = [] as any;

  // CHARACTERIZATION now includes both ENVIRONMENT and WORKSTATION filters
  if (viewDataType == ViewsDataEnum.CHARACTERIZATION) {
    defaultValue.push(HomoTypeEnum.ENVIRONMENT);
    filterOptions.push(
      HomoTypeEnum.ENVIRONMENT,
      HomoTypeEnum.ACTIVITIES,
      HomoTypeEnum.EQUIPMENT,
      HomoTypeEnum.WORKSTATION,
    );
  }

  if (viewDataType == ViewsDataEnum.GSE) filterOptions.push(HomoTypeEnum.GSE);

  return { filterOptions, defaultFilter: defaultValue[0] };
};

export const getSelectedHierarchy = ({
  viewDataType,
  selected,
}: {
  viewDataType: ViewsDataEnum;
  selected: IGho | IHierarchy | IHierarchyTreeMapObject | null;
}) => {
  if (selected && 'description' in selected && selected.description) {
    const splitValues = selected.description.split('(//)');
    if (splitValues[1]) {
      return {
        name: splitValues[0],
        id: selected?.id,
        type: originRiskMap[splitValues[1] as any]?.name || '',
      };
    }
  }

  if (viewDataType == ViewsDataEnum.HIERARCHY)
    return {
      name: selected?.name,
      id: selected?.id,
      type:
        hierarchyConstant[(selected as any)?.type as HierarchyEnum]?.name || '',
    };

  return { name: selected?.name, id: selected?.id };
};

export const GhoOrHierarchySelect = ({
  isHierarchy,
  ...props
}: IGHOTypeSelectProps &
  IHierarchyTypeSelectProps & {
    isHierarchy?: boolean;
    multiple?: boolean;
  }) => {
  if (isHierarchy) return <HierarchySelect {...props} />;
  return <GhoSelect {...props} />;
};

export const RiskToolGhoHorizontal: FC<
  { children?: any } & SideSelectViewContentProps
> = ({
  handleAddGHO,
  ghoQuery,
  handleSelectGHO,
  handleEditGHO,
  handleCopyGHO,
  inputRef,
  viewType,
  viewDataType,
  loadingCopy,
  companyId,
  riskGroupId,
}) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.gho.selected);
  const { query } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const syncPlanMutation = useMutSyncDerivedMeasuresFromPlan();
  const { companyId: userCompanyId } = useGetCompanyId(true);

  const planWorkspaceId = useMemo(() => {
    const fromQuery = query.workspaceId as string | undefined;
    if (fromQuery) return fromQuery;
    if (!selected?.id) return undefined;
    const parts = String(selected.id).split('//');
    return parts.length >= 2 ? parts[1] : undefined;
  }, [query.workspaceId, selected?.id]);

  const homoIdForRefetch = useMemo(
    () => String(selected?.id || '').split('//')[0],
    [selected?.id],
  );

  const handleSyncWithPlan = useCallback(async () => {
    if (!planWorkspaceId) {
      enqueueSnackbar(
        'Selecione um estabelecimento (workspace) para sincronizar.',
        { variant: 'warning' },
      );
      return;
    }
    await syncPlanMutation.mutateAsync({
      riskFactorGroupDataId: String(riskGroupId),
      workspaceId: planWorkspaceId,
      ...(companyId ? { companyId: String(companyId) } : {}),
    });
    await queryClient.refetchQueries([
      QueryEnum.RISK_DATA,
      userCompanyId,
      riskGroupId,
      homoIdForRefetch,
    ]);
  }, [
    enqueueSnackbar,
    homoIdForRefetch,
    companyId,
    planWorkspaceId,
    riskGroupId,
    syncPlanMutation,
    userCompanyId,
  ]);

  /** V2: `ENVIRONMENT` e `CHARACTERIZATION` compartilham o mesmo literal de enum. */
  const showSyncPlanButton =
    String(viewDataType) === String(ViewsDataEnum.CHARACTERIZATION);

  useEffect(() => {
    if (!selected) {
      const listItem = document.getElementById(
        IdsEnum.INPUT_MENU_SEARCH_GHO_HIERARCHY,
      );
      listItem?.click();
    }
  }, [viewDataType, selected]);

  const handleSelect = useCallback(
    (data: IGho | IHierarchyTreeMapObject | IHierarchy) => {
      dispatch(
        setGhoSelectedId({
          childrenIds: (data as any)?.children?.map((i: any) => i?.id),
          ...data,
        } as any),
      );

      // Call the parent's handleSelectGHO to update URL and Redux state
      if (handleSelectGHO) {
        const isGho = 'hierarchyOnHomogeneous' in data;
        if (isGho) {
          const hierarchies =
            (data as IGho).hierarchyOnHomogeneous?.map(
              (h) => h.hierarchyId,
            ) || [];
          handleSelectGHO(data as IGho, hierarchies);
        } else {
          handleSelectGHO(data as any, [(data as IHierarchy).id]);
        }
      }

      if (inputRef && inputRef.current) inputRef.current.value = '';
    },
    [inputRef, dispatch, handleSelectGHO],
  );

  const { name, type } = getSelectedHierarchy({ selected, viewDataType });
  const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;

  return (
    <>
      <SFlex>
        <SFlex justifyContent="space-between" flex={1}>
          <GhoOrHierarchySelect
            isHierarchy={isHierarchy}
            tooltipText={(textField) => textField}
            text={name || ''}
            large
            icon={null}
            maxWidth={'auto'}
            handleSelect={(hierarchy: IHierarchy | IGho) => {
              handleSelect(hierarchy);
            }}
            allFilters
            companyId={companyId || ''}
            renderButton={({ onClick, text }) => {
              return (
                <Box
                  minWidth={285}
                  maxWidth={800}
                  width={
                    text.length ? Math.max(text.length * 15, 285) : undefined
                  }
                >
                  <SInput
                    id={IdsEnum.INPUT_MENU_SEARCH_GHO_HIERARCHY}
                    onClick={onClick}
                    placeholder={
                      viewsDataOptionsConstant[viewDataType].placeholder
                    }
                    variant="outlined"
                    subVariant="search"
                    fullWidth
                    value={text}
                    startAdornment={type || ''}
                    size="small"
                    endAdornment={
                      <>
                        {handleAddGHO && (
                          <STooltip withWrapper title={'Adicionar'}>
                            <SEndButton
                              bg={'tag.add'}
                              onClick={(e) => (handleAddGHO as any)(e)} //handleAddGHO()
                            />
                          </STooltip>
                        )}
                      </>
                    }
                  />
                </Box>
              );
            }}
            active={false}
            bg={'background.paper'}
            {...(getFilter({ viewDataType }) as any)}
          />
          {showSyncPlanButton && (
            <SButton
              variant="outlined"
              sx={{ height: 30 }}
              disabled={
                syncPlanMutation.isLoading ||
                !planWorkspaceId ||
                !riskGroupId ||
                !selected
              }
              onClick={() => void handleSyncWithPlan()}
            >
              <SText sx={{ mr: 5 }}>
                {syncPlanMutation.isLoading
                  ? 'Sincronizando…'
                  : 'Sincronizar com plano'}
              </SText>
            </SButton>
          )}
          <SButton
            onClick={() => {
              selected && handleCopyGHO(selected);
            }}
            loading={loadingCopy}
            disabled={!selected}
            variant="outlined"
            sx={{ height: 30 }}
          >
            <SText sx={{ mr: 5 }}>Importar riscos</SText>
            <Icon component={SCopyIcon} sx={{ fontSize: '1.2rem' }} />
          </SButton>
        </SFlex>
      </SFlex>
      <Divider sx={{ mt: 8, mb: 8 }} />

      {selected && (
        <SFlex align="center" gap={4} mb={0} mt={4}>
          <SideInput
            onSearch={(value) => dispatch(setGhoSearchRisk(value))}
            handleSelectGHO={handleSelectGHO}
            handleEditGHO={handleEditGHO}
            placeholder="Pesquisar por risco"
          />
          <RiskToolColumns viewType={viewType} />
        </SFlex>
      )}
    </>
  );
};
