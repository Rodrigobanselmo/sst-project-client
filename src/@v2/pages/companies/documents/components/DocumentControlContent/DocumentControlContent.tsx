import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { Box } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { DocumentControlTable } from '../DocumentControlTable/DocumentControlTable';

export const DocumentsContent = ({ companyId }: { companyId: string }) => {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
    tabTableIndex?: number;
  }>();

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  const sortedFirstId = useMemo(() => {
    if (!workspaces?.results?.length) return undefined;
    return [...workspaces.results]
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      )[0]?.id;
  }, [workspaces?.results]);

  useEffect(() => {
    if (workspaces?.results?.length !== 1) return;
    if (!sortedFirstId || queryParams.tabWorkspaceId) return;
    setQueryParams({ tabWorkspaceId: sortedFirstId });
  }, [
    queryParams.tabWorkspaceId,
    setQueryParams,
    sortedFirstId,
    workspaces?.results?.length,
  ]);

  if (isLoadingAllWorkspaces) {
    return <SSkeleton height={400} />;
  }

  if (!workspaces?.results?.length) {
    return (
      <SFlex flex={1} center py={8} bgcolor="grey.100" borderRadius={1}>
        <SText>Cadastre um estabelecimento antes</SText>
      </SFlex>
    );
  }

  if (!queryParams.tabWorkspaceId) {
    return (
      <Box mb={2} mt={1} color="text.secondary" fontSize={13}>
        Selecione um estabelecimento no header para carregar os documentos.
      </Box>
    );
  }

  return (
    <DocumentControlTable
      companyId={companyId}
      workspaceId={queryParams.tabWorkspaceId}
    />
  );
};
