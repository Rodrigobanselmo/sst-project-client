import type { ParsedUrlQuery } from 'querystring';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';
import { WorkspaceBrowseAutocomplete } from '@v2/components/organisms/workspace/WorkspaceBrowseAutocomplete/WorkspaceBrowseAutocomplete';
import { documentsHeaderChipShellSx } from '@v2/components/organisms/workspace/documentsHeaderChipSelectPreset';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { DOCUMENTS_LIST_PATHNAME } from '../constants/documentsListRoute';
import { UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID } from 'components/organisms/main/Tree/OrgTree/utils/attach-establishment-group-layer';
import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { IdsEnum } from 'core/enums/ids.enums';
import { useRouter } from 'next/router';

import {
  CHARACTERIZATION_AMBIENTES_PATHNAME,
  CHARACTERIZATION_GSE_PATHNAME,
  ASSISTENTE_GSE_PATHNAME,
  CHEMICAL_PRODUCTS_PATHNAME,
  CharacterizationSubTabEnum,
  COMPANY_SST_PATHNAME,
  parseCharacterizationActiveTab,
} from 'core/constants/characterization-navigation.constants';
import { useHomeBusinessGroupScope } from 'core/hooks/useHomeBusinessGroupScope';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  applyOrgWorkspaceFilterToQuery,
  isOrgMultiWorkspaceMode,
  parseOrgWorkspaceFilterIds,
} from 'core/utils/org-workspace-query';
import { RoutesParamsEnum } from '../Location/hooks/useLocation';
import { STBox } from '../Tenant/Tenant';

