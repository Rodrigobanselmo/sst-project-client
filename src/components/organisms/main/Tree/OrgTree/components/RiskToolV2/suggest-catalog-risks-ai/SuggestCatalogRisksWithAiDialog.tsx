import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { transcribeAiAnalyzeCharacterizationAudio } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/transcribe-ai-analyze-characterization-audio.service';
import { useMutateAiAnalyzeGse } from '@v2/services/security/homogeneous-group/ai-analyze-gse/hooks/useMutateAiAnalyzeGse';
import { transcribeAiAnalyzeGseAudio } from '@v2/services/security/homogeneous-group/ai-analyze-gse/service/transcribe-ai-analyze-gse-audio.service';
import { QueryEnum } from 'core/enums/query.enums';
import { useMutUpsertManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertManyRiskData';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { queryRisk } from 'core/services/hooks/queries/useQueryRiskAll';

import { appendTranscribedGuidance } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/append-transcribed-guidance.util';
import { AiAnalyzeGuidanceAudioField } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiAnalyzeGuidanceAudioField';

import { buildCatalogOnlyRiskLinkPayload } from './build-catalog-only-risk-link-payload.util';
import { CatalogOnlyAiIdentificationHistoryPanel } from './CatalogOnlyAiIdentificationHistoryPanel';
import { CatalogOnlyCharacterizationPhotosField } from './CatalogOnlyCharacterizationPhotosField';
import {
  formatCatalogOnlyAiExperimentDiagnosticsLines,
  resolveCatalogOnlyAiExperimentDiagnostics,
  type CatalogOnlyAiExperimentDiagnostics,
} from './catalog-only-ai-experiment-diagnostics.util';
import {
  resolveCatalogOnlySessionModelForRequest,
  type CatalogOnlyAiModelSessionValue,
} from './catalog-only-ai-model-options.constants';
import {
  resolveCatalogOnlyConsiderationLabel,
  resolveCatalogOnlyOriginLabel,
  shouldWarnCatalogOnlyConsideration,
} from './catalog-only-suggestion-display.util';
import type { CatalogOnlyTemporaryImage } from './compress-catalog-only-temp-image.util';
import { filterCatalogOnlyAiSuggestions } from './filter-catalog-only-ai-suggestions.util';
import { resolveCatalogOnlyAiSuggestionFeedback } from './resolve-catalog-only-ai-suggestion-feedback.util';
import { filterCatalogOnlyHistoryIdsForLink } from './resolve-catalog-only-history-item-link-state.util';
import type { SuggestCatalogRisksContext } from './resolve-suggest-catalog-risks-context.util';

const CATALOG_LOAD_ERROR =
  'Não foi possível carregar o catálogo de fatores de risco. Tente novamente.';

type Props = {
  open: boolean;
  onClose: () => void;
  context: SuggestCatalogRisksContext | null;
  isSystemMaster?: boolean;
  /** Sessão temporária da engrenagem; vazio = padrão do sistema (não envia model). */
  sessionModel?: CatalogOnlyAiModelSessionValue;
};

export function SuggestCatalogRisksWithAiDialog({
  open,
  onClose,
  context,
  isSystemMaster = false,
  sessionModel = '',
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [userGuidance, setUserGuidance] = useState('');
  const [guidanceAudioBusy, setGuidanceAudioBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<DetailedRisk[]>([]);
  const [recognizedAlreadyLinked, setRecognizedAlreadyLinked] = useState<
    DetailedRisk[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [selectedExistingPhotoIds, setSelectedExistingPhotoIds] = useState<
    Set<string>
  >(new Set());
  const [temporaryImages, setTemporaryImages] = useState<
    CatalogOnlyTemporaryImage[]
  >([]);
  const [photosHydratedForEntity, setPhotosHydratedForEntity] = useState<
    string | null
  >(null);
  const [experimentDiagnostics, setExperimentDiagnostics] =
    useState<CatalogOnlyAiExperimentDiagnostics | null>(null);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);

  const gseAnalyze = useMutateAiAnalyzeGse();
  const characterizationAnalyze = useMutateAiAnalyzeCharacterization();
  const upsertMany = useMutUpsertManyRiskData();

  const isCharacterization = context?.kind === 'characterization';
  const catalogCompanyId = context?.companyId;

  const characterizationQuery = useQueryCharacterization(
    isCharacterization ? context?.entityId || '' : '',
    {
      companyId: context?.companyId,
      workspaceId: context?.workspaceId,
    },
  );

  const existingPhotos = useMemo(
    () =>
      isCharacterization
        ? (characterizationQuery.data?.photos || []).filter(
            (photo) => photo?.id && photo?.photoUrl && !photo.deleted_at,
          )
        : [],
    [isCharacterization, characterizationQuery.data?.photos],
  );

  // Mesma fonte/chave do fluxo "Adicionar riscos" (queryRisk + QueryEnum.RISK),
  // mas com a empresa do contexto selecionado — nunca trata cache ausente como [].
  const catalogQuery = useQuery(
    [QueryEnum.RISK, catalogCompanyId],
    () => queryRisk(catalogCompanyId as string),
    {
      enabled: open && Boolean(catalogCompanyId),
      staleTime: 1000 * 60 * 60,
    },
  );

  const { data: existingRiskData = [], refetch: refetchExisting } =
    useQueryRiskDataByGho(
      context?.riskGroupId || '',
      context?.entityId || '',
    );

  const existingRiskIds = useMemo(
    () =>
      new Set(
        (existingRiskData || [])
          .map((item) => item.riskId)
          .filter((id): id is string => Boolean(id)),
      ),
    [existingRiskData],
  );

  const catalogIds = useMemo(
    () => new Set((catalogQuery.data || []).map((risk) => risk.id)),
    [catalogQuery.data],
  );
  const catalogReady =
    !catalogQuery.isError && catalogQuery.data !== undefined;

  const analyzing =
    gseAnalyze.isPending || characterizationAnalyze.isPending;
  const linking = upsertMany.isLoading;
  const catalogBusy =
    catalogQuery.isLoading || catalogQuery.isFetching;

  useEffect(() => {
    if (!open) {
      setUserGuidance('');
      setSuggestions([]);
      setRecognizedAlreadyLinked([]);
      setSelectedIds(new Set());
      setHasAnalyzed(false);
      setGuidanceAudioBusy(false);
      setTemporaryImages([]);
      setSelectedExistingPhotoIds(new Set());
      setPhotosHydratedForEntity(null);
      setExperimentDiagnostics(null);
      setHistoryRefreshToken(0);
    }
  }, [open]);

  // Hidrata seleção padrão: todas as fotos cadastradas, ao abrir o elemento.
  useEffect(() => {
    if (!open || !isCharacterization || !context?.entityId) return;
    if (photosHydratedForEntity === context.entityId) return;
    if (characterizationQuery.isLoading) return;
    setSelectedExistingPhotoIds(new Set(existingPhotos.map((photo) => photo.id)));
    setPhotosHydratedForEntity(context.entityId);
  }, [
    open,
    isCharacterization,
    context?.entityId,
    existingPhotos,
    characterizationQuery.isLoading,
    photosHydratedForEntity,
  ]);

  const titleContext =
    context?.kind === 'gse' ? 'GSE' : 'Elemento caracterizável';

  const ensureCatalogLoaded = async (): Promise<
    { ok: true; catalogIds: Set<string> } | { ok: false }
  > => {
    if (catalogQuery.isError) {
      enqueueSnackbar(CATALOG_LOAD_ERROR, { variant: 'error' });
      return { ok: false };
    }

    let catalog = catalogQuery.data;

    if (catalog === undefined) {
      const refreshed = await catalogQuery.refetch();
      if (refreshed.isError || refreshed.error) {
        enqueueSnackbar(CATALOG_LOAD_ERROR, { variant: 'error' });
        return { ok: false };
      }
      catalog = refreshed.data;
    }

    if (catalog === undefined) {
      enqueueSnackbar(CATALOG_LOAD_ERROR, { variant: 'error' });
      return { ok: false };
    }

    return {
      ok: true,
      catalogIds: new Set(catalog.map((risk) => risk.id)),
    };
  };

  const handleAnalyze = async () => {
    if (!context) return;

    const catalogResult = await ensureCatalogLoaded();
    if (!catalogResult.ok) return;

    try {
      const modelOverride =
        isSystemMaster
          ? resolveCatalogOnlySessionModelForRequest(sessionModel)
          : undefined;

      const body = {
        companyId: context.companyId,
        workspaceId: context.workspaceId,
        userGuidance: userGuidance.trim() || undefined,
        suggestionMode: 'catalog-only' as const,
        scope: 'general' as const,
        ...(modelOverride ? { model: modelOverride } : {}),
      };

      const result =
        context.kind === 'gse'
          ? await gseAnalyze.mutateAsync({
              ...body,
              gseId: context.entityId,
            })
          : await characterizationAnalyze.mutateAsync({
              ...body,
              characterizationId: context.entityId,
              photoSelection: {
                existingPhotoIds: [...selectedExistingPhotoIds],
                temporaryImages: temporaryImages.map((image) => ({
                  fileName: image.fileName,
                  mimeType: image.mimeType,
                  dataUrl: image.dataUrl,
                })),
              },
            });

      const incoming =
        result.newRiskSuggestions || result.detailedRisks || [];

      const filtered = filterCatalogOnlyAiSuggestions({
        incoming,
        incomingAlreadyLinked: result.identifiedAlreadyLinkedRisks || [],
        catalogIds: catalogResult.catalogIds,
        existingDirectRiskIds: existingRiskIds,
      });

      setSuggestions(filtered.accepted);
      setRecognizedAlreadyLinked(filtered.recognizedAlreadyLinked);
      // Seleção consciente: nenhuma sugestão pré-marcada; confirmação só com escolha explícita.
      setSelectedIds(new Set());
      setHasAnalyzed(true);
      setHistoryRefreshToken((current) => current + 1);

      const meta = (result.metadata || {}) as Record<string, unknown>;
      setExperimentDiagnostics(
        isSystemMaster
          ? resolveCatalogOnlyAiExperimentDiagnostics(meta)
          : null,
      );
      const feedback = resolveCatalogOnlyAiSuggestionFeedback(filtered, {
        selectedImageCount:
          typeof meta.selectedImageCount === 'number'
            ? meta.selectedImageCount
            : undefined,
        imagesSentToModelCount:
          typeof meta.imagesSentToModelCount === 'number'
            ? meta.imagesSentToModelCount
            : undefined,
        imageFallbackApplied: Boolean(meta.imageFallbackApplied),
        imageFallbackTextOnly: Boolean(meta.imageFallbackTextOnly),
        selectedImagesNotProcessedCount:
          typeof meta.selectedImagesNotProcessedCount === 'number'
            ? meta.selectedImagesNotProcessedCount
            : undefined,
      });
      if (feedback) {
        enqueueSnackbar(feedback.message, { variant: feedback.variant });
      }
    } catch {
      // snackbar já tratado pelos hooks de mutation quando aplicável
    }
  };

  const toggleExistingPhoto = (photoId: string) => {
    setSelectedExistingPhotoIds((current) => {
      const next = new Set(current);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const toggleId = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(
      checked
        ? new Set(suggestions.map((risk) => risk.id))
        : new Set(),
    );
  };

  const linkSelectedRiskIds = async (
    selectedRiskIds: string[],
    options?: { closeOnSuccess?: boolean },
  ) => {
    if (!context) return;

    const catalogResult = await ensureCatalogLoaded();
    if (!catalogResult.ok) return;

    const filtered = filterCatalogOnlyHistoryIdsForLink({
      selectedRiskIds,
      catalogIds: catalogResult.catalogIds,
      existingDirectRiskIds: existingRiskIds,
    });

    if (filtered.blockedUnavailable > 0) {
      enqueueSnackbar(
        `${filtered.blockedUnavailable} fator(es) indisponível(is) ou inativo(s) no catálogo — inclusão bloqueada.`,
        { variant: 'warning' },
      );
    }
    if (filtered.blockedAlreadyLinked > 0) {
      enqueueSnackbar(
        `${filtered.blockedAlreadyLinked} fator(es) já vinculado(s) foram ignorados.`,
        { variant: 'info' },
      );
    }

    const payload = buildCatalogOnlyRiskLinkPayload({
      riskGroupId: context.riskGroupId,
      entityId: context.entityId,
      selectedRiskIds: filtered.linkableIds,
      workspaceId: context.workspaceId,
    });

    if (!payload) {
      enqueueSnackbar('Selecione ao menos um fator de risco do catálogo.', {
        variant: 'warning',
      });
      return;
    }

    try {
      await upsertMany.mutateAsync(payload);
      await refetchExisting();
      enqueueSnackbar(
        `${payload.riskIds.length} fator(es) vinculado(s) com sucesso.`,
        { variant: 'success' },
      );
      if (options?.closeOnSuccess) {
        onClose();
      }
    } catch {
      // snackbar do mutation
    }
  };

  const handleConfirm = async () => {
    await linkSelectedRiskIds([...selectedIds], { closeOnSuccess: true });
  };

  const handleAddFromHistory = async (riskIds: string[]) => {
    await linkSelectedRiskIds(riskIds, { closeOnSuccess: false });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: '100%',
          // ~2× o antigo `sm` (~600px) no desktop, com teto seguro na viewport.
          maxWidth: { xs: '100%', sm: 720, md: 960, lg: 1100 },
          m: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoFixHighOutlinedIcon color="primary" fontSize="small" />
        Sugerir riscos com IA — {titleContext}
      </DialogTitle>
      <DialogContent dividers>
        {!context ? (
          <Typography variant="body2" color="text.secondary">
            Selecione um GSE ou Elemento caracterizável para continuar.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              A IA sugere apenas fatores ativos do catálogo SimpleSST. Você
              escolhe quais vincular. Nenhuma avaliação ou controle é
              preenchido automaticamente. O histórico é referência técnica —
              não confirma risco nem inclui fatores automaticamente.
            </Typography>

            <CatalogOnlyAiIdentificationHistoryPanel
              open={open}
              companyId={context.companyId}
              workspaceId={context.workspaceId}
              entityKind={
                context.kind === 'gse' ? 'GSE' : 'CHARACTERIZATION'
              }
              entityId={context.entityId}
              catalogIds={catalogIds}
              existingDirectRiskIds={existingRiskIds}
              catalogReady={catalogReady}
              linking={linking}
              refreshToken={historyRefreshToken}
              onAddSelected={handleAddFromHistory}
            />

            {catalogQuery.isError && (
              <Typography variant="body2" color="error">
                {CATALOG_LOAD_ERROR}
              </Typography>
            )}

            {isCharacterization && (
              <CatalogOnlyCharacterizationPhotosField
                existingPhotos={existingPhotos}
                selectedExistingIds={selectedExistingPhotoIds}
                onToggleExisting={toggleExistingPhoto}
                temporaryImages={temporaryImages}
                onTemporaryChange={setTemporaryImages}
                disabled={analyzing || linking}
              />
            )}

            <AiAnalyzeGuidanceAudioField
              companyId={context.companyId}
              workspaceId={context.workspaceId}
              characterizationId={
                context.kind === 'characterization'
                  ? context.entityId
                  : undefined
              }
              transcribe={
                context.kind === 'gse'
                  ? ({ audio, fileName }) =>
                      transcribeAiAnalyzeGseAudio({
                        companyId: context.companyId,
                        workspaceId: context.workspaceId,
                        gseId: context.entityId,
                        audio,
                        fileName,
                      })
                  : undefined
              }
              value={userGuidance}
              onChange={setUserGuidance}
              disabled={analyzing || linking}
              onBusyChange={setGuidanceAudioBusy}
              onTranscription={(text) =>
                setUserGuidance((current) =>
                  appendTranscribedGuidance(current, text),
                )
              }
            />

            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={
                  analyzing || (catalogBusy && catalogQuery.data === undefined) ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AutoFixHighOutlinedIcon />
                  )
                }
                onClick={() => void handleAnalyze()}
                disabled={
                  !context ||
                  analyzing ||
                  linking ||
                  guidanceAudioBusy ||
                  catalogQuery.isError
                }
              >
                Solicitar sugestões
              </Button>
            </Box>

            {hasAnalyzed && isSystemMaster && experimentDiagnostics && (
              <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  Diagnóstico técnico (master)
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                  {formatCatalogOnlyAiExperimentDiagnosticsLines(
                    experimentDiagnostics,
                  ).map((line) => (
                    <Typography
                      key={line}
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            )}

            {hasAnalyzed && (
              <Stack spacing={2.5}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    Fatores identificados que já estão vinculados (
                    {recognizedAlreadyLinked.length})
                  </Typography>
                  {!recognizedAlreadyLinked.length ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum fator já vinculado foi reconhecido como pertinente
                      nesta análise. Isso não implica que os riscos cadastrados
                      estejam incorretos.
                    </Typography>
                  ) : (
                    recognizedAlreadyLinked.map((risk) => (
                      <Box
                        key={`linked-${risk.id}`}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 1.5,
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ display: 'block', mb: 0.25, fontWeight: 600 }}
                        >
                          Já vinculado
                        </Typography>
                        <Typography variant="subtitle2">
                          {risk.name}
                          {risk.type ? ` · ${risk.type}` : ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {risk.explanation || 'Sem justificativa.'}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    Novas oportunidades de inclusão ({suggestions.length})
                  </Typography>

                  {suggestions.length > 0 && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            suggestions.length > 0 &&
                            selectedIds.size === suggestions.length
                          }
                          indeterminate={
                            selectedIds.size > 0 &&
                            selectedIds.size < suggestions.length
                          }
                          onChange={(_, checked) => toggleAll(checked)}
                          disabled={linking}
                        />
                      }
                      label={`Selecionar todos os novos (${suggestions.length})`}
                    />
                  )}

                  {suggestions.map((risk) => {
                    const considerationLabel =
                      resolveCatalogOnlyConsiderationLabel(
                        risk.technicalConsideration,
                      );
                    const warnConsideration =
                      shouldWarnCatalogOnlyConsideration(risk);

                    return (
                      <Box
                        key={risk.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 1.5,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedIds.has(risk.id)}
                              onChange={() => toggleId(risk.id)}
                              disabled={linking}
                            />
                          }
                          label={
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.25 }}
                              >
                                {resolveCatalogOnlyOriginLabel(
                                  risk.suggestionOrigin,
                                )}
                              </Typography>
                              <Typography variant="subtitle2">
                                {risk.name}
                                {risk.type ? ` · ${risk.type}` : ''}
                              </Typography>
                              {considerationLabel && (
                                <Typography
                                  variant="body2"
                                  color={
                                    warnConsideration
                                      ? 'warning.main'
                                      : 'text.secondary'
                                  }
                                  sx={{ mt: 0.25 }}
                                >
                                  {considerationLabel}
                                  {warnConsideration
                                    ? ' — você pode vincular mesmo assim, se julgar adequado.'
                                    : ''}
                                </Typography>
                              )}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {risk.explanation || 'Sem justificativa.'}
                              </Typography>
                            </Box>
                          }
                          sx={{ alignItems: 'flex-start', m: 0 }}
                        />
                      </Box>
                    );
                  })}

                  {!suggestions.length && (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum novo fator de risco pertinente foi identificado
                      nesta análise.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={linking}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleConfirm()}
          disabled={
            !context || !selectedIds.size || analyzing || linking || !hasAnalyzed
          }
        >
          {linking ? 'Vinculando…' : 'Confirmar inclusão'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
