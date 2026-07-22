import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  useFetchFrpsCatalogConceptualStatus,
  type FrpsCatalogAdminItem,
} from '@v2/services/forms/frps-explainability-library';
import { useFetchSearchRiskCatalogItems } from '@v2/services/risk-catalog-equivalence/hooks/useFetchSearchRiskCatalogItems';
import { useFetchBulkPreviewRiskCatalogEquivalenceImpact } from '@v2/services/risk-catalog-equivalence/hooks/useFetchBulkPreviewRiskCatalogEquivalenceImpact';
import { useMutateCreateGlobalCanonicalFromLocal } from '@v2/services/risk-catalog-equivalence/hooks/useMutateCreateGlobalCanonicalFromLocal';
import { createRiskCatalogEquivalence } from '@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence.service';
import {
  RiskCatalogEquivalenceType,
  RiskCatalogKind,
} from '@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence.types';
import { formatRiskCatalogEquivalenceError } from '@v2/services/risk-catalog-equivalence/utils/risk-catalog-equivalence-error.util';
import { canAddAsAlias } from '@v2/services/risk-catalog-equivalence/utils/risk-catalog-equivalence-scope.util';

import {
  FRPS_ADM_ENG_INCOMPATIBLE_MESSAGE,
  FRPS_GLOBAL_COMPANY_DISPLAY_NAME,
  FRPS_GLOBAL_ORIGIN_DISPLAY_NAME,
  describeConceptualComparison,
  filterStructurallyCompatibleGlobalCanonicals,
  getFrpsEquivalenceConceptualConflictReason,
  mapFrpsCatalogAdminItemToSearchItem,
  normalizeFrpsCatalogSearchTerm,
  resolveFrpsExactAutoSuggestedCanonical,
} from '../frps-catalog-admin-equivalence.util';
import {
  buildCreateGlobalCanonicalPayload,
  buildCreateGlobalPreview,
  canShowCreateGlobalCanonicalAction,
  FRPS_CREATE_GLOBAL_ACTION_LABEL,
  FRPS_CREATE_GLOBAL_BODY,
  FRPS_CREATE_GLOBAL_CONFIRM_LABEL,
  FRPS_CREATE_GLOBAL_NO_EXPLANATION_WARNING,
  FRPS_CREATE_GLOBAL_TITLE,
  getCreateGlobalValidatedBlockReason,
  getEligibleLocalItemsForCreateGlobal,
  resolveCreateGlobalBaseAlias,
} from '../frps-create-global-canonical.util';
import {
  getFrpsLibraryItemTypeLabel,
  getFrpsLibraryStatusLabel,
} from '../frps-explainability-library-filters.util';
import {
  FRPS_EQUIVALENCE_DIALOG_TITLE,
  buildFrpsEquivalenceDialogConfirmLabel,
} from '../frps-explainability-library-ux.constants';
import { buildFrpsEquivalenceDialogInit } from '../frps-catalog-equivalence-dialog.util';

type CreateGlobalStep = 'base' | 'preview';

type BatchCreateResult = {
  alias: FrpsCatalogAdminItem;
  success: boolean;
  error?: string;
};

type PickerMode = 'auto' | 'manual';

type Props = {
  open: boolean;
  aliases: FrpsCatalogAdminItem[];
  onClose: () => void;
  onCompleted: (failedAliases: FrpsCatalogAdminItem[]) => void;
  onCreateGlobalCompleted?: (linkedAliasIds: string[]) => void;
  /**
   * Abre direto no seletor manual (ex.: "Pesquisar canônico" /
   * "Escolher outro canônico" na linha). Não cria vínculo automático.
   */
  preferManualPicker?: boolean;
};