export function HeaderWorkspaceSelect(): JSX.Element | null {
  const { isTablet } = useSidebarDrawer();
  const router = useRouter();
  const { pathname, query, push, asPath } = router;
  const { isHomePage, isGroupConsolidated } = useHomeBusinessGroupScope();
  const companyId = query.companyId as string | undefined;
  const tabWorkspaceId = query.tabWorkspaceId as string | undefined;
  const workspaceRouteId = query.workspaceId as string | undefined;

  const isDocumentsListPage = pathname === DOCUMENTS_LIST_PATHNAME;
  const isActionPlanPage = pathname === '/dashboard/empresas/[companyId]/plano-de-acao';
  const isCharacterizationRootPage =
    pathname === CHARACTERIZATION_AMBIENTES_PATHNAME;
  const isSstCharacterizationPage =
    pathname === COMPANY_SST_PATHNAME && query.stage === 'sst';
  const sstActiveTab = isSstCharacterizationPage
    ? parseCharacterizationActiveTab(query.active)
    : null;
  // Exams participates in the same tabWorkspaceId header selector as Riscos/GSE/etc.
  // Protocols remains excluded (legacy: not workspace-scoped in the header).
  const showSstWorkspaceSelector =
    isSstCharacterizationPage &&
    sstActiveTab !== CharacterizationSubTabEnum.PROTOCOLS;
  const isGseCharacterizationPage =
    pathname === CHARACTERIZATION_GSE_PATHNAME;
  const isChemicalProductsPage = pathname === CHEMICAL_PRODUCTS_PATHNAME;
  const isAssistenteGsePage = pathname === ASSISTENTE_GSE_PATHNAME;
  const isNewDocumentsStagePage =
    pathname === '/dashboard/empresas/[companyId]/novo/[stage]' &&
    query.stage === 'documentos';
  const isHierarchyOrganogramPage =
    typeof pathname === 'string' &&
    pathname.includes('/empresas/') &&
    pathname.includes('/hierarquia');
  const routeHasWorkspace = pathname.includes(RoutesParamsEnum.WORKSPACE);
  const isMultiOrgWorkspace = isOrgMultiWorkspaceMode(query);
  const leftoverSingularWorkspaceId = query.tabWorkspaceId;

  useEffect(() => {
    if (!isHierarchyOrganogramPage) return;
    if (!isMultiOrgWorkspace) return;
    if (leftoverSingularWorkspaceId == null || leftoverSingularWorkspaceId === '')
      return;

    const nextQuery = { ...query } as ParsedUrlQuery;
    applyOrgWorkspaceFilterToQuery(
      nextQuery,
      parseOrgWorkspaceFilterIds(query),
    );
    void router.replace(
      { pathname, query: nextQuery },
      undefined,
      { shallow: true },
    );
  }, [
    isHierarchyOrganogramPage,
    isMultiOrgWorkspace,
    leftoverSingularWorkspaceId,
    pathname,
    query,
    router,
  ]);

  // Only pages with an actual workspace selector need this optional lookup.
  // In particular, an eSocial-only reader must not fetch company data merely
  // because the global header is mounted on the eSocial page.
  const needsWorkspaceSelector = !(isHomePage && isGroupConsolidated) && (
    isDocumentsListPage || isActionPlanPage || isCharacterizationRootPage ||
    showSstWorkspaceSelector || isGseCharacterizationPage || isChemicalProductsPage ||
    isAssistenteGsePage || isNewDocumentsStagePage || isHierarchyOrganogramPage || routeHasWorkspace
  );
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId: companyId || '',
  }, { enabled: needsWorkspaceSelector });

  const workspaceCount = workspaces?.results?.length ?? 0;

  if (!companyId || !needsWorkspaceSelector) return null;

  if (isHomePage && isGroupConsolidated) {
    return null;
  }

  if (!isHierarchyOrganogramPage && !isLoadingAllWorkspaces && workspaceCount <= 1) {
    return null;
  }

  if (
    isDocumentsListPage ||
    isActionPlanPage ||
    isCharacterizationRootPage ||
    showSstWorkspaceSelector ||
    isGseCharacterizationPage ||
    isChemicalProductsPage ||
    isAssistenteGsePage ||
    isNewDocumentsStagePage
  ) {
    return (
      <STBox
        ml={2}
        display={isTablet ? 'none' : 'flex'}
        sx={{
          cursor: 'default',
          ...documentsHeaderChipShellSx,
        }}
        onClick={(e) => e.stopPropagation()}
        id={IdsEnum.DOCUMENTS_WORKSPACE_NAVBAR}
      >
        <SArrowUpFilterIcon
          sx={{
            fontSize: '20px',
            mt: 0,
            mr: 0.75,
            flexShrink: 0,
            transform: 'rotate(-180deg)',
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
          <WorkspaceBrowseAutocomplete
            companyId={companyId}
            workspaceId={tabWorkspaceId}
            onChange={(id) => {
              const nextQuery = { ...router.query } as ParsedUrlQuery;
              if (id) nextQuery.tabWorkspaceId = id;
              else delete nextQuery.tabWorkspaceId;

              void router.replace(
                {
                  pathname: router.pathname,
                  query: nextQuery,
                },
                undefined,
                { shallow: true },
              );
            }}
            allowEmptyWorkspace={
              isCharacterizationRootPage ||
              showSstWorkspaceSelector ||
              isGseCharacterizationPage ||
              isChemicalProductsPage ||
              isAssistenteGsePage
            }
            compact
            suppressWhenNotMultiple={false}
          />
        </Box>
      </STBox>
    );
  }

  if (isHierarchyOrganogramPage) {
    return (
      <OrganogramWorkspaceFilters
        companyId={companyId}
        availableWorkspaces={workspaces?.results}
        isLoading={isLoadingAllWorkspaces}
        isTablet={isTablet}
      />
    );
  }

  if (!routeHasWorkspace) return null;

  const handleRouteWorkspaceChange = (workspaceId: string) => {
    const querySuffix = asPath.includes('?')
      ? `?${asPath.split('?').slice(1).join('?')}`
      : '';

    const nextPath =
      '/' +
      pathname
        .replace(RoutesParamsEnum.COMPANY, companyId)
        .replace(RoutesParamsEnum.STAGE, String(query.stage ?? ''))
        .replace(RoutesParamsEnum.WORKSPACE, workspaceId)
        .replace(
          RoutesParamsEnum.CHARACTERIZATION,
          (query?.characterization as string) || '',
        )
        .replace(RoutesParamsEnum.DOC, (query.docId as string) || '') +
      querySuffix;

    void push(nextPath);
  };

  return (
    <STBox
      ml={2}
      display={isTablet ? 'none' : 'flex'}
      sx={{
        cursor: 'default',
        ...documentsHeaderChipShellSx,
      }}
      onClick={(e) => e.stopPropagation()}
      id={IdsEnum.WORKSPACE_SELECT_NAVBAR}
    >
      <SArrowUpFilterIcon
        sx={{
          fontSize: '20px',
          mt: 0,
          mr: 0.75,
          flexShrink: 0,
          transform: 'rotate(-180deg)',
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
        <WorkspaceBrowseAutocomplete
          companyId={companyId}
          workspaceId={workspaceRouteId}
          onChange={handleRouteWorkspaceChange}
          compact
          suppressWhenNotMultiple={false}
        />
      </Box>
    </STBox>
  );
}

const ORG_WORKSPACE_GROUP_QUERY_KEY = 'tabWorkspaceGroupId';

function OrganogramWorkspaceFilters({
  companyId,
  availableWorkspaces,
  isLoading,
  isTablet,
}: {
  companyId: string;
  availableWorkspaces?: { id: string }[];
  isLoading: boolean;
  isTablet: boolean;
}) {
  const router = useRouter();
  const { data: company } = useQueryCompany(companyId);
  const availableIds = new Set(availableWorkspaces?.map(({ id }) => id));
  const groups = company.establishmentGroups ?? [];
  const registeredGroupIds = new Set(groups.map(({ id }) => id));
  const workspaceIdsByGroup = new Map<string, string[]>();
  for (const workspace of company.workspace || []) {
    if (!availableIds.has(workspace.id)) continue;
    const assignedGroupId = workspace.establishmentGroupId;
    const groupId =
      assignedGroupId && registeredGroupIds.has(assignedGroupId)
        ? assignedGroupId
        : UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID;
    const ids = workspaceIdsByGroup.get(groupId) ?? [];
    ids.push(workspace.id);
    workspaceIdsByGroup.set(groupId, ids);
  }

  const groupOptions =
    groups.length && workspaceIdsByGroup.has(UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID)
      ? [...groups, { id: UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID, name: 'Sem grupo' }]
      : groups;
  const queryGroupId = router.query[ORG_WORKSPACE_GROUP_QUERY_KEY];
  const selectedIds = parseOrgWorkspaceFilterIds(router.query);
  const group = groupOptions.find(({ id }) => {
    if (id !== queryGroupId || !selectedIds.length) return false;
    const members = workspaceIdsByGroup.get(id);
    return members && selectedIds.every((workspaceId) => members.includes(workspaceId));
  });
  const groupWorkspaceIds = group && workspaceIdsByGroup.get(group.id);
  const isWholeGroup = groupWorkspaceIds?.length === selectedIds.length;

  if (!groups.length && !isLoading && availableIds.size <= 1) return null;

  const updateFilters = (groupId: string | undefined, workspaceIds: string[]) => {
    const query = { ...router.query };
    if (groupId) query[ORG_WORKSPACE_GROUP_QUERY_KEY] = groupId;
    else delete query[ORG_WORKSPACE_GROUP_QUERY_KEY];
    applyOrgWorkspaceFilterToQuery(query, workspaceIds);
    void router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  return (
    <STBox
      ml={2}
      display={isTablet ? 'none' : 'flex'}
      sx={{
        ...documentsHeaderChipShellSx,
        cursor: 'default',
        maxWidth: 420,
        ...(groups.length > 0 && { width: 'clamp(280px, 29vw, 400px)' }),
      }}
      onClick={(event) => event.stopPropagation()}
      id={IdsEnum.HIERARCHY_ORG_WORKSPACE_NAVBAR}
    >
      <SArrowUpFilterIcon
        sx={{
          fontSize: '20px',
          mr: 0.75,
          flexShrink: 0,
          transform: 'rotate(-180deg)',
        }}
      />
      {!!groups.length && (
        <Select
          value={group?.id ?? ''}
          displayEmpty
          size="small"
          inputProps={{ 'aria-label': 'Grupo de estabelecimentos' }}
          onChange={(event) => {
            const groupId = event.target.value;
            const ids = workspaceIdsByGroup.get(groupId);
            updateFilters(ids ? groupId : undefined, ids ?? []);
          }}
          renderValue={() => group?.name ?? 'Grupo de estabelecimentos'}
          sx={{
            minWidth: 0,
            flex: '0 0 48%',
            fontSize: 11,
            borderRight: '1px solid',
            borderColor: 'divider',
            '& .MuiSelect-select': { py: 0, pl: 1 },
            '& fieldset': { border: 0 },
          }}
        >
          <MenuItem value="">Todos os grupos</MenuItem>
          {groupOptions.map(({ id, name }) => (
            <MenuItem key={id} value={id} disabled={!workspaceIdsByGroup.has(id)}>
              {name}
            </MenuItem>
          ))}
        </Select>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <WorkspaceBrowseAutocomplete
          multiple
          companyId={companyId}
          workspaceIds={isWholeGroup ? [] : selectedIds}
          eligibleWorkspaceIds={groupWorkspaceIds}
          emptyPlaceholder={
            group?.id === UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID
              ? 'Todos sem grupo'
              : groupWorkspaceIds
                ? 'Todo o grupo'
                : undefined
          }
          onChange={(ids) =>
            updateFilters(group?.id, ids.length ? ids : groupWorkspaceIds ?? [])
          }
          allowEmptyWorkspace
          compact
          suppressWhenNotMultiple={false}
        />
      </Box>
    </STBox>
  );
}
