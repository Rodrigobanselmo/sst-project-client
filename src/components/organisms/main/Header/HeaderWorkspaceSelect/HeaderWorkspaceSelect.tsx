import Box from '@mui/material/Box';
import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';
import { WorkspaceBrowseAutocomplete } from '@v2/components/organisms/workspace/WorkspaceBrowseAutocomplete/WorkspaceBrowseAutocomplete';
import { documentsHeaderChipShellSx } from '@v2/components/organisms/workspace/documentsHeaderChipSelectPreset';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { DOCUMENTS_LIST_PATHNAME } from '../constants/documentsListRoute';
import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { IdsEnum } from 'core/enums/ids.enums';
import { useRouter } from 'next/router';

import { RoutesParamsEnum } from '../Location/hooks/useLocation';
import { STBox } from '../Tenant/Tenant';

export function HeaderWorkspaceSelect(): JSX.Element | null {
  const { isTablet } = useSidebarDrawer();
  const router = useRouter();
  const { pathname, query, push, asPath } = router;
  const companyId = query.companyId as string | undefined;
  const tabWorkspaceId = query.tabWorkspaceId as string | undefined;
  const workspaceRouteId = query.workspaceId as string | undefined;

  const isDocumentsListPage = pathname === DOCUMENTS_LIST_PATHNAME;
  const routeHasWorkspace = pathname.includes(RoutesParamsEnum.WORKSPACE);

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId: companyId || '',
  });

  const workspaceCount = workspaces?.results?.length ?? 0;

  if (!companyId) return null;

  if (!isLoadingAllWorkspaces && workspaceCount <= 1) {
    return null;
  }

  if (isDocumentsListPage) {
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
              void router.replace(
                {
                  pathname: router.pathname,
                  query: { ...router.query, tabWorkspaceId: id },
                },
                undefined,
                { shallow: true },
              );
            }}
            compact
            suppressWhenNotMultiple={false}
          />
        </Box>
      </STBox>
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
