import { FC, useEffect, useMemo, useState } from 'react';

import {
  Autocomplete,
  AutocompleteInputChangeReason,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { SInput } from '@v2/components/forms/fields/SInput/SInput';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { useFetchBrowseRiskCatalogEquivalences } from '@v2/services/risk-catalog-equivalence/hooks/useFetchBrowseRiskCatalogEquivalences';
import { useFetchBulkPreviewRiskCatalogEquivalenceImpact } from '@v2/services/risk-catalog-equivalence/hooks/useFetchBulkPreviewRiskCatalogEquivalenceImpact';
import { useFetchSearchRiskCatalogItems } from '@v2/services/risk-catalog-equivalence/hooks/useFetchSearchRiskCatalogItems';
import { useMutateRevokeRiskCatalogEquivalence } from '@v2/services/risk-catalog-equivalence/hooks/useMutateRevokeRiskCatalogEquivalence';
import { riskCatalogEquivalenceQueryKeys } from '@v2/services/risk-catalog-equivalence/hooks/risk-catalog-equivalence.query-keys';
import { createRiskCatalogEquivalence } from '@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence.service';
import {
  RiskCatalogEquivalence,
  RiskCatalogEquivalenceType,
  RiskCatalogImpactPreview,
  RiskCatalogKind,
  RiskCatalogSearchItem,
} from '@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence.types';
import { formatRiskCatalogEquivalenceError } from '@v2/services/risk-catalog-equivalence/utils/risk-catalog-equivalence-error.util';
import {
  canAddAsAlias,
  getCatalogScopeBlockReason,
  RISK_CATALOG_SYSTEM_CANONICAL_INFO,
} from '@v2/services/risk-catalog-equivalence/utils/risk-catalog-equivalence-scope.util';
import { sortRiskCatalogSearchResults } from '@v2/services/risk-catalog-equivalence/utils/risk-catalog-equivalence-search-sort.util';
import { useFetch } from '@v2/hooks/api/useFetch';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { queryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { useQueryRisks } from 'core/services/hooks/queries/useQueryRisks/useQueryRisks';
import { RoleEnum } from 'project/enum/roles.enums';

const KIND_OPTIONS = [
  { value: RiskCatalogKind.GENERATE_SOURCE, label: 'Fonte Geradora' },
  { value: RiskCatalogKind.REC_MED, label: 'Recomendação' },
] as const;

const EQUIVALENCE_TYPE_OPTIONS = [
  {
    value: RiskCatalogEquivalenceType.TECHNICAL_DUPLICATE,
    label: 'Duplicata técnica',
  },
  {
    value: RiskCatalogEquivalenceType.SEMANTIC_ALIAS,
    label: 'Alias semântico',
  },
] as const;

const fullTextSx = {
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};

const impactMetricsListSx = {
  m: 0,
  p: 0,
  pl: 2.5,
  listStylePosition: 'inside' as const,
  overflow: 'hidden',
  '& li': {
    py: 0.75,
    pr: 1,
    wordBreak: 'break-word' as const,
  },
};

const impactMetricsBoxSx = {
  mt: 1,
  p: 2,
  borderRadius: 1,
  bgcolor: 'action.hover',
  overflow: 'hidden',
};

type BatchCreateResult = {
  alias: RiskCatalogSearchItem;
  success: boolean;
  error?: string;
};

function formatEquivalenceType(type: RiskCatalogEquivalenceType) {
  return (
    EQUIVALENCE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
  );
}

function formatKind(kind: RiskCatalogKind) {
  return KIND_OPTIONS.find((o) => o.value === kind)?.label ?? kind;
}

type CompanyOption = { id: string; name: string };
type RiskOption = { id: string; name: string };

const ItemCard: FC<{
  title: string;
  item: RiskCatalogSearchItem | null;
  emptyText: string;
  highlight?: 'canonical' | 'alias';
}> = ({ title, item, emptyText, highlight }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      height: '100%',
      borderColor:
        highlight === 'canonical'
          ? 'success.main'
          : highlight === 'alias'
            ? 'warning.main'
            : 'divider',
      borderWidth: highlight ? 2 : 1,
    }}
  >
    <Typography variant="subtitle2" gutterBottom>
      {title}
    </Typography>
    {!item ? (
      <Typography color="text.secondary">{emptyText}</Typography>
    ) : (
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="body2" sx={fullTextSx}>
          {item.label || '(sem texto)'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Risco: {item.riskName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Empresa: {item.companyName}
          {item.system ? ' · Sistema' : ''}
        </Typography>
        {item.isAliasActive && (
          <Alert severity="info" sx={{ py: 0 }}>
            Já é alias ativo → {item.canonicalLabel}
          </Alert>
        )}
        <Tooltip title={item.id}>
          <Typography variant="caption" color="text.disabled">
            ID: {item.id}
          </Typography>
        </Tooltip>
      </Box>
    )}
  </Paper>
);

function renderSingleImpactPreview(preview: RiskCatalogImpactPreview) {
  if (preview.kind === RiskCatalogKind.GENERATE_SOURCE) {
    const g = preview.generateSource;
    return (
      <Box sx={impactMetricsBoxSx}>
        <Box component="ul" sx={impactMetricsListSx}>
          <li>RiskFactorData com alias: {g.riskFactorDataWithAlias}</li>
          <li>RiskFactorData com canônico: {g.riskFactorDataWithCanonical}</li>
          <li>Duplicatas se migrasse: {g.riskFactorDataDuplicateIfMigrated}</li>
          <li>Vínculos M2M com alias: {g.m2mLinksWithAlias}</li>
        </Box>
      </Box>
    );
  }

  const r = preview.recMed;
  return (
    <Box sx={impactMetricsBoxSx}>
      <Box component="ul" sx={impactMetricsListSx}>
        <li>RecMedOnRiskData com alias: {r.recMedOnRiskDataWithAlias}</li>
        <li>Engs com alias: {r.engsToRiskFactorDataWithAlias}</li>
        <li>ADMs (RiskFactorData) com alias: {r.admsM2mLinksWithAlias}</li>
        <li>Plano de ação (RiskFactorDataRec): {r.riskFactorDataRecWithAlias}</li>
        <li>Medidas derivadas: {r.riskFactorDataRecDerivedMeasureWithAlias}</li>
        <li>
          Fotos de caracterização: {r.characterizationPhotoRecommendationsWithAlias}
        </li>
        <li>
          RiskFactorData com canônico (qualquer vínculo):{' '}
          {r.riskFactorDataWithCanonicalAnyLink}
        </li>
        <li>Duplicatas se migrasse: {r.riskFactorDataDuplicateIfMigrated}</li>
      </Box>
    </Box>
  );
}

export const RiskCatalogEquivalencesPage: FC = () => {
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  const [kind, setKind] = useState<RiskCatalogKind>(
    RiskCatalogKind.GENERATE_SOURCE,
  );
  const [company, setCompany] = useState<CompanyOption | null>(null);
  const [companyInputValue, setCompanyInputValue] = useState('');
  const [risk, setRisk] = useState<RiskOption | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [includeSystem, setIncludeSystem] = useState(true);
  const [equivalenceType, setEquivalenceType] =
    useState<RiskCatalogEquivalenceType>(
      RiskCatalogEquivalenceType.SEMANTIC_ALIAS,
    );
  const [canonicalItem, setCanonicalItem] =
    useState<RiskCatalogSearchItem | null>(null);
  const [selectedAliases, setSelectedAliases] = useState<
    RiskCatalogSearchItem[]
  >([]);
  const [includeRevoked, setIncludeRevoked] = useState(false);
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] =
    useState<RiskCatalogEquivalence | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [companySearchInput, setCompanySearchInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [batchCreateResults, setBatchCreateResults] = useState<
    BatchCreateResult[] | null
  >(null);

  useEffect(() => {
    if (!company) setRisk(null);
  }, [company]);

  const { data: companiesPage, isLoading: loadingCompanies } = useFetch({
    queryKey: [
      'risk-catalog-equivalence',
      'master-companies',
      companySearchInput.trim(),
    ],
    queryFn: () =>
      queryCompanies(
        { skip: 0, take: 1000 },
        {
          findAll: true,
          search: companySearchInput.trim() || undefined,
        },
        '',
      ),
    refetchOnMount: true,
  });

  const companies = companiesPage?.data ?? [];

  const companyOptions: CompanyOption[] = useMemo(
    () =>
      [...(companies ?? [])]
        .map((c) => ({
          id: c.id,
          name: (c.fantasy || c.name || '').trim(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [companies],
  );

  const { data: risksData = [], isLoading: loadingRisks } = useQueryRisks(
    1,
    { companyId: company?.id, search: null },
    500,
  );

  const riskOptions: RiskOption[] = useMemo(
    () =>
      (risksData ?? []).map((r) => ({
        id: r.id,
        name: r.name,
      })),
    [risksData],
  );

  const searchParams = useMemo(() => {
    if (!hasSearched) return null;

    const params: {
      kind: RiskCatalogKind;
      companyId?: string;
      riskId?: string;
      search?: string;
      includeSystem: boolean;
    } = {
      kind,
      includeSystem,
    };

    if (company?.id) {
      params.companyId = company.id;
      if (risk?.id) params.riskId = risk.id;
    }
    if (appliedSearch.trim()) params.search = appliedSearch.trim();

    return params;
  }, [hasSearched, kind, company?.id, risk?.id, appliedSearch, includeSystem]);

  const effectiveRiskId = useMemo(() => {
    if (!canonicalItem) return risk?.id ?? null;
    const allSameRisk = selectedAliases.every(
      (a) => a.riskId === canonicalItem.riskId,
    );
    if (selectedAliases.length && !allSameRisk) return null;
    return canonicalItem.riskId;
  }, [canonicalItem, selectedAliases, risk?.id]);

  const validSelectedAliases = useMemo(() => {
    if (!canonicalItem) return [];
    return selectedAliases.filter(
      (alias) => getCatalogScopeBlockReason(canonicalItem, alias) === null,
    );
  }, [canonicalItem, selectedAliases]);

  const browseParams = useMemo(
    () => ({
      kind,
      ...(company?.id && risk?.id ? { riskId: risk.id } : {}),
      includeRevoked,
    }),
    [kind, company?.id, risk?.id, includeRevoked],
  );

  const {
    data: searchResults = [],
    isLoading: loadingSearch,
    isError: searchError,
    error: searchErrorDetail,
  } = useFetchSearchRiskCatalogItems(searchParams);

  const sortedSearchResults = useMemo(
    () => sortRiskCatalogSearchResults(searchResults, company?.id),
    [searchResults, company?.id],
  );

  const systemCanonicalIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of sortedSearchResults) {
      if (item.system) ids.add(item.id);
    }
    if (canonicalItem?.system) ids.add(canonicalItem.id);
    return ids;
  }, [sortedSearchResults, canonicalItem]);

  const { data: equivalences = [], isLoading: loadingEquivalences } =
    useFetchBrowseRiskCatalogEquivalences(browseParams);

  const {
    previews: aliasPreviews,
    isLoading: loadingPreview,
    allLoaded: allPreviewsLoaded,
  } = useFetchBulkPreviewRiskCatalogEquivalenceImpact(
    canonicalItem,
    validSelectedAliases,
    kind,
  );

  const revokeMutation = useMutateRevokeRiskCatalogEquivalence(browseParams);

  const selectionInvalid =
    !canonicalItem ||
    validSelectedAliases.length === 0 ||
    !effectiveRiskId ||
    Boolean(canonicalItem?.isAliasActive) ||
    validSelectedAliases.length !== selectedAliases.length;

  const canConfirm =
    !selectionInvalid && allPreviewsLoaded && !loadingPreview && !isCreating;

  const invalidateCatalogQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['risk-catalog-equivalence', 'search'],
      }),
      queryClient.invalidateQueries({
        queryKey: riskCatalogEquivalenceQueryKeys.browse(browseParams),
      }),
      queryClient.invalidateQueries({
        queryKey: ['risk-catalog-equivalence', 'impact-preview'],
      }),
    ]);
  };

  const resetSelection = () => {
    setCanonicalItem(null);
    setSelectedAliases([]);
    setSelectionMessage(null);
    setBatchCreateResults(null);
  };

  const handleApplySearch = () => {
    setAppliedSearch(searchInput.trim());
    setHasSearched(true);
    resetSelection();
  };

  const handleClearCompany = () => {
    setCompany(null);
    setCompanyInputValue('');
    setCompanySearchInput('');
    setRisk(null);
    resetSelection();
  };

  const handleCompanyInputChange = (
    _: React.SyntheticEvent,
    newInputValue: string,
    reason: AutocompleteInputChangeReason,
  ) => {
    if (reason === 'reset') {
      if (!company) setCompanyInputValue('');
      return;
    }

    setCompanyInputValue(newInputValue);
    setCompanySearchInput(newInputValue);

    if (reason === 'clear' || newInputValue === '') {
      setCompany(null);
      setRisk(null);
    }
  };

  const handleCompanyChange = (
    _: React.SyntheticEvent,
    value: CompanyOption | null,
  ) => {
    setCompany(value);
    setCompanyInputValue(value?.name ?? '');
    setCompanySearchInput(value?.name ?? '');
    setRisk(null);
    resetSelection();
  };

  const handleSelectCanonical = (item: RiskCatalogSearchItem) => {
    if (item.isAliasActive) return;

    const incompatibleAlias = selectedAliases.find(
      (alias) => getCatalogScopeBlockReason(item, alias) !== null,
    );
    if (incompatibleAlias) {
      setSelectionMessage(
        getCatalogScopeBlockReason(item, incompatibleAlias),
      );
      return;
    }

    setSelectionMessage(null);
    setCanonicalItem(item);
    setBatchCreateResults(null);
  };

  const handleAddAlias = (item: RiskCatalogSearchItem) => {
    if (!canonicalItem) {
      setSelectionMessage('Selecione primeiro um item canônico.');
      return;
    }

    const blockReason = getCatalogScopeBlockReason(canonicalItem, item);
    if (blockReason) {
      setSelectionMessage(blockReason);
      return;
    }

    if (selectedAliases.some((alias) => alias.id === item.id)) return;

    setSelectionMessage(null);
    setSelectedAliases((prev) => [...prev, item]);
    setBatchCreateResults(null);
  };

  const handleRemoveAlias = (itemId: string) => {
    setSelectedAliases((prev) => prev.filter((alias) => alias.id !== itemId));
    setSelectionMessage(null);
    setBatchCreateResults(null);
  };

  const handleOpenConfirm = () => {
    setBatchCreateResults(null);
    setConfirmCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!canonicalItem || !effectiveRiskId || validSelectedAliases.length === 0) {
      return;
    }

    setIsCreating(true);
    setBatchCreateResults(null);

    const results: BatchCreateResult[] = [];

    for (const alias of validSelectedAliases) {
      try {
        await createRiskCatalogEquivalence({
          kind,
          equivalenceType,
          riskId: effectiveRiskId,
          canonicalId: canonicalItem.id,
          aliasId: alias.id,
          metadata: { source: 'master-ui-catalog-consolidation' },
        });
        results.push({ alias, success: true });
      } catch (error) {
        results.push({
          alias,
          success: false,
          error: formatRiskCatalogEquivalenceError(error),
        });
      }
    }

    setBatchCreateResults(results);
    setIsCreating(false);

    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (succeeded.length) {
      await invalidateCatalogQueries();
      setSelectedAliases((prev) =>
        prev.filter(
          (alias) => !succeeded.some((result) => result.alias.id === alias.id),
        ),
      );
      showSnackBar(
        succeeded.length === 1
          ? 'Equivalência registrada com sucesso'
          : `${succeeded.length} equivalências registradas com sucesso`,
        { type: 'success' },
      );
    }

    if (!failed.length) {
      setConfirmCreateOpen(false);
      setSelectionMessage(null);
    } else if (!succeeded.length) {
      setSelectionMessage(
        failed.length === 1
          ? failed[0].error ?? 'Não foi possível registrar a equivalência.'
          : 'Nenhuma equivalência foi registrada. Veja os detalhes abaixo.',
      );
    } else {
      setSelectionMessage(
        `${succeeded.length} registrada(s), ${failed.length} com erro. Veja os detalhes.`,
      );
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget || !revokeReason.trim()) return;
    try {
      await revokeMutation.mutateAsync({
        id: revokeTarget.id,
        revokeReason: revokeReason.trim(),
      });
      setRevokeTarget(null);
      setRevokeReason('');
    } catch {
      // Erro exibido via snackbar do hook de mutação.
    }
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Equivalências de Catálogo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consolidação de itens duplicados ou semanticamente equivalentes no
            catálogo de fontes geradoras e recomendações.
          </Typography>
        </Box>

        <Alert severity="warning">
          Equivalência semântica exige validação humana. Documentos já emitidos
          (PGR, etc.) não são alterados. Nesta fase, vínculos antigos não são
          migrados — a equivalência orienta novos vínculos e o dedupe futuro da
          IA.
        </Alert>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Tipo de catálogo"
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value as RiskCatalogKind);
                  resetSelection();
                  setHasSearched(false);
                }}
              >
                {KIND_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Autocomplete
                  options={companyOptions}
                  value={company}
                  inputValue={companyInputValue}
                  loading={loadingCompanies}
                  getOptionLabel={(o) => o.name}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  onInputChange={handleCompanyInputChange}
                  onChange={handleCompanyChange}
                  noOptionsText="Sem opções"
                  renderInput={(params) => (
                    <SInput
                      textFieldProps={params}
                      label="Empresa (opcional para Master)"
                      placeholder="Vazio = busca global"
                      fullWidth
                    />
                  )}
                />
                <Button
                  size="small"
                  variant="text"
                  onClick={handleClearCompany}
                  disabled={!company && !companyInputValue}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Limpar empresa
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <SAutocompleteSelect
                label="Risco (opcional para busca)"
                options={company ? riskOptions : []}
                loading={loadingRisks}
                value={risk}
                getOptionLabel={(o) => o.name}
                onChange={(_, value) => {
                  setRisk(value);
                  resetSelection();
                }}
                placeholder={
                  company
                    ? 'Filtrar por risco (opcional)'
                    : 'Selecione empresa para filtrar riscos'
                }
                inputProps={{ disabled: !company }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Busca por texto"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
                placeholder="Busca global ou restrita à empresa selecionada"
              />
            </Grid>
            <Grid item xs={12} md={4} display="flex" alignItems="center" gap={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSystem}
                    onChange={(e) => setIncludeSystem(e.target.checked)}
                  />
                }
                label="Incluir itens de sistema"
              />
              <Button variant="contained" onClick={handleApplySearch}>
                Buscar
              </Button>
            </Grid>
          </Grid>
          {company ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Busca restrita à empresa selecionada.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Busca global em todas as empresas visíveis ao Master.
            </Alert>
          )}
          {hasSearched && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              Parâmetros da última busca: tipo{' '}
              {KIND_OPTIONS.find((o) => o.value === kind)?.label ?? kind}
              {' · '}
              empresa {company?.name ?? 'todas'}
              {' · '}
              risco {company && risk ? risk.name : 'qualquer'}
              {appliedSearch.trim() ? ` · texto “${appliedSearch.trim()}”` : ''}
              {includeSystem ? ' · inclui sistema' : ' · sem itens de sistema'}
            </Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Resultados da busca
            {loadingSearch
              ? ' (carregando…)'
              : ` (${sortedSearchResults.length})`}
          </Typography>
          {searchError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Falha na busca:{' '}
              {formatRiskCatalogEquivalenceError(searchErrorDetail) ||
                'erro desconhecido'}
            </Alert>
          )}
          {!hasSearched && (
            <Typography color="text.secondary">
              Clique em Buscar para listar itens do catálogo.
            </Typography>
          )}
          {!canonicalItem &&
            sortedSearchResults.some((item) => item.system) &&
            hasSearched && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Itens de sistema aparecem primeiro e são o canônico preferencial
                para consolidação global.
              </Alert>
            )}
          <Box display="flex" flexDirection="column" gap={2}>
            {sortedSearchResults.map((item) => {
              const isCanonical = canonicalItem?.id === item.id;
              const isSelectedAlias = selectedAliases.some(
                (alias) => alias.id === item.id,
              );
              const scopeBlockReason = canonicalItem
                ? getCatalogScopeBlockReason(canonicalItem, item)
                : null;
              const canAdd =
                canonicalItem &&
                !isCanonical &&
                !item.isAliasActive &&
                canAddAsAlias(canonicalItem, item);
              const favorSystemCanonical = !canonicalItem && item.system;

              return (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderColor: isCanonical
                      ? 'success.main'
                      : isSelectedAlias
                        ? 'warning.main'
                        : item.system
                          ? 'primary.main'
                          : 'divider',
                    borderWidth: item.system || isCanonical || isSelectedAlias ? 2 : 1,
                    bgcolor: item.system ? 'primary.50' : 'background.paper',
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    flexWrap="wrap"
                  >
                    <Box flex={1} minWidth={280}>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mb={0.5}>
                        {item.system && (
                          <Chip
                            size="small"
                            color="primary"
                            label="Sistema / Canônico preferencial"
                          />
                        )}
                      </Box>
                      <Typography variant="body1" sx={fullTextSx}>
                        {item.label || '(sem texto)'}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {item.riskName} · {item.companyName}
                        {item.system ? ' · Sistema' : ''}
                      </Typography>
                      {item.isAliasActive && (
                        <Chip
                          size="small"
                          color="info"
                          label={`Alias ativo → ${item.canonicalLabel}`}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {scopeBlockReason && !item.isAliasActive && !isCanonical && (
                        <Chip
                          size="small"
                          color="warning"
                          variant="outlined"
                          label="Escopo incompatível com o canônico"
                          sx={{ mt: 1 }}
                        />
                      )}
                      <Tooltip title={item.id}>
                        <Typography variant="caption" color="text.disabled">
                          ID: {item.id}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Box display="flex" gap={1} alignItems="flex-start" flexWrap="wrap">
                      <Button
                        size="small"
                        variant={
                          isCanonical || favorSystemCanonical
                            ? 'contained'
                            : 'outlined'
                        }
                        color="success"
                        disabled={item.isAliasActive}
                        onClick={() => handleSelectCanonical(item)}
                      >
                        Canônico
                      </Button>
                      {isSelectedAlias ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          onClick={() => handleRemoveAlias(item.id)}
                        >
                          Remover alias
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          disabled={
                            !canonicalItem ||
                            isCanonical ||
                            item.isAliasActive ||
                            !canAdd
                          }
                          onClick={() => handleAddAlias(item)}
                        >
                          Adicionar alias
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Par selecionado
          </Typography>
          {selectionMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {selectionMessage}
            </Alert>
          )}
          {canonicalItem?.system && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {RISK_CATALOG_SYSTEM_CANONICAL_INFO}
            </Alert>
          )}
          {canonicalItem && selectedAliases.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Canônico selecionado. Use &quot;Adicionar alias&quot; nos
              resultados para montar um lote.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ItemCard
                title="Canônico"
                item={canonicalItem}
                emptyText="Selecione um item como canônico"
                highlight="canonical"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Aliases selecionados ({selectedAliases.length})
                </Typography>
                {selectedAliases.length === 0 ? (
                  <Typography color="text.secondary">
                    Nenhum alias selecionado.
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {selectedAliases.map((alias) => {
                      const blockReason = canonicalItem
                        ? getCatalogScopeBlockReason(canonicalItem, alias)
                        : null;
                      return (
                        <ListItem
                          key={alias.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="Remover alias"
                              onClick={() => handleRemoveAlias(alias.id)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          }
                          sx={{ alignItems: 'flex-start', px: 0 }}
                        >
                          <ListItemText
                            primary={alias.label}
                            secondary={
                              <>
                                {alias.companyName}
                                {alias.system ? ' · Sistema' : ''}
                                {blockReason && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="error"
                                    display="block"
                                  >
                                    {blockReason}
                                  </Typography>
                                )}
                              </>
                            }
                            primaryTypographyProps={{ sx: fullTextSx }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Box mt={2}>
            <FormControl>
              <Typography variant="subtitle2" gutterBottom>
                Tipo de equivalência
              </Typography>
              <RadioGroup
                row
                value={equivalenceType}
                onChange={(e) =>
                  setEquivalenceType(
                    e.target.value as RiskCatalogEquivalenceType,
                  )
                }
              >
                {EQUIVALENCE_TYPE_OPTIONS.map((o) => (
                  <FormControlLabel
                    key={o.value}
                    value={o.value}
                    control={<Radio />}
                    label={o.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Preview de impacto
          </Typography>
          {selectionInvalid && !selectionMessage && (
            <Typography color="text.secondary">
              Selecione canônico e ao menos um alias compatível (mesmo risco e
              escopo) para carregar o preview.
            </Typography>
          )}
          {loadingPreview && <Typography>Calculando impacto…</Typography>}
          {aliasPreviews.map((preview) => (
            <Paper
              key={preview.alias.id}
              variant="outlined"
              sx={{
                p: 2,
                mt: 2,
                overflow: 'hidden',
                borderColor: 'warning.light',
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={fullTextSx}>
                Alias: {preview.alias.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                {preview.alias.companyName}
                {preview.alias.system ? ' · Sistema' : ''}
              </Typography>
              {preview.isLoading && (
                <Typography variant="body2">Calculando…</Typography>
              )}
              {preview.isError && (
                <Alert severity="error">
                  {formatRiskCatalogEquivalenceError(preview.error)}
                </Alert>
              )}
              {preview.data && renderSingleImpactPreview(preview.data)}
            </Paper>
          ))}
          {allPreviewsLoaded && validSelectedAliases.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Nesta fase, nenhum vínculo antigo será migrado. A equivalência
              passa a orientar novos vínculos e dedupe futuro.
            </Alert>
          )}

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              disabled={!canConfirm}
              onClick={handleOpenConfirm}
            >
              Confirmar equivalência
              {validSelectedAliases.length > 1
                ? ` (${validSelectedAliases.length})`
                : ''}
            </Button>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            mb={2}
          >
            <Typography variant="subtitle1">
              Equivalências registradas
              {loadingEquivalences ? ' (carregando…)' : ''}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeRevoked}
                  onChange={(e) => setIncludeRevoked(e.target.checked)}
                />
              }
              label="Incluir revogadas"
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            {equivalences.map((eq) => {
              const isSystemCanonical = systemCanonicalIds.has(eq.canonicalId);

              return (
              <Paper key={eq.id} variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
                  <Box flex={1} minWidth={280}>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                      <Chip size="small" label={formatKind(eq.kind)} />
                      <Chip
                        size="small"
                        label={formatEquivalenceType(eq.equivalenceType)}
                      />
                      {isSystemCanonical && (
                        <Chip size="small" color="primary" label="Sistema" />
                      )}
                      {eq.revokedAt && (
                        <Chip size="small" color="default" label="Revogada" />
                      )}
                    </Box>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderColor: 'success.light',
                        bgcolor: 'success.50',
                      }}
                    >
                      <Typography variant="caption" color="success.dark" fontWeight={600}>
                        Canônico
                      </Typography>
                      <Typography variant="body2" sx={fullTextSx}>
                        {eq.canonicalLabel}
                      </Typography>
                    </Paper>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderColor: 'warning.light',
                        bgcolor: 'warning.50',
                      }}
                    >
                      <Typography variant="caption" color="warning.dark" fontWeight={600}>
                        Alias
                      </Typography>
                      <Typography variant="body2" sx={fullTextSx}>
                        {eq.aliasLabel}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Confirmada em:{' '}
                      {eq.confirmedAt
                        ? new Date(eq.confirmedAt).toLocaleString('pt-BR')
                        : '—'}
                    </Typography>
                    {eq.revokedAt && (
                      <Typography variant="caption" display="block">
                        Revogada em:{' '}
                        {new Date(eq.revokedAt).toLocaleString('pt-BR')}
                        {eq.revokeReason ? ` — ${eq.revokeReason}` : ''}
                      </Typography>
                    )}
                  </Box>
                  {!eq.revokedAt && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                      onClick={() => {
                        setRevokeTarget(eq);
                        setRevokeReason('');
                      }}
                    >
                      Revogar
                    </Button>
                  )}
                </Box>
              </Paper>
            );
            })}
            {!loadingEquivalences && equivalences.length === 0 && (
              <Typography color="text.secondary">
                Nenhuma equivalência encontrada para os filtros atuais.
              </Typography>
            )}
          </Box>
        </Paper>

        <Dialog
          open={confirmCreateOpen}
          onClose={() => !isCreating && setConfirmCreateOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Confirmar equivalência
            {validSelectedAliases.length > 1
              ? ` (${validSelectedAliases.length} aliases)`
              : ''}
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Registrar {validSelectedAliases.length}{' '}
              {validSelectedAliases.length === 1 ? 'alias' : 'aliases'} apontando
              para o canônico?
            </Typography>
            <Typography variant="body2" sx={{ ...fullTextSx, mt: 1 }}>
              <strong>Canônico:</strong> {canonicalItem?.label}
            </Typography>
            <List dense>
              {validSelectedAliases.map((alias) => (
                <ListItem key={alias.id} disableGutters>
                  <ListItemText
                    primary={alias.label}
                    secondary={`${alias.companyName}${alias.system ? ' · Sistema' : ''}`}
                    primaryTypographyProps={{ sx: fullTextSx }}
                  />
                </ListItem>
              ))}
            </List>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Vínculos existentes não serão migrados nesta fase.
            </Alert>
            {batchCreateResults && (
              <Box mt={2} display="flex" flexDirection="column" gap={1}>
                {batchCreateResults.map((result) => (
                  <Alert
                    key={result.alias.id}
                    severity={result.success ? 'success' : 'error'}
                  >
                    <Typography variant="body2" sx={fullTextSx}>
                      {result.alias.label}
                    </Typography>
                    {result.success
                      ? 'Registrado com sucesso.'
                      : result.error ?? 'Erro ao registrar.'}
                  </Alert>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmCreateOpen(false)}
              disabled={isCreating}
            >
              {batchCreateResults ? 'Fechar' : 'Cancelar'}
            </Button>
            {!batchCreateResults && (
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? 'Registrando…' : 'Confirmar'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={Boolean(revokeTarget)}
          onClose={() => setRevokeTarget(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Revogar equivalência</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Revogar equivalência entre &quot;{revokeTarget?.aliasLabel}&quot; e
              &quot;{revokeTarget?.canonicalLabel}&quot;?
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Motivo da revogação"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRevokeTarget(null)}>Cancelar</Button>
            <Button
              color="error"
              variant="contained"
              disabled={!revokeReason.trim() || revokeMutation.isPending}
              onClick={handleRevoke}
            >
              Revogar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SAuthShow>
  );
};
