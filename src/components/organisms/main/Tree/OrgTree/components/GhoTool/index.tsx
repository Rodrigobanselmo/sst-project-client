import { GseSaveConfirmation } from '../GseVisualAssistance/GseSaveConfirmation';
import { OrgFloatingPanel } from '../GseVisualAssistance/GseFloatingPanel';
import { Alert, TextField, MenuItem } from '@mui/material';
import {
  eligibleEnvironmentWorkspaces,
  environmentWorkspaceId,
  environmentGroups,
} from '../../org-panels.model';
import { useOrgPanelBusy } from '../../hooks/useOrgPanelBusy';
import { applyOrgWorkspaceFilterToQuery } from 'core/utils/org-workspace-query';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { Box } from '@mui/material';
import { useGseVisualAssistance } from '../GseVisualAssistance/GseVisualAssistance.context';
import {
  GseAssistanceControls,
  GseAssistanceLegend,
  GseGroupLegend,
  GseAssistanceInfo,
} from '../GseVisualAssistance/GseVisualAssistance';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { initialCharacterizationState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { ModalHierarchySanitization } from 'components/organisms/modals/ModalHierarchySanitization';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';
import {
  CharacterizationTypeEnum,
  getIsEnvironment,
} from 'project/enum/characterization-type.enum';
import {
  selectGhoId,
  selectGhoOpen,
  setGhoOpen,
  setGhoSearch,
  setGhoSearchSelect,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRiskAddExpand,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteGho';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { StructuralArchivedButton } from '@v2/features/sst-operational/StructuralArchivedButton';

import { GhoToolHeader } from './components/GhoToolHeader';
import { GhoToolTopButtons } from './components/GhoToolTopButtons';
import { GhoToolTreeFilter } from './components/GhoToolTreeFilter';
import { GhoToolView } from './components/GhoToolView';
import { STBoxContainer, STBoxStack, STTableContainer } from './styles';

const homoCharacterizationTabs = new Set<HomoTypeEnum>([
  HomoTypeEnum.ENVIRONMENT,
  HomoTypeEnum.WORKSTATION,
  HomoTypeEnum.EQUIPMENT,
  HomoTypeEnum.ACTIVITIES,
]);

const EnvironmentPanelFrame = ({ children }: { children: React.ReactNode }) =>
  children ? (
    <OrgFloatingPanel id="environment-floating-panel">{children}</OrgFloatingPanel>
  ) : null;

const modalPayloadForHomoFilter = (
  homoFilter: HomoTypeEnum,
  companyId: string,
  workspaceId: string,
): Partial<typeof initialCharacterizationState> => {
  const base = { companyId, workspaceId };
  let charType: CharacterizationTypeEnum | undefined;
  if (homoFilter === HomoTypeEnum.ENVIRONMENT) {
    charType = CharacterizationTypeEnum.GENERAL;
  } else if (homoFilter === HomoTypeEnum.WORKSTATION) {
    charType = CharacterizationTypeEnum.WORKSTATION;
  } else if (homoFilter === HomoTypeEnum.EQUIPMENT) {
    charType = CharacterizationTypeEnum.EQUIPMENT;
  } else if (homoFilter === HomoTypeEnum.ACTIVITIES) {
    charType = CharacterizationTypeEnum.ACTIVITIES;
  }

  if (!charType) return base;

  return {
    ...base,
    type: charType,
    characterizationType: getIsEnvironment(charType)
      ? ('environment' as const)
      : ('characterization' as const),
  } as Partial<typeof initialCharacterizationState>;
};

export const GhoTool = ({
  environmentOnly = false,
}: {
  environmentOnly?: boolean;
}) => {
  const assistance = useGseVisualAssistance();
  const inputRef = useRef<HTMLInputElement>(null);
  const { pathname, query, replace } = useRouter();
  const { data: company } = useQueryCompany();
  const { data: allGroups } = useQueryGHOAll();
  const panelBusy = useOrgPanelBusy();
  const eligibleWorkspaces = eligibleEnvironmentWorkspaces(
    company.workspace,
    company.id,
  );
  const environmentWorkspace = environmentWorkspaceId(
    query,
    eligibleWorkspaces,
  );
  const scopedEnvironments = environmentGroups(
    allGroups,
    company.id,
    environmentWorkspace,
  );
  const chooseEnvironmentWorkspace = (id: string) => {
    if (panelBusy || !eligibleWorkspaces.some((w) => w.id === id)) return;
    const nextQuery = { ...query };
    applyOrgWorkspaceFilterToQuery(nextQuery, [id]);
    dispatch(
      setGhoState({
        data: null,
        selected: null,
        hierarchies: [],
        search: '',
        searchSelect: '',
      }),
    );
    void replace({ pathname, query: nextQuery }, undefined, { shallow: true });
  };
  const { preventDelete } = usePreventAction();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();
  const isOrgMultiWorkspace = useOrgMultiWorkspaceMode();

  useEffect(() => {
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [dispatch]);

  useEffect(() => {
    if (environmentOnly || !isOrgMultiWorkspace) return;
    dispatch(setGhoState({ hierarchies: [], data: null, selected: null }));
    dispatch(setGhoOpen(false));
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [dispatch, isOrgMultiWorkspace, environmentOnly]);

  // HomoTypeEnum.GSE is 0 — do not use `|| null` or the default becomes null and breaks the list filter.
  const [filter, setFilter] = useState<HomoTypeEnum | null>(
    environmentOnly ? HomoTypeEnum.ENVIRONMENT : HomoTypeEnum.GSE,
  );

  useEffect(() => {
    if (!environmentOnly || !isGhoOpen || assistance?.active || panelBusy)
      return;
    if (environmentWorkspace && query.tabWorkspaceId !== environmentWorkspace)
      chooseEnvironmentWorkspace(environmentWorkspace);
  }, [
    environmentOnly,
    isGhoOpen,
    assistance?.active,
    panelBusy,
    environmentWorkspace,
    query.tabWorkspaceId,
  ]);

  const environmentScope = JSON.stringify([company.id, environmentWorkspace]);
  const previousEnvironmentScope = useRef<string | null>(null);
  useEffect(() => {
    if (
      !environmentOnly ||
      panelBusy ||
      previousEnvironmentScope.current === environmentScope
    )
      return;
    previousEnvironmentScope.current = environmentScope;
    dispatch(
      setGhoState({
        data: null,
        selected: null,
        hierarchies: [],
        search: '',
        searchSelect: '',
      }),
    );
  }, [environmentOnly, environmentScope, dispatch, panelBusy]);

  const handleAddGHO = async () => {
    if (assistance?.active) return;
    if (isOrgMultiWorkspace) return;
    onOpenModal(ModalEnum.GHO_ADD);
  };

  const handleEditGHO = (data: IGho) => {
    if (assistance?.active && !assistance.groups.some((g) => g.id === data.id)) return;
    if (panelBusy || assistance?.persistenceBusy) return;
    if (environmentOnly) {
      if (!scopedEnvironments.some((g) => g.id === data.id)) return;
      onOpenModal(ModalEnum.CHARACTERIZATION_ADD, {
        id: data.characterization?.id || data.id,
        companyId: company.id,
        workspaceId: environmentWorkspace,
        characterizationType: 'environment',
      });
      return;
    }
    if (isOrgMultiWorkspace) return;
    onOpenModal(ModalEnum.GHO_ADD, {
      id: data.id,
      name: data.name,
      status: data.status,
      description: data.description,
    });
  };

  const handleDeleteGHO = useCallback(
    (id: string, data?: IGho) => {
      if (assistance?.active && !assistance.groups.some((g) => g.id === id)) return;
      if (panelBusy || assistance?.persistenceBusy) return;
      if (environmentOnly && !scopedEnvironments.some((g) => g.id === id))
        return;
      if (isOrgMultiWorkspace) return;
      preventDelete(
        async () => {
          const removed = await deleteMutation.mutateAsync(id).catch(() => null);
          if (removed) dispatch(setGhoState({ hierarchies: [], data: null, selected: null }));
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
    [
      deleteMutation,
      dispatch,
      isOrgMultiWorkspace,
      preventDelete,
      assistance,
      panelBusy,
      environmentOnly,
      scopedEnvironments,
    ],
  );

  const handleSelectGHO = useCallback(
    (gho: IGho | null, hierarchies: string[]) => {
      if (panelBusy) return;
      if (
        environmentOnly &&
        gho &&
        !scopedEnvironments.some((g) => g.id === gho.id)
      )
        return;
      if (assistance?.active) {
        assistance.selectGroup(gho?.id || null);
        return;
      }
      if (isOrgMultiWorkspace) {
        if (!gho)
          dispatch(
            setGhoState({ hierarchies: [], data: null, selected: null }),
          );
        return;
      }
      if (!gho) {
        if (!selectExpanded) dispatch(setRiskAddToggleExpand());
        return dispatch(
          setGhoState({ hierarchies: [], data: null, selected: null }),
        );
      }

      const data = {
        hierarchies: hierarchies,
        data: gho,
      };

      if (selectExpanded) dispatch(setRiskAddToggleExpand());
      dispatch(setGhoState(data));
    },
    [
      dispatch,
      isOrgMultiWorkspace,
      selectExpanded,
      assistance,
      panelBusy,
      environmentOnly,
      scopedEnvironments,
    ],
  );

  const handleFilter = (filter: HomoTypeEnum | null) => {
    if (!environmentOnly) setFilter(filter);
  };

  const isOrgHierarquiaContext =
    pathname.includes('/empresas/') && pathname.includes('/hierarquia');
  const tabWorkspaceId = environmentOnly
    ? environmentWorkspace
    : isOrgHierarquiaContext
      ? (query.tabWorkspaceId as string | undefined)
      : undefined;

  const handleAddCharacterization = useCallback(() => {
    if (
      panelBusy ||
      (environmentOnly && !environmentWorkspace) ||
      isOrgMultiWorkspace
    )
      return;
    if (!company?.id || filter == null || !homoCharacterizationTabs.has(filter))
      return;

    const openModal = (workId: string) => {
      onOpenModal(
        ModalEnum.CHARACTERIZATION_ADD,
        modalPayloadForHomoFilter(filter, company.id, workId),
      );
    };

    if (tabWorkspaceId) {
      openModal(tabWorkspaceId);
      return;
    }

    const workspaces = company.workspace || [];
    if (workspaces.length === 1) {
      openModal(workspaces[0].id);
      return;
    }

    onOpenModal(ModalEnum.WORKSPACE_SELECT, {
      title: 'Selecione para qual Estabelecimento deseja adicionar',
      onSelect: (workspace: IWorkspace | IWorkspace[]) => {
        const w = Array.isArray(workspace) ? workspace[0] : workspace;
        if (w?.id) openModal(w.id);
      },
    } as typeof initialWorkspaceSelectState);
  }, [
    company?.id,
    company?.workspace,
    filter,
    isOrgMultiWorkspace,
    onOpenModal,
    tabWorkspaceId,
    panelBusy,
    environmentOnly,
    environmentWorkspace,
  ]);

  const floating = environmentOnly || assistance?.active;
  const PanelFrame = environmentOnly ? EnvironmentPanelFrame : React.Fragment;
  const showPanel = assistance?.active || (isGhoOpen && (environmentOnly || !isOrgMultiWorkspace));
  return (
    <>
      <PanelFrame>{showPanel && (
        <STBoxContainer
          expanded={!assistance?.active && selectExpanded ? 1 : 0}
          sx={
            floating
              ? {
                  m: 0,
                  width: '100%',
                  height: 'calc(100dvh - 216px)',
                  maxHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  minHeight: 0,
                }
              : undefined
          }
        >
          <GhoToolTopButtons
            handleSelectGHO={handleSelectGHO}
            environmentOnly={environmentOnly}
            archiveAction={company?.id && (
              <StructuralArchivedButton
                companyId={company.id}
                iconOnly
                table={
                  environmentOnly || (filter != null && homoCharacterizationTabs.has(filter))
                    ? 'CompanyCharacterization'
                    : 'HomogeneousGroup'
                }
                workspaceId={environmentOnly ? environmentWorkspace : tabWorkspaceId}
                label={
                  environmentOnly || (filter != null && homoCharacterizationTabs.has(filter))
                    ? 'Consultar ambientes e atividades encerrados'
                    : 'Consultar GSEs encerrados'
                }
              />
            )}
          />
          {environmentOnly && <Box id="environment-link-navigation-slot" />}
          {assistance?.active && (
            <Box
              sx={{
                flexShrink: 0,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <GseGroupLegend />
                <GseAssistanceLegend />
              </Box>
              <Box id="gse-review-navigation-slot" />
              <GseAssistanceInfo />
            </Box>
          )}
          <STTableContainer
            sx={
              floating
                ? {
                    display: 'block',
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    overscrollBehavior: 'contain',
                    scrollbarGutter: 'stable',
                    ...(environmentOnly && {
                      '& [data-gho-row]': {
                        width: '100%',
                        minWidth: 0,
                        gridTemplateColumns: 'minmax(0, 1fr)',
                      },
                    }),
                  }
                : undefined
            }
          >
            {assistance?.active && <GseAssistanceControls />}
            {environmentOnly && !assistance?.active && (
              <Box sx={{ pt: 5, mb: 2 }}>
                {!environmentWorkspace && (
                  <Alert severity="info">
                    Selecione um estabelecimento para gerenciar Ambientes.
                  </Alert>
                )}
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Estabelecimento"
                  value={environmentWorkspace || ''}
                  disabled={panelBusy || !eligibleWorkspaces.length}
                  onChange={(e) => chooseEnvironmentWorkspace(e.target.value)}
                >
                  {eligibleWorkspaces.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
            {(!environmentOnly || !!environmentWorkspace) && (
              <GhoToolHeader
                fillPanelWidth={environmentOnly}
                handleSelectGHO={handleSelectGHO}
                handleEditGHO={handleEditGHO}
                handleAddGHO={handleAddGHO}
                handleAddCharacterization={
                  !assistance?.active &&
                  filter != null &&
                  homoCharacterizationTabs.has(filter)
                    ? handleAddCharacterization
                    : undefined
                }
                isAddLoading={addMutation.isLoading}
                inputRef={inputRef}
                filter={filter}
              />
            )}

            <STBoxStack
              expanded={selectExpanded ? 1 : 0}
              sx={
                floating
                  ? {
                      minHeight: 0,
                      width: '100%',
                      maxHeight: 'none',
                      minWidth: 0,
                      overflow: 'visible',
                      overscrollBehavior: 'contain',
                      scrollbarGutter: 'stable',
                      '&::-webkit-scrollbar': { width: 8 },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'grey.500',
                      },
                    }
                  : undefined
              }
            >
              <GhoToolView
                handleEditGHO={handleEditGHO}
                environmentOnly={environmentOnly}
                environmentWorkspaceId={environmentWorkspace}
                environmentCompanyId={company.id}
                handleSelectGHO={handleSelectGHO}
                handleDeleteGHO={handleDeleteGHO}
                selectedGhoId={selectedGhoId}
                isDeleteLoading={deleteMutation.isLoading}
                handleFilter={handleFilter}
                filter={filter}
              />
            </STBoxStack>
            <GhoToolTreeFilter fillPanelWidth={environmentOnly} />
          </STTableContainer>
          {assistance?.active && <GseSaveConfirmation />}
        </STBoxContainer>
      )}</PanelFrame>
      <ModalAddProbability />
      <ModalExcelHierarchies />
      <ModalHierarchySanitization />
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
