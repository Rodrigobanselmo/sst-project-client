import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Pagination,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';
import {
  useFetchBrowseFrpsExplainabilityLibrary,
  useMutateGenerateFrpsLibraryConceptual,
} from '@v2/services/forms/frps-explainability-library';

import { FrpsExplainabilityLibraryFiltersBar } from './components/FrpsExplainabilityLibraryFiltersBar';
import { FrpsExplainabilityLibrarySummaryCards } from './components/FrpsExplainabilityLibrarySummaryCards';
import { FrpsExplainabilityLibraryTable } from './components/FrpsExplainabilityLibraryTable';
import {
  FrpsLibraryConceptualViewDrawer,
  type FrpsLibraryViewTarget,
} from './components/FrpsLibraryConceptualViewDrawer';
import {
  FRPS_LIBRARY_DEFAULT_RISK_SUB_TYPE_ENUM,
  FRPS_LIBRARY_DEFAULT_RISK_TYPE,
  applyFrpsLibraryGeneralCatalog,
  buildFrpsLibraryBrowseParams,
  getFrpsLibraryDefaultUrlQuery,
  mapFrpsLibraryItemToTableRow,
  parseFrpsLibraryFiltersFromQuery,
  serializeFrpsLibraryFiltersToQuery,
  shouldApplyFrpsLibraryDefaultScope,
  type FrpsLibraryTableRow,
  type FrpsLibraryUrlFilters,
} from './frps-explainability-library-filters.util';
import { frpsLibraryPaginationSx } from './frps-explainability-library-pagination.styles';

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const maybeAxios = error as {
      response?: { data?: { message?: string | string[] } };
      message?: string;
    };
    const apiMessage = maybeAxios.response?.data?.message;
    if (Array.isArray(apiMessage) && apiMessage[0]) return String(apiMessage[0]);
    if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
    if (typeof maybeAxios.message === 'string' && maybeAxios.message) {
      return maybeAxios.message;
    }
  }
  return 'Erro inesperado.';
}

