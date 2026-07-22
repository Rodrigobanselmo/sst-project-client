import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import {
  frpsExplainabilityLibraryQueryKeys,
  useFetchBrowseFrpsCatalogAdmin,
  useMutateGenerateFrpsLibraryConceptual,
  type FrpsCatalogAdminItem,
} from '@v2/services/forms/frps-explainability-library';

import { FrpsCatalogEquivalenceDialog } from './components/FrpsCatalogEquivalenceDialog';
import { FrpsExplainabilityLibraryFiltersBar } from './components/FrpsExplainabilityLibraryFiltersBar';
import { FrpsExplainabilityLibrarySummaryCards } from './components/FrpsExplainabilityLibrarySummaryCards';
import { FrpsExplainabilityLibraryTable } from './components/FrpsExplainabilityLibraryTable';
import {
  FrpsLibraryConceptualViewDrawer,
  type FrpsLibraryViewTarget,
} from './components/FrpsLibraryConceptualViewDrawer';
import {
  resolveFrpsGlobalCandidateHint,
  getFrpsAliasSelectionBlockReason,
} from './frps-catalog-admin-equivalence.util';
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
import { mergeFrpsEquivalenceSelectionAfterBatch } from './frps-catalog-equivalence-dialog.util';
import { FRPS_CREATE_GLOBAL_SUCCESS_MESSAGE } from './frps-create-global-canonical.util';
import {
  FRPS_LIBRARY_STICKY_TOOLBAR_SX,
  FRPS_VALIDATE_CONCEPTUAL_SUCCESS_MESSAGE,
  buildFrpsLinkToCanonicalButtonLabel,
} from './frps-explainability-library-ux.constants';
import { canShowFrpsLibraryConceptualValidateAction } from './frps-library-conceptual-validate.util';
import {
  areAllVisibleSelectableSelected,
  buildFrpsSelectVisibleButtonLabel,
  deselectVisibleSelectableAliases,
  getAutoExpandCanonicalIdsForSearch,
  getRenderedFrpsLibraryRows,
  getVisibleSelectableAliasRows,
  selectVisibleSelectableAliases,
} from './frps-library-table-visibility.util';

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
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthSuccess } = useAuthShow();
  const canAccess = isAuthSuccess({ roles: [RoleEnum.MASTER] });
  const theme = useTheme();
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'));

  const stickyToolbarRef = useRef<HTMLDivElement | null>(null);
  const [stickyOffsetPx, setStickyOffsetPx] = useState(0);

  const [searchDraft, setSearchDraft] = useState('');
  const [urlReady, setUrlReady] = useState(false);
  const [generatingRowId, setGeneratingRowId] = useState<string | null>(null);
  const [viewTarget, setViewTarget] = useState<FrpsLibraryViewTarget | null>(
    null,
  );
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [selectedLocals, setSelectedLocals] = useState<FrpsCatalogAdminItem[]>(
    [],
  );
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [equivalenceDialog, setEquivalenceDialog] = useState<{
    open: boolean;
    aliases: FrpsCatalogAdminItem[];
    preferManualPicker: boolean;
  }>({
    open: false,
    aliases: [],
    preferManualPicker: false,
  });
  /** Expansão manual — persiste enquanto a tela estiver montada. */
  const [userExpandedCanonicalIds, setUserExpandedCanonicalIds] = useState<
    Set<string>
  >(() => new Set());
  /** Recolhimento manual bloqueia auto-expand da mesma busca. */
  const [userCollapsedCanonicalIds, setUserCollapsedCanonicalIds] = useState<
    Set<string>
  >(() => new Set());
  /** Expansão automática por busca (aliases em grupos recolhidos). */
  const [autoExpandedCanonicalIds, setAutoExpandedCanonicalIds] = useState<
    Set<string>
  >(() => new Set());

  const filtersFromQuery = useMemo(
    () => parseFrpsLibraryFiltersFromQuery(router.query),
    [router.query],
  );

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(
      filtersFromQuery.limit,
      persistKeys.LIMIT_FRPS_EXPLAINABILITY_LIBRARY,
    );

  const filters = useMemo(
    () => ({
      ...filtersFromQuery,
      limit: pageLimit,
    }),
    [filtersFromQuery, pageLimit],
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

  useEffect(() => {
    if (!router.isReady || !urlReady) return;
    if (filtersFromQuery.limit === pageLimit) return;
    void router.replace(
      {
        pathname: router.pathname,
        query: serializeFrpsLibraryFiltersToQuery({
          ...filtersFromQuery,
          limit: pageLimit,
        }),
      },
      undefined,
      { shallow: true },
    );
  }, [
    router.isReady,
    urlReady,
    filtersFromQuery,
    pageLimit,
    router.pathname,
    router.replace,
  ]);

  const browseParams = useMemo(
    () => buildFrpsLibraryBrowseParams(filters),
    [filters],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchBrowseFrpsCatalogAdmin(browseParams, canAccess && urlReady);

  const generateMutation = useMutateGenerateFrpsLibraryConceptual();

  const rows = useMemo(() => {
    const pageItems = data?.items ?? [];
    const canonicalIdsOnPage = new Set(
      pageItems.filter((item) => item.isCanonical).map((item) => item.id),
    );
    return pageItems.map((item) =>
      mapFrpsLibraryItemToTableRow(item, {
        globalCandidateHint: resolveFrpsGlobalCandidateHint(item, pageItems),
        canonicalIdsOnPage,
      }),
    );
  }, [data?.items]);

  const expandedCanonicalIds = useMemo(() => {
    const next = new Set(userExpandedCanonicalIds);
    for (const id of autoExpandedCanonicalIds) next.add(id);
    return next;
  }, [userExpandedCanonicalIds, autoExpandedCanonicalIds]);

  const renderedRows = useMemo(
    () => getRenderedFrpsLibraryRows(rows, expandedCanonicalIds),
    [rows, expandedCanonicalIds],
  );

  const visibleSelectableRows = useMemo(
    () => getVisibleSelectableAliasRows(renderedRows),
    [renderedRows],
  );

  const selectedLocalIds = useMemo(
    () => new Set(selectedLocals.map((item) => item.id)),
    [selectedLocals],
  );

  const allVisibleSelected = useMemo(
    () =>
      areAllVisibleSelectableSelected({
        visibleSelectable: visibleSelectableRows,
        selectedIds: selectedLocalIds,
      }),
    [visibleSelectableRows, selectedLocalIds],
  );

  useEffect(() => {
    setUserCollapsedCanonicalIds(new Set());
  }, [filters.search]);

  useEffect(() => {
    const autoIds = getAutoExpandCanonicalIdsForSearch({
      rows,
      search: filters.search,
    });
    for (const id of userCollapsedCanonicalIds) {
      autoIds.delete(id);
    }
    setAutoExpandedCanonicalIds(autoIds);
  }, [rows, filters.search, userCollapsedCanonicalIds]);

  useLayoutEffect(() => {
    const node = stickyToolbarRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const applyOffset = () => {
      const next = Math.ceil(node.getBoundingClientRect().height);
      setStickyOffsetPx(next);
      document.documentElement.style.setProperty(
        '--frps-library-sticky-offset',
        `${next}px`,
      );
    };

    applyOffset();
    const observer = new ResizeObserver(applyOffset);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(
        '--frps-library-sticky-offset',
      );
    };
  }, [
    isCompactViewport,
    selectedLocals.length,
    selectionError,
    data?.scopeLabel,
  ]);

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

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    pushFilters({
      ...filters,
      limit: patch.limit ?? filters.limit,
      page: patch.page ?? 1,
    });
  });

  const commitSearch = () => {
    const nextSearch = searchDraft.trim();
    if (nextSearch === filters.search) return;
    pushFilters({
      ...filters,
      search: nextSearch,
      page: 1,
    });
  };

  const handleToggleLocal = (row: FrpsLibraryTableRow) => {
    const item = row.raw;
    setSelectionError(null);

    if (selectedLocalIds.has(item.id)) {
      setSelectedLocals((prev) => prev.filter((alias) => alias.id !== item.id));
      return;
    }

    const blockReason = getFrpsAliasSelectionBlockReason(selectedLocals, item);
    if (blockReason) {
      setSelectionError(blockReason);
      enqueueSnackbar(blockReason, { variant: 'warning' });
      return;
    }

    setSelectedLocals((prev) => [...prev, item]);
  };

  const handleToggleCanonicalGroup = (canonicalId: string) => {
    const currentlyExpanded = expandedCanonicalIds.has(canonicalId);

    if (currentlyExpanded) {
      setUserExpandedCanonicalIds((prev) => {
        if (!prev.has(canonicalId)) return prev;
        const next = new Set(prev);
        next.delete(canonicalId);
        return next;
      });
      setAutoExpandedCanonicalIds((prev) => {
        if (!prev.has(canonicalId)) return prev;
        const next = new Set(prev);
        next.delete(canonicalId);
        return next;
      });
      setUserCollapsedCanonicalIds((prev) => {
        const next = new Set(prev);
        next.add(canonicalId);
        return next;
      });
      return;
    }

    setUserCollapsedCanonicalIds((prev) => {
      if (!prev.has(canonicalId)) return prev;
      const next = new Set(prev);
      next.delete(canonicalId);
      return next;
    });
    setUserExpandedCanonicalIds((prev) => {
      const next = new Set(prev);
      next.add(canonicalId);
      return next;
    });
  };

  const handleToggleSelectVisible = () => {
    setSelectionError(null);

    if (!visibleSelectableRows.length) {
      enqueueSnackbar('Nenhum alias elegível visível nesta página.', {
        variant: 'info',
      });
      return;
    }

    if (allVisibleSelected) {
      setSelectedLocals((prev) =>
        deselectVisibleSelectableAliases({
          visibleSelectable: visibleSelectableRows,
          selectedLocals: prev,
        }),
      );
      return;
    }

    const { nextSelected, addedCount, skippedCount } =
      selectVisibleSelectableAliases({
        visibleSelectable: visibleSelectableRows,
        selectedLocals,
      });
    setSelectedLocals(nextSelected);

    if (addedCount === 0 && skippedCount > 0) {
      const message =
        'Nenhum alias visível pôde ser selecionado com a seleção atual.';
      setSelectionError(message);
      enqueueSnackbar(message, { variant: 'warning' });
    }
  };

  const handleView = (row: FrpsLibraryTableRow) => {
    if (!row.conceptualExplanationId) return;
    setGenerateError(null);
    setViewTarget({
      explanationId: row.conceptualExplanationId,
      itemName: row.name,
      itemType: row.itemType,
      canValidateConceptual: canShowFrpsLibraryConceptualValidateAction({
        isMaster: canAccess,
        origin: row.origin,
        isAliasRow: row.isAliasRow,
        conceptualExplanationId: row.conceptualExplanationId,
        validationStatus: row.status,
      }),
    });
  };

  const handleGenerate = async (row: FrpsLibraryTableRow) => {
    setGenerateError(null);
    setGeneratingRowId(row.id);

    try {
      const result = await generateMutation.mutateAsync({
        systemCatalogId: row.catalogId,
        itemType: row.itemType,
      });

      enqueueSnackbar('Conhecimento conceitual gerado.', {
        variant: 'success',
      });

      setViewTarget({
        explanationId: result.id,
        itemName: row.name,
        itemType: row.itemType,
        canValidateConceptual: canShowFrpsLibraryConceptualValidateAction({
          isMaster: canAccess,
          origin: row.origin,
          isAliasRow: row.isAliasRow,
          conceptualExplanationId: result.id,
          validationStatus: 'DRAFT_AI',
        }),
      });
    } catch (err) {
      const message = getErrorMessage(err);
      setGenerateError(message);
      enqueueSnackbar(`Falha ao gerar: ${message}`, { variant: 'error' });
    } finally {
      setGeneratingRowId(null);
    }
  };

  const openEquivalenceDialogFromSelection = () => {
    if (!selectedLocals.length) return;
    setSelectionError(null);
    setEquivalenceDialog({
      open: true,
      aliases: selectedLocals,
      preferManualPicker: false,
    });
  };

  const openEquivalenceDialogFromRow = (
    row: FrpsLibraryTableRow,
    options: { preferManualPicker: boolean },
  ) => {
    setSelectionError(null);
    setEquivalenceDialog({
      open: true,
      aliases: [row.raw],
      preferManualPicker: options.preferManualPicker,
    });
  };

  const closeEquivalenceDialog = () => {
    setEquivalenceDialog({
      open: false,
      aliases: [],
      preferManualPicker: false,
    });
  };

  const handleConceptualValidated = async () => {
    enqueueSnackbar(FRPS_VALIDATE_CONCEPTUAL_SUCCESS_MESSAGE, {
      variant: 'success',
    });
    await queryClient.invalidateQueries({
      queryKey: frpsExplainabilityLibraryQueryKeys.all,
    });
    await refetch();
  };

  const handleEquivalenceCompleted = async (
    failedAliases: FrpsCatalogAdminItem[],
  ) => {
    const attemptedAliasIds = new Set(
      equivalenceDialog.aliases.map((alias) => alias.id),
    );
    setSelectedLocals((prev) =>
      mergeFrpsEquivalenceSelectionAfterBatch({
        previousSelected: prev,
        attemptedAliasIds,
        failedAliases,
      }),
    );

    await queryClient.invalidateQueries({
      queryKey: frpsExplainabilityLibraryQueryKeys.all,
    });
    await refetch();

    if (failedAliases.length === 0) {
      enqueueSnackbar('Equivalências criadas com sucesso.', {
        variant: 'success',
      });
      closeEquivalenceDialog();
    } else {
      setEquivalenceDialog((prev) => ({
        ...prev,
        open: true,
        aliases: failedAliases,
      }));
      enqueueSnackbar(
        `${failedAliases.length} alias(es) falharam e permaneceram selecionados para retry.`,
        { variant: 'warning' },
      );
    }
  };

  const handleCreateGlobalCompleted = async (linkedAliasIds: string[]) => {
    const linked = new Set(linkedAliasIds);
    setSelectedLocals((prev) => prev.filter((item) => !linked.has(item.id)));
    await queryClient.invalidateQueries({
      queryKey: frpsExplainabilityLibraryQueryKeys.all,
    });
    await refetch();
    enqueueSnackbar(FRPS_CREATE_GLOBAL_SUCCESS_MESSAGE, { variant: 'success' });
    closeEquivalenceDialog();
  };

  if (!canAccess) {
    return (
      <Alert severity="warning">
        Acesso restrito a usuários MASTER do sistema.
      </Alert>
    );
  }

  return (
    <Box style={{ ['--frps-library-sticky-offset' as string]: `${stickyOffsetPx}px` }}>
      <Box mb={isCompactViewport ? 1.5 : 2}>
        <Typography variant="h5" fontWeight={700} mb={0.75}>
          Biblioteca de Explicabilidade FRPS
        </Typography>
        {!isCompactViewport ? (
          <Typography
            variant="body2"
            color="text.secondary"
            maxWidth={860}
          >
            Consulte itens globais e locais, acompanhe o status conceitual e
            registre equivalências alias → canônico sem sair desta tela,
            reutilizando o módulo de Equivalências de Catálogo.
          </Typography>
        ) : null}
      </Box>

      {!isCompactViewport ? (
        <FrpsExplainabilityLibrarySummaryCards
          summary={data?.summary}
          scopeLabel={data?.scopeLabel}
        />
      ) : null}

      <Box ref={stickyToolbarRef} sx={FRPS_LIBRARY_STICKY_TOOLBAR_SX}>
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

        {selectionError ? (
          <Alert
            severity="warning"
            onClose={() => setSelectionError(null)}
            sx={{ mb: 1.5 }}
          >
            {selectionError}
          </Alert>
        ) : null}

        {selectedLocals.length > 0 ? (
          <Alert
            severity="info"
            sx={{ mb: 0 }}
            action={
              <Box display="flex" gap={1}>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setSelectedLocals([])}
                >
                  Limpar
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  onClick={openEquivalenceDialogFromSelection}
                >
                  {buildFrpsLinkToCanonicalButtonLabel(selectedLocals.length)}
                </Button>
              </Box>
            }
          >
            {selectedLocals.length} item(ns) selecionado(s) para vinculação ao
            canônico global (LOCAL ou GLOBAL).
          </Alert>
        ) : null}
      </Box>

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
            gap={1}
            flexWrap="wrap"
            mb={1}
          >
            <Typography variant="body2" color="text.secondary">
              {data?.pagination.total ?? 0} item(ns)
              {isFetching ? ' · atualizando…' : ''}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleToggleSelectVisible}
              disabled={!visibleSelectableRows.length && !allVisibleSelected}
            >
              {buildFrpsSelectVisibleButtonLabel(allVisibleSelected)}
            </Button>
          </Box>

          <FrpsExplainabilityLibraryTable
            rows={renderedRows}
            expandedCanonicalIds={expandedCanonicalIds}
            onToggleCanonicalGroup={handleToggleCanonicalGroup}
            generatingRowId={generatingRowId}
            selectedLocalIds={selectedLocalIds}
            onToggleLocal={handleToggleLocal}
            onGenerate={handleGenerate}
            onView={handleView}
            onOpenCanonicalPicker={openEquivalenceDialogFromRow}
          />

          <STablePagination
            total={data?.pagination.total ?? 0}
            limit={pageLimit}
            page={data?.pagination.page ?? filters.page}
            setPage={(page) => pushFilters({ ...filters, page })}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
            mt={2.5}
          />
        </>
      )}

      <FrpsLibraryConceptualViewDrawer
        open={Boolean(viewTarget)}
        target={viewTarget}
        onClose={() => setViewTarget(null)}
        onValidated={() => {
          void handleConceptualValidated();
        }}
      />

      <FrpsCatalogEquivalenceDialog
        open={equivalenceDialog.open}
        aliases={equivalenceDialog.aliases}
        preferManualPicker={equivalenceDialog.preferManualPicker}
        onClose={closeEquivalenceDialog}
        onCompleted={handleEquivalenceCompleted}
        onCreateGlobalCompleted={handleCreateGlobalCompleted}
      />
    </Box>
  );
};
