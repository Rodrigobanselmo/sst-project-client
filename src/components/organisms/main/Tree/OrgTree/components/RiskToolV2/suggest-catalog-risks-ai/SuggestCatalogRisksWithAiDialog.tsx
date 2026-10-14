import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import {
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
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { queryRisk } from 'core/services/hooks/queries/useQueryRiskAll';

import { appendTranscribedGuidance } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/append-transcribed-guidance.util';
import { AiAnalyzeGuidanceAudioField } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiAnalyzeGuidanceAudioField';

import { buildCatalogOnlyRiskLinkPayload } from './build-catalog-only-risk-link-payload.util';
import {
  resolveCatalogOnlyConsiderationLabel,
  resolveCatalogOnlyOriginLabel,
  shouldWarnCatalogOnlyConsideration,
} from './catalog-only-suggestion-display.util';
import { filterCatalogOnlyAiSuggestions } from './filter-catalog-only-ai-suggestions.util';
import { resolveCatalogOnlyAiSuggestionFeedback } from './resolve-catalog-only-ai-suggestion-feedback.util';
import type { SuggestCatalogRisksContext } from './resolve-suggest-catalog-risks-context.util';

const CATALOG_LOAD_ERROR =
  'Não foi possível carregar o catálogo de fatores de risco. Tente novamente.';

type Props = {
  open: boolean;
  onClose: () => void;
  context: SuggestCatalogRisksContext | null;
};

export function SuggestCatalogRisksWithAiDialog({
  open,
  onClose,
  context,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [userGuidance, setUserGuidance] = useState('');
  const [guidanceAudioBusy, setGuidanceAudioBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<DetailedRisk[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const gseAnalyze = useMutateAiAnalyzeGse();
  const characterizationAnalyze = useMutateAiAnalyzeCharacterization();
  const upsertMany = useMutUpsertManyRiskData();

  const catalogCompanyId = context?.companyId;

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

  const analyzing =
    gseAnalyze.isPending || characterizationAnalyze.isPending;
  const linking = upsertMany.isLoading;
  const catalogBusy =
    catalogQuery.isLoading || catalogQuery.isFetching;

  useEffect(() => {
    if (!open) {
      setUserGuidance('');
      setSuggestions([]);
      setSelectedIds(new Set());
      setHasAnalyzed(false);
      setGuidanceAudioBusy(false);
    }
  }, [open]);

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
      const body = {
        companyId: context.companyId,
        workspaceId: context.workspaceId,
        userGuidance: userGuidance.trim() || undefined,
        suggestionMode: 'catalog-only' as const,
        scope: 'general' as const,
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
            });

      const incoming =
        result.newRiskSuggestions || result.detailedRisks || [];

      const filtered = filterCatalogOnlyAiSuggestions({
        incoming,
        catalogIds: catalogResult.catalogIds,
        existingDirectRiskIds: existingRiskIds,
      });

      setSuggestions(filtered.accepted);
      // Seleção consciente: nenhuma sugestão pré-marcada; confirmação só com escolha explícita.
      setSelectedIds(new Set());
      setHasAnalyzed(true);

      const feedback = resolveCatalogOnlyAiSuggestionFeedback(filtered);
      if (feedback) {
        enqueueSnackbar(feedback.message, { variant: feedback.variant });
      }
    } catch {
      // snackbar já tratado pelos hooks de mutation quando aplicável
    }
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

  const handleConfirm = async () => {
    if (!context) return;

    const catalogResult = await ensureCatalogLoaded();
    if (!catalogResult.ok) return;

    const selected = [...selectedIds].filter(
      (id) =>
        catalogResult.catalogIds.has(id) && !existingRiskIds.has(id),
    );

    const payload = buildCatalogOnlyRiskLinkPayload({
      riskGroupId: context.riskGroupId,
      entityId: context.entityId,
      selectedRiskIds: selected,
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
      onClose();
    } catch {
      // snackbar do mutation
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
              preenchido automaticamente.
            </Typography>

            {catalogQuery.isError && (
              <Typography variant="body2" color="error">
                {CATALOG_LOAD_ERROR}
              </Typography>
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
                variant="contained"
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

            {hasAnalyzed && (
              <Stack spacing={1}>
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
                      disabled={!suggestions.length || linking}
                    />
                  }
                  label={`Selecionar todos (${suggestions.length})`}
                />

                {suggestions.map((risk) => {
                  const considerationLabel = resolveCatalogOnlyConsiderationLabel(
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
                              {resolveCatalogOnlyOriginLabel(risk.suggestionOrigin)}
                            </Typography>
                            <Typography variant="subtitle2">
                              {risk.name}
                              {risk.type ? ` · ${risk.type}` : ''}
                            </Typography>
                            {considerationLabel && (
                              <Typography
                                variant="body2"
                                color={warnConsideration ? 'warning.main' : 'text.secondary'}
                                sx={{ mt: 0.25 }}
                              >
                                {considerationLabel}
                                {warnConsideration
                                  ? ' — você pode vincular mesmo assim, se julgar adequado.'
                                  : ''}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
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
                    Nenhuma sugestão nova para vincular.
                  </Typography>
                )}
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