export function FrpsCatalogEquivalenceDialog({
  open,
  aliases,
  onClose,
  onCompleted,
  onCreateGlobalCompleted,
  preferManualPicker = false,
}: Props) {
  const [canonicalId, setCanonicalId] = useState<string>('');
  const [searchDraft, setSearchDraft] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode>('auto');
  const [autoResolved, setAutoResolved] = useState(false);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [searchSessionReady, setSearchSessionReady] = useState(false);
  const [equivalenceType, setEquivalenceType] =
    useState<RiskCatalogEquivalenceType>(
      RiskCatalogEquivalenceType.SEMANTIC_ALIAS,
    );
  const [isCreating, setIsCreating] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchCreateResult[] | null>(
    null,
  );
  const [createGlobalStep, setCreateGlobalStep] =
    useState<CreateGlobalStep | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [createGlobalError, setCreateGlobalError] = useState<string | null>(
    null,
  );

  const createGlobalMutation = useMutateCreateGlobalCanonicalFromLocal();

  const firstAlias = aliases[0] ?? null;
  const kind =
    firstAlias?.kind === 'GENERATE_SOURCE'
      ? RiskCatalogKind.GENERATE_SOURCE
      : RiskCatalogKind.REC_MED;

  useEffect(() => {
    if (!open || !firstAlias) {
      setSearchSessionReady(false);
      return;
    }

    const init = buildFrpsEquivalenceDialogInit({
      aliasLabel: firstAlias.label,
      preferManualPicker,
      normalizeSearch: normalizeFrpsCatalogSearchTerm,
    });
    setCanonicalId(init.canonicalId);
    setBatchResults(null);
    setPickerMode(init.pickerMode);
    setAutoResolved(init.autoResolved);
    setSuggestionAccepted(init.suggestionAccepted);
    setEquivalenceType(RiskCatalogEquivalenceType.SEMANTIC_ALIAS);
    setSearchDraft(init.searchDraft);
    setCreateGlobalStep(null);
    setSelectedBaseId(null);
    setCreateGlobalError(null);
    setSearchSessionReady(true);
  }, [open, firstAlias?.id, firstAlias?.label, preferManualPicker]);

  const searchParams =
    open && firstAlias && searchSessionReady
      ? {
          kind,
          riskId: firstAlias.riskId,
          search: searchDraft.trim() || undefined,
          includeSystem: true,
        }
      : null;

  const { data: searchItems = [], isFetching: isSearching } =
    useFetchSearchRiskCatalogItems(searchParams);

  const compatibleCanonicals = useMemo(
    () =>
      filterStructurallyCompatibleGlobalCanonicals({
        aliases,
        searchItems,
      }),
    [aliases, searchItems],
  );

  const exactAutoSuggested = useMemo(
    () =>
      resolveFrpsExactAutoSuggestedCanonical({
        aliases,
        searchItems,
      }),
    [aliases, searchItems],
  );

  useEffect(() => {
    if (
      !open ||
      !searchSessionReady ||
      pickerMode !== 'auto' ||
      autoResolved ||
      isSearching
    ) {
      return;
    }

    // Card automático só com igualdade normalizada exata (não basta 1 resultado contains).
    if (exactAutoSuggested) {
      setCanonicalId(exactAutoSuggested.id);
      setAutoResolved(true);
      return;
    }

    setCanonicalId('');
    setPickerMode('manual');
    setAutoResolved(true);
  }, [
    open,
    searchSessionReady,
    pickerMode,
    autoResolved,
    isSearching,
    exactAutoSuggested,
  ]);

  const canonicalSearch =
    compatibleCanonicals.find((item) => item.id === canonicalId) ?? null;

  const showSuggestionCard =
    pickerMode === 'auto' &&
    autoResolved &&
    Boolean(canonicalSearch) &&
    !suggestionAccepted;

  const showManualPicker = pickerMode === 'manual';
  const showConfirmSection =
    Boolean(canonicalSearch) && (suggestionAccepted || showManualPicker);

  const conceptualStatusParams =
    open && canonicalSearch && firstAlias
      ? {
          itemType: firstAlias.itemType,
          catalogId: canonicalSearch.id,
        }
      : null;

  const {
    data: canonicalConceptual,
    isLoading: isLoadingCanonicalConceptual,
    isFetching: isFetchingCanonicalConceptual,
  } = useFetchFrpsCatalogConceptualStatus(conceptualStatusParams);

  const canonicalSnapshot = canonicalConceptual
    ? {
        status: canonicalConceptual.status,
        explanationId: canonicalConceptual.explanationId,
        itemKey: canonicalConceptual.itemKey,
      }
    : null;

  const comparison = describeConceptualComparison({
    aliases,
    canonical: canonicalSnapshot,
  });

  const aliasSearchItems = useMemo(
    () => aliases.map(mapFrpsCatalogAdminItemToSearchItem),
    [aliases],
  );

  const admEngConflict =
    firstAlias?.kind === 'REC_MED' &&
    canonicalSearch &&
    !compatibleCanonicals.some((item) => item.id === canonicalSearch.id)
      ? FRPS_ADM_ENG_INCOMPATIBLE_MESSAGE
      : null;

  const hardConceptualConflict = getFrpsEquivalenceConceptualConflictReason({
    aliases,
    canonical: canonicalSnapshot,
  });

  const canConfirm =
    Boolean(canonicalSearch) &&
    aliases.length > 0 &&
    !admEngConflict &&
    !isLoadingCanonicalConceptual &&
    Boolean(canonicalSnapshot) &&
    !hardConceptualConflict &&
    aliasSearchItems.every((alias) => canAddAsAlias(canonicalSearch!, alias));

  const { allLoaded: allPreviewsLoaded, isLoading: previewsLoading } =
    useFetchBulkPreviewRiskCatalogEquivalenceImpact(
      canConfirm && showConfirmSection ? canonicalSearch : null,
      aliasSearchItems,
      kind,
    );

  const handleCreate = async () => {
    if (!canonicalSearch || !canConfirm) return;

    setIsCreating(true);
    setBatchResults(null);

    const results: BatchCreateResult[] = [];

    for (const alias of aliases) {
      try {
        await createRiskCatalogEquivalence({
          kind,
          equivalenceType,
          riskId: canonicalSearch.riskId,
          canonicalId: canonicalSearch.id,
          aliasId: alias.id,
          metadata: { source: 'frps-library-catalog-admin' },
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

    setBatchResults(results);
    setIsCreating(false);

    const failed = results
      .filter((result) => !result.success)
      .map((result) => result.alias);
    const succeeded = results.filter((result) => result.success);

    if (succeeded.length) {
      onCompleted(failed);
    }
  };

  const eligibleLocals = useMemo(
    () => getEligibleLocalItemsForCreateGlobal(aliases),
    [aliases],
  );

  const createGlobalBase = resolveCreateGlobalBaseAlias({
    aliases,
    selectedBaseId,
  });

  const createGlobalPreview = createGlobalBase
    ? buildCreateGlobalPreview({ base: createGlobalBase, aliases })
    : null;

  const showCreateGlobalAction = canShowCreateGlobalCanonicalAction({
    aliases,
    hasSelectedCanonical: Boolean(canonicalSearch),
    manualPickerVisible: showManualPicker,
    createFlowOpen: Boolean(createGlobalStep),
  });

  const busy =
    isCreating || createGlobalMutation.isPending;

  const handleClose = () => {
    if (busy) return;
    setCanonicalId('');
    setSearchDraft('');
    setPickerMode('auto');
    setAutoResolved(false);
    setSuggestionAccepted(false);
    setSearchSessionReady(false);
    setBatchResults(null);
    setCreateGlobalStep(null);
    setSelectedBaseId(null);
    setCreateGlobalError(null);
    onClose();
  };

  const handleUseSuggestedCanonical = () => {
    setSuggestionAccepted(true);
    setBatchResults(null);
  };

  const handleChooseAnotherCanonical = () => {
    setSuggestionAccepted(false);
    setPickerMode('manual');
    setCanonicalId('');
    setBatchResults(null);
  };

  const handleStartCreateGlobal = () => {
    const validatedBlock = getCreateGlobalValidatedBlockReason(aliases);
    if (validatedBlock) {
      setCreateGlobalError(validatedBlock);
      return;
    }
    setCreateGlobalError(null);
    setCanonicalId('');
    if (eligibleLocals.length === 1) {
      setSelectedBaseId(eligibleLocals[0]!.id);
      setCreateGlobalStep('preview');
      return;
    }
    setSelectedBaseId(null);
    setCreateGlobalStep('base');
  };

  const handleConfirmCreateGlobal = async () => {
    if (!createGlobalBase || busy) return;
    const validatedBlock = getCreateGlobalValidatedBlockReason(aliases);
    if (validatedBlock) {
      setCreateGlobalError(validatedBlock);
      return;
    }

    setCreateGlobalError(null);
    try {
      const payload = buildCreateGlobalCanonicalPayload({
        base: createGlobalBase,
        aliases,
        equivalenceType,
      });
      await createGlobalMutation.mutateAsync({
        kind:
          payload.kind === 'GENERATE_SOURCE'
            ? RiskCatalogKind.GENERATE_SOURCE
            : RiskCatalogKind.REC_MED,
        riskId: payload.riskId,
        baseAliasId: payload.baseAliasId,
        aliasIds: payload.aliasIds,
        equivalenceType,
      });
      onCreateGlobalCompleted?.(payload.aliasIds);
      setCreateGlobalStep(null);
      setSelectedBaseId(null);
    } catch (error) {
      setCreateGlobalError(formatRiskCatalogEquivalenceError(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {createGlobalStep ? FRPS_CREATE_GLOBAL_TITLE : FRPS_EQUIVALENCE_DIALOG_TITLE}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Os itens locais selecionados permanecerão no catálogo da empresa. A
          operação registra alias → canônico pelo módulo existente de
          Equivalências, sem migrar inventário ou documentos.
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Aliases locais ({aliases.length})
        </Typography>
        <Box display="flex" flexDirection="column" gap={1} mb={2.5}>
          {aliases.map((alias) => (
            <Box
              key={alias.id}
              border={1}
              borderColor="divider"
              borderRadius={1}
              p={1.25}
            >
              <Typography variant="body2" fontWeight={600}>
                {alias.label}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {getFrpsLibraryItemTypeLabel(alias.itemType)} · {alias.riskName}{' '}
                · {alias.companyName} · Explicação:{' '}
                {getFrpsLibraryStatusLabel(alias.conceptualExplanation.status)}
              </Typography>
            </Box>
          ))}
        </Box>

        {pickerMode === 'auto' && !autoResolved ? (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Buscando candidato global compatível…
            </Typography>
          </Box>
        ) : null}

        {showSuggestionCard && canonicalSearch && firstAlias ? (
          <Box
            border={1}
            borderColor="primary.light"
            borderRadius={1}
            p={1.5}
            mb={2}
            bgcolor="action.hover"
          >
            <Typography variant="subtitle2" gutterBottom>
              Candidato global encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Sugestão para revisão. Nenhuma equivalência foi criada ainda.
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {canonicalSearch.label}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.5}
            >
              Tipo: {getFrpsLibraryItemTypeLabel(firstAlias.itemType)} · Risco:{' '}
              {canonicalSearch.riskName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.25}
            >
              Origem: {FRPS_GLOBAL_ORIGIN_DISPLAY_NAME} · Empresa:{' '}
              {FRPS_GLOBAL_COMPANY_DISPLAY_NAME}
            </Typography>
            {isLoadingCanonicalConceptual || isFetchingCanonicalConceptual ? (
              <Box display="flex" alignItems="center" gap={1} mt={0.75}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">
                  Carregando status da explicação…
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
              >
                Explicação:{' '}
                {getFrpsLibraryStatusLabel(
                  canonicalSnapshot?.status ?? 'NEVER_GENERATED',
                )}
              </Typography>
            )}
            <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
              <Button
                size="small"
                variant="contained"
                onClick={handleUseSuggestedCanonical}
              >
                Usar este canônico
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleChooseAnotherCanonical}
              >
                Escolher outro
              </Button>
            </Box>
          </Box>
        ) : null}

        {showManualPicker ? (
          <>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Pesquise e escolha explicitamente o canônico global. Nenhum vínculo
              é criado até a confirmação
              {aliases.length > 1
                ? ` — ${aliases.length} aliases serão vinculados ao mesmo canônico.`
                : '.'}
            </Typography>
            <TextField
              size="small"
              fullWidth
              label="Buscar canônico global"
              value={searchDraft}
              onChange={(event) => {
                setSearchDraft(event.target.value);
                setCanonicalId('');
                setBatchResults(null);
              }}
              sx={{ mb: 1.5 }}
              helperText={
                isSearching
                  ? 'Buscando no catálogo…'
                  : 'Busca server-side no módulo de Equivalências. Edite ou limpe o texto para ampliar os resultados.'
              }
              InputProps={{
                endAdornment: searchDraft ? (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => {
                        setSearchDraft('');
                        setCanonicalId('');
                        setBatchResults(null);
                      }}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      Limpar
                    </Button>
                  </InputAdornment>
                ) : undefined,
              }}
            />

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Canônico global</InputLabel>
              <Select
                label="Canônico global"
                value={canonicalId}
                onChange={(event) => {
                  setCanonicalId(event.target.value);
                  setBatchResults(null);
                }}
              >
                {compatibleCanonicals.length === 0 ? (
                  <MenuItem value="" disabled>
                    Nenhum canônico compatível encontrado
                  </MenuItem>
                ) : (
                  compatibleCanonicals.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.label} · {item.riskName} ·{' '}
                      {FRPS_GLOBAL_ORIGIN_DISPLAY_NAME}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {showCreateGlobalAction ? (
              <Box mb={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleStartCreateGlobal}
                  disabled={busy}
                >
                  {FRPS_CREATE_GLOBAL_ACTION_LABEL}
                </Button>
                {compatibleCanonicals.length === 0 ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.75}
                  >
                    Nenhum canônico adequado encontrado. Você pode criar um novo
                    item no catálogo oficial SimpleSST a partir de um LOCAL.
                  </Typography>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.75}
                  >
                    Nenhum destes candidatos serve? Crie um novo canônico global
                    a partir de um item LOCAL selecionado.
                  </Typography>
                )}
              </Box>
            ) : null}
          </>
        ) : null}

        {createGlobalStep === 'base' ? (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Selecione qual item LOCAL será o modelo do novo canônico global.
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Item-base (LOCAL)</InputLabel>
              <Select
                label="Item-base (LOCAL)"
                value={selectedBaseId ?? ''}
                onChange={(event) => {
                  setSelectedBaseId(event.target.value || null);
                  setCreateGlobalError(null);
                }}
              >
                {eligibleLocals.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label} · {item.companyName || 'Empresa'} ·{' '}
                    {getFrpsLibraryItemTypeLabel(item.itemType)} ·{' '}
                    {getFrpsLibraryStatusLabel(
                      item.conceptualExplanation.status,
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : null}

        {createGlobalStep === 'preview' && createGlobalPreview ? (
          <Box mb={2}>
            <Typography variant="body2" mb={1.5}>
              {FRPS_CREATE_GLOBAL_BODY}
            </Typography>
            <Box
              border={1}
              borderColor="divider"
              borderRadius={1}
              p={1.5}
              mb={1.5}
            >
              <Typography variant="subtitle2" gutterBottom>
                Prévia
              </Typography>
              <Typography variant="body2">
                Texto: {createGlobalPreview.baseLabel}
              </Typography>
              <Typography variant="body2">
                Tipo: {getFrpsLibraryItemTypeLabel(createGlobalBase!.itemType)}
              </Typography>
              <Typography variant="body2">
                Fator de risco: {createGlobalPreview.riskName}
              </Typography>
              <Typography variant="body2">
                Origem atual: {createGlobalPreview.originLabel}
              </Typography>
              <Typography variant="body2">
                Itens que serão vinculados: {createGlobalPreview.linkCount}
              </Typography>
            </Box>
            <Alert severity="info" sx={{ mb: 1.5 }}>
              {FRPS_CREATE_GLOBAL_NO_EXPLANATION_WARNING}
            </Alert>
          </Box>
        ) : null}

        {createGlobalError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createGlobalError}
          </Alert>
        ) : null}

        {showConfirmSection && !createGlobalStep ? (
          <>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Tipo de equivalência</InputLabel>
              <Select
                label="Tipo de equivalência"
                value={equivalenceType}
                onChange={(event) =>
                  setEquivalenceType(
                    event.target.value as RiskCatalogEquivalenceType,
                  )
                }
              >
                <MenuItem value={RiskCatalogEquivalenceType.SEMANTIC_ALIAS}>
                  Alias semântico
                </MenuItem>
                <MenuItem
                  value={RiskCatalogEquivalenceType.TECHNICAL_DUPLICATE}
                >
                  Duplicata técnica
                </MenuItem>
              </Select>
            </FormControl>

            {canonicalSearch ? (
              <Box
                border={1}
                borderColor="divider"
                borderRadius={1}
                p={1.5}
                mb={2}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Comparação
                </Typography>
                <Typography variant="body2">
                  Canônico: {canonicalSearch.label} (
                  {FRPS_GLOBAL_ORIGIN_DISPLAY_NAME}) ·{' '}
                  {FRPS_GLOBAL_COMPANY_DISPLAY_NAME} · {canonicalSearch.riskName}
                </Typography>
                {isLoadingCanonicalConceptual ||
                isFetchingCanonicalConceptual ? (
                  <Box display="flex" alignItems="center" gap={1} mt={0.75}>
                    <CircularProgress size={14} />
                    <Typography variant="caption" color="text.secondary">
                      Carregando status conceitual do canônico…
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.5}
                  >
                    Explicação do canônico:{' '}
                    {getFrpsLibraryStatusLabel(
                      canonicalSnapshot?.status ?? 'NEVER_GENERATED',
                    )}
                    {canonicalSnapshot?.itemKey
                      ? ` · identidade conceitual carregada`
                      : ''}
                  </Typography>
                )}
              </Box>
            ) : null}

            {admEngConflict ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {admEngConflict}
              </Alert>
            ) : null}

            {hardConceptualConflict ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {hardConceptualConflict}
              </Alert>
            ) : null}

            {canonicalSearch &&
            canonicalSnapshot &&
            !isLoadingCanonicalConceptual &&
            !hardConceptualConflict &&
            comparison.conflict ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Alias e canônico possuem explicações conceituais distintas
                (aliases:{' '}
                {comparison.aliasSummaries
                  .map(
                    (item) =>
                      `${item.label} = ${getFrpsLibraryStatusLabel(item.status)}`,
                  )
                  .join('; ')}
                ; canônico ={' '}
                {getFrpsLibraryStatusLabel(canonicalSnapshot.status)}
                ). Nenhum conteúdo será apagado ou migrado nesta etapa. Fluxos
                que consultam equivalência poderão passar a resolver o canônico.
              </Alert>
            ) : null}

            {canonicalSearch &&
            canonicalSnapshot &&
            !isLoadingCanonicalConceptual &&
            !comparison.conflict ? (
              <Alert severity="success" sx={{ mb: 2 }} variant="outlined">
                {canonicalSnapshot.status === 'NEVER_GENERATED'
                  ? 'Canônico sem explicação conceitual. Nenhum conflito a reportar.'
                  : aliases.every(
                        (alias) =>
                          alias.conceptualExplanation.status ===
                          'NEVER_GENERATED',
                      )
                    ? 'Aliases sem explicação conceitual; canônico possui explicação. Nenhum conflito de conteúdo entre aliases e canônico.'
                    : 'Status conceituais carregados para comparação.'}
              </Alert>
            ) : null}

            {canConfirm ? (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={1}
              >
                {previewsLoading
                  ? 'Carregando prévia de impacto…'
                  : allPreviewsLoaded
                    ? 'Prévia de impacto carregada (sem migração nesta etapa).'
                    : 'Prévia de impacto indisponível ou parcial.'}
              </Typography>
            ) : null}
          </>
        ) : null}

        {!createGlobalStep &&
        !canConfirm &&
        aliases.length > 0 &&
        showManualPicker &&
        !canonicalSearch ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Escolha um item global compatível (mesmo tipo e risco) como
            canônico.
          </Alert>
        ) : null}

        {batchResults ? (
          <Box display="flex" flexDirection="column" gap={1} mt={1}>
            {batchResults.map((result) => (
              <Alert
                key={result.alias.id}
                severity={result.success ? 'success' : 'error'}
              >
                {result.alias.label}:{' '}
                {result.success
                  ? 'equivalência criada'
                  : result.error || 'falha'}
              </Alert>
            ))}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={busy}>
          Fechar
        </Button>
        {createGlobalStep === 'base' ? (
          <Button
            variant="contained"
            disabled={busy || !selectedBaseId}
            onClick={() => {
              if (!selectedBaseId) return;
              setCreateGlobalStep('preview');
            }}
          >
            Continuar
          </Button>
        ) : null}
        {createGlobalStep === 'preview' ? (
          <Button
            variant="contained"
            disabled={busy || !createGlobalBase}
            onClick={handleConfirmCreateGlobal}
          >
            {busy ? 'Criando…' : FRPS_CREATE_GLOBAL_CONFIRM_LABEL}
          </Button>
        ) : null}
        {!createGlobalStep ? (
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={busy || !canConfirm || !showConfirmSection}
          >
            {isCreating
              ? 'Vinculando…'
              : buildFrpsEquivalenceDialogConfirmLabel(aliases.length)}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