export const FrpsExplainabilityLibraryPage: FC = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthSuccess } = useAuthShow();
  const canAccess = isAuthSuccess({ roles: [RoleEnum.MASTER] });

  const [searchDraft, setSearchDraft] = useState('');
  const [urlReady, setUrlReady] = useState(false);
  const [generatingRowId, setGeneratingRowId] = useState<string | null>(null);
  const [viewTarget, setViewTarget] = useState<FrpsLibraryViewTarget | null>(
    null,
  );
  const [generateError, setGenerateError] = useState<string | null>(null);

  const filters = useMemo(
    () => parseFrpsLibraryFiltersFromQuery(router.query),
    [router.query],
  );

  useEffect(() => {
    if (!router.isReady) return;

    if (shouldApplyFrpsLibraryDefaultScope(router.query)) {
      void router.replace(
        {
          pathname: router.pathname,
          query: getFrpsLibraryDefaultUrlQuery(),
        },
        undefined,
        { shallow: true },
      );
      return;
    }

    setSearchDraft(filters.search);
    setUrlReady(true);
  }, [
    router.isReady,
    router.query,
    router.pathname,
    filters.search,
    router.replace,
  ]);

  const browseParams = useMemo(
    () => buildFrpsLibraryBrowseParams(filters),
    [filters],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchBrowseFrpsExplainabilityLibrary(browseParams, canAccess && urlReady);

  const generateMutation = useMutateGenerateFrpsLibraryConceptual();

  const rows = useMemo(
    () => (data?.items ?? []).map(mapFrpsLibraryItemToTableRow),
    [data?.items],
  );

  const pushFilters = (next: FrpsLibraryUrlFilters) => {
    void router.push(
      {
        pathname: router.pathname,
        query: serializeFrpsLibraryFiltersToQuery(next),
      },
      undefined,
      { shallow: true },
    );
  };

  const commitSearch = () => {
    const nextSearch = searchDraft.trim();
    if (nextSearch === filters.search) return;
    pushFilters({
      ...filters,
      search: nextSearch,
      page: 1,
    });
  };

  const handleView = (row: FrpsLibraryTableRow) => {
    if (!row.conceptualExplanationId) return;
    setGenerateError(null);
    setViewTarget({
      explanationId: row.conceptualExplanationId,
      itemName: row.name,
      itemType: row.itemType,
    });
  };

  const handleGenerate = async (row: FrpsLibraryTableRow) => {
    setGenerateError(null);
    setGeneratingRowId(row.id);

    try {
      const result = await generateMutation.mutateAsync({
        systemCatalogId: row.systemCatalogId,
        itemType: row.itemType,
      });

      enqueueSnackbar('Conhecimento conceitual gerado.', {
        variant: 'success',
      });

      setViewTarget({
        explanationId: result.id,
        itemName: row.name,
        itemType: row.itemType,
      });
    } catch (err) {
      const message = getErrorMessage(err);
      setGenerateError(message);
      enqueueSnackbar(`Falha ao gerar: ${message}`, { variant: 'error' });
    } finally {
      setGeneratingRowId(null);
    }
  };

  if (!canAccess) {
    return (
      <Alert severity="warning">
        Acesso restrito a usuários MASTER do sistema.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.75}>
        Biblioteca de Explicabilidade FRPS
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2.5} maxWidth={820}>
        Consulte e gere o conhecimento conceitual reutilizável das fontes
        geradoras e recomendações do catálogo system. A edição e a validação
        serão adicionadas nas próximas etapas.
      </Typography>

      <FrpsExplainabilityLibrarySummaryCards
        summary={data?.summary}
        scopeLabel={data?.scopeLabel}
      />

      <FrpsExplainabilityLibraryFiltersBar
        filters={filters}
        filterOptions={data?.filterOptions}
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        onSearchCommit={commitSearch}
        onFiltersChange={pushFilters}
        onGeneralCatalog={() =>
          pushFilters(applyFrpsLibraryGeneralCatalog(filters))
        }
        onRestoreDefaultScope={() =>
          pushFilters({
            ...filters,
            riskType: FRPS_LIBRARY_DEFAULT_RISK_TYPE,
            riskSubTypeEnum: FRPS_LIBRARY_DEFAULT_RISK_SUB_TYPE_ENUM,
            riskSubTypeId: null,
            riskId: null,
            generalCatalog: false,
            page: 1,
          })
        }
      />

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
          sx={{ mb: 2 }}
        >
          Não foi possível carregar a biblioteca.
          {error instanceof Error && error.message
            ? ` ${error.message}`
            : ''}
        </Alert>
      ) : null}

      {generateError ? (
        <Alert
          severity="error"
          onClose={() => setGenerateError(null)}
          sx={{ mb: 2 }}
        >
          Não foi possível gerar o conhecimento conceitual. {generateError}
        </Alert>
      ) : null}

      {!urlReady || isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body2" color="text.secondary">
              {data?.pagination.total ?? 0} item(ns)
              {isFetching ? ' · atualizando…' : ''}
            </Typography>
          </Box>

          <FrpsExplainabilityLibraryTable
            rows={rows}
            generatingRowId={generatingRowId}
            onGenerate={handleGenerate}
            onView={handleView}
          />

          {(data?.pagination.totalPages ?? 0) > 1 ? (
            <Box display="flex" justifyContent="center" mt={2.5}>
              <Pagination
                page={data?.pagination.page ?? filters.page}
                count={data?.pagination.totalPages ?? 1}
                onChange={(_, page) => pushFilters({ ...filters, page })}
                color="primary"
                sx={frpsLibraryPaginationSx}
              />
            </Box>
          ) : null}
        </>
      )}

      <FrpsLibraryConceptualViewDrawer
        open={Boolean(viewTarget)}
        target={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </Box>
  );
};
