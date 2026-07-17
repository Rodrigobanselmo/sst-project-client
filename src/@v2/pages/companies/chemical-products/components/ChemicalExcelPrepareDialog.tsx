import { SText } from '@v2/components/atoms/SText/SText';
import {
  analyzeChemicalExcelPrepare,
  downloadChemicalExcelAiCuration,
  downloadChemicalExcelPrepare,
  previewChemicalExcelPrepare,
  suggestChemicalExcelAiCuration,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  AiCurationSuggestion,
  ChemicalAiCurationDecision,
  ChemicalAiCurationPendingItem,
  ChemicalPrepareAnalyzeResult,
  ChemicalPrepareColumnMapping,
  ChemicalPreparePreviewResult,
  ChemicalPrepareTargetField,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ChemicalExcelAiCurationPanel,
} from './ChemicalExcelAiCurationPanel';
import {
  countAppliedCurationDecisions,
  getActiveCurationPendingItems,
  hasAiCurationPendencies,
  isBatchConfirmEligible,
} from './chemical-ai-curation-ui.util';
import { resolveChemicalDialogClose } from './chemical-dialog-close.util';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  onGoToValidate?: () => void;
};

const STEPS = [
  'Enviar arquivo',
  'Aba e colunas',
  'Resumo e pendências',
  'Curadoria IA',
  'Download',
];

const FIELD_ORDER: ChemicalPrepareTargetField[] = [
  'tradeName',
  'manufacturer',
  'component',
  'cas',
  'exactPercent',
  'minPercent',
  'maxPercent',
  'concentrationKind',
  'fispqVersion',
  'fispqDate',
  'language',
  'observation',
  'isPure',
];

const AI_CHUNK_SIZE = 12;
const SUMMARY_PENDING_PAGE_SIZE = 15;

function mapApiError(err: any, fallback: string): string {
  const status = err?.response?.status;
  const raw = err?.response?.data?.message;
  const message = Array.isArray(raw) ? raw.join(' ') : raw;
  if (status === 401 || status === 403) {
    return 'Sessão expirada ou sem permissão. Faça login novamente.';
  }
  if (status === 503 || /IA não configurado|OPENAI|Serviço de IA/i.test(String(message || ''))) {
    return 'Serviço de IA indisponível neste ambiente.';
  }
  if (/PubChem|rate limit|429/i.test(String(message || ''))) {
    return 'PubChem indisponível ou com limite de requisições. Tente novamente em instantes.';
  }
  if (/arquivo|xlsx|mapping|aba/i.test(String(message || ''))) {
    return String(message);
  }
  return message || fallback;
}

export const ChemicalExcelPrepareDialog = ({
  open,
  onClose,
  companyId,
  workspaceId,
  onGoToValidate,
}: Props) => {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [analyze, setAnalyze] = useState<ChemicalPrepareAnalyzeResult | null>(
    null,
  );
  const [sheetName, setSheetName] = useState('');
  const [mapping, setMapping] = useState<ChemicalPrepareColumnMapping>({});
  const [preview, setPreview] = useState<ChemicalPreparePreviewResult | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<AiCurationSuggestion[]>([]);
  const [failures, setFailures] = useState<
    Array<{ sourceRowId: string; message: string }>
  >([]);
  const [decisions, setDecisions] = useState<
    Record<string, ChemicalAiCurationDecision>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiProgress, setAiProgress] = useState<{
    total: number;
    done: number;
    currentChunk: number;
    chunkTotal: number;
    cancelled: boolean;
    startedAt: number;
  } | null>(null);
  const [summaryPendingPage, setSummaryPendingPage] = useState(1);
  const cancelAiRef = useRef(false);
  const aiRunningRef = useRef(false);

  const hasDraft =
    Boolean(file) ||
    Boolean(analyze) ||
    Boolean(preview) ||
    Boolean(suggestions.length) ||
    Boolean(Object.keys(decisions).length);

  const pendingItems: ChemicalAiCurationPendingItem[] =
    preview?.pendingItems || [];
  const appliedDecisionCount = countAppliedCurationDecisions(decisions);
  const activePendingItems = getActiveCurationPendingItems({
    pendingItems,
    decisions,
  });
  const eligibleTotal = Math.max(
    preview?.aiCurationEligibleCount ?? 0,
    pendingItems.length,
    preview
      ? preview.summary.reviewRequired +
          preview.summary.noMatch +
          preview.summary.invalidCas
      : 0,
  );
  const remainingEligible = Math.max(0, eligibleTotal - appliedDecisionCount);
  const resolvedDeterministic = preview
    ? Math.max(0, preview.summary.components - eligibleTotal)
    : 0;
  const showAiEntry =
    hasAiCurationPendencies(preview) && remainingEligible > 0;
  const curationQueueDone =
    hasAiCurationPendencies(preview) && remainingEligible === 0;

  useEffect(() => {
    const pageCount = Math.max(
      1,
      Math.ceil(activePendingItems.length / SUMMARY_PENDING_PAGE_SIZE),
    );
    if (summaryPendingPage > pageCount) setSummaryPendingPage(pageCount);
  }, [activePendingItems.length, summaryPendingPage]);

  const clear = () => {
    cancelAiRef.current = true;
    setStep(0);
    setFile(null);
    setAnalyze(null);
    setSheetName('');
    setMapping({});
    setPreview(null);
    setSuggestions([]);
    setFailures([]);
    setDecisions({});
    setError(null);
    setBusy(false);
    setAiProgress(null);
  };

  const requestClose = (reason: string) => {
    const decision = resolveChemicalDialogClose({
      reason,
      hasDraft,
      userConfirmedDiscard: false,
    });
    if (decision === 'keep-open') return;
    if (decision === 'ask-confirm') {
      const ok = window.confirm(
        'Descartar o assistente de preparação? Sugestões e decisões de curadoria em memória serão perdidas. Nada foi gravado no inventário.',
      );
      if (!ok) return;
    }
    clear();
    onClose();
  };

  const headers = useMemo(() => {
    if (!analyze) return [] as string[];
    const selected =
      analyze.sheets.find((sheet) => sheet.name === sheetName) || null;
    return selected?.headers || analyze.headers || [];
  }, [analyze, sheetName]);

  const runAnalyze = async (nextFile: File, nextSheet?: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await analyzeChemicalExcelPrepare({
        companyId,
        workspaceId,
        file: nextFile,
        sheetName: nextSheet || null,
      });
      setAnalyze(result);
      const chosen =
        nextSheet ||
        result.selectedSheetName ||
        result.suggestedSheetName ||
        result.sheets[0]?.name ||
        '';
      setSheetName(chosen);
      setMapping(result.mapping || {});
      setPreview(null);
      setSuggestions([]);
      setDecisions({});
      setFailures([]);
      setAiProgress(null);
      setStep(1);
    } catch (err: any) {
      setError(mapApiError(err, 'Não foi possível analisar a planilha.'));
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (next: File | null) => {
    setFile(next);
    setAnalyze(null);
    setPreview(null);
    setSuggestions([]);
    setDecisions({});
    setFailures([]);
    setError(null);
    if (!next) return;
    if (!next.name.toLowerCase().endsWith('.xlsx')) {
      setError('Aceito apenas arquivo .xlsx.');
      return;
    }
    await runAnalyze(next);
  };

  const handleSheetChange = async (name: string) => {
    setSheetName(name);
    if (!file) return;
    await runAnalyze(file, name);
  };

  const handleProcess = async () => {
    if (!file || !sheetName) return;
    if (!mapping.component) {
      setError('Mapeie a coluna de Componente para continuar.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await previewChemicalExcelPrepare({
        companyId,
        workspaceId,
        file,
        sheetName,
        mapping,
      });
      setPreview(result);
      // Novo processamento invalida curadoria anterior.
      setSuggestions([]);
      setDecisions({});
      setFailures([]);
      setAiProgress(null);
      setStep(2);
    } catch (err: any) {
      setError(mapApiError(err, 'Não foi possível processar a planilha.'));
    } finally {
      setBusy(false);
    }
  };

  /** Reexecuta prepare (previewOnly) para sincronizar pendingItems com o matcher atual da API. */
  const refreshPreview = async (): Promise<ChemicalPreparePreviewResult | null> => {
    if (!file || !sheetName || !mapping.component) return null;
    const result = await previewChemicalExcelPrepare({
      companyId,
      workspaceId,
      file,
      sheetName,
      mapping,
    });
    setPreview(result);
    return result;
  };

  /**
   * Entra na Curadoria IA preservando a memória da preparação
   * (sugestões + decisões já aplicadas). Não zera a fila concluída.
   */
  const enterAiCurationStep = async () => {
    if (!file || !sheetName) return;
    setError(null);
    // Já há preview: continua de onde parou (decisões/sugestões intactas).
    if (preview) {
      setAiProgress(null);
      setStep(3);
      return;
    }
    setBusy(true);
    try {
      const fresh = await refreshPreview();
      if (!fresh) {
        setError('Reprocesse a planilha antes de abrir a curadoria IA.');
        return;
      }
      setAiProgress(null);
      setStep(3);
    } catch (err: any) {
      setError(
        mapApiError(err, 'Não foi possível atualizar pendências antes da IA.'),
      );
    } finally {
      setBusy(false);
    }
  };

  const runAiChunks = async (sourceRowIds: string[]) => {
    if (aiRunningRef.current) return; // bloqueia clique duplicado
    if (!file || !sheetName) {
      setError('Arquivo ou aba perdidos. Envie a planilha novamente.');
      return;
    }
    if (!sourceRowIds.length) {
      setError('Selecione ao menos uma pendência para analisar.');
      return;
    }

    cancelAiRef.current = false;
    aiRunningRef.current = true;
    setBusy(true);
    setError(null);
    setStep(3);

    const chunks: string[][] = [];
    for (let i = 0; i < sourceRowIds.length; i += AI_CHUNK_SIZE) {
      chunks.push(sourceRowIds.slice(i, i + AI_CHUNK_SIZE));
    }

    const mergedSuggestions = new Map<string, AiCurationSuggestion>();
    suggestions.forEach((s) => mergedSuggestions.set(s.sourceRowId, s));
    const mergedFailures = new Map<string, string>();
    failures.forEach((f) => mergedFailures.set(f.sourceRowId, f.message));

    const startedAt = Date.now();
    setAiProgress({
      total: sourceRowIds.length,
      done: 0,
      currentChunk: 0,
      chunkTotal: chunks.length,
      cancelled: false,
      startedAt,
    });

    let done = 0;
    for (let index = 0; index < chunks.length; index += 1) {
      if (cancelAiRef.current) {
        setAiProgress((prev) =>
          prev
            ? { ...prev, cancelled: true, currentChunk: index, startedAt }
            : prev,
        );
        break;
      }
      const chunk = chunks[index]!;
      setAiProgress({
        total: sourceRowIds.length,
        done,
        currentChunk: index + 1,
        chunkTotal: chunks.length,
        cancelled: false,
        startedAt,
      });
      try {
        const result = await suggestChemicalExcelAiCuration({
          companyId,
          workspaceId,
          file,
          sheetName,
          mapping,
          sourceRowIds: chunk,
        });
        for (const suggestion of result.suggestions || []) {
          mergedSuggestions.set(suggestion.sourceRowId, suggestion);
          mergedFailures.delete(suggestion.sourceRowId);
        }
        for (const failure of result.failures || []) {
          mergedFailures.set(failure.sourceRowId, failure.message);
        }
      } catch (err: any) {
        const message = mapApiError(
          err,
          'Falha parcial na curadoria assistida. Decisões anteriores foram preservadas — você pode tentar novamente.',
        );
        for (const id of chunk) {
          if (!mergedSuggestions.has(id)) {
            mergedFailures.set(id, message);
          }
        }
        setError(message);
      }
      done += chunk.length;
      setSuggestions([...mergedSuggestions.values()]);
      setFailures(
        [...mergedFailures.entries()].map(([sourceRowId, message]) => ({
          sourceRowId,
          message,
        })),
      );
      setAiProgress({
        total: sourceRowIds.length,
        done,
        currentChunk: index + 1,
        chunkTotal: chunks.length,
        cancelled: cancelAiRef.current,
        startedAt,
      });
    }

    setBusy(false);
    aiRunningRef.current = false;
    // Remove o loading ao finalizar; fila já foi atualizada acima.
    setAiProgress(null);
  };

  const handleStartAi = async (sourceRowIds?: string[]) => {
    const activeIds = new Set(
      activePendingItems.map((item) => item.sourceRowId),
    );
    const ids = (
      sourceRowIds?.length
        ? sourceRowIds
        : activePendingItems.map((item) => item.sourceRowId)
    ).filter((id) => activeIds.has(id));

    if (ids.length) {
      await runAiChunks(ids);
      return;
    }

    if (!file || !sheetName || !remainingEligible) {
      setError(
        remainingEligible === 0
          ? 'Não há pendências restantes nesta preparação.'
          : 'Não há pendências elegíveis ou o arquivo foi perdido. Reprocesse a planilha.',
      );
      return;
    }

    // Sem pendingItems no preview não há como excluir decisões já aplicadas
    // no cliente — evita reenviar a fila inteira e reapresentar itens concluídos.
    if (pendingItems.length === 0) {
      setError(
        'A lista de pendências não veio no preview. Reprocesse a planilha antes de continuar a curadoria.',
      );
      return;
    }

    setError(
      'Não há itens restantes na fila ativa desta preparação. Volte ao resumo.',
    );
  };

  const handleRetryFailures = async () => {
    const ids = failures.map((f) => f.sourceRowId);
    if (!ids.length) return;
    await runAiChunks(ids);
  };

  const handleCancelAi = () => {
    cancelAiRef.current = true;
  };

  const handleDecision = (decision: ChemicalAiCurationDecision) => {
    setDecisions((prev) => ({
      ...prev,
      [decision.sourceRowId]: decision,
    }));
  };

  const handleBatchConfirm = (sourceRowIds: string[]) => {
    const next: Record<string, ChemicalAiCurationDecision> = { ...decisions };
    for (const id of sourceRowIds) {
      const suggestion = suggestions.find((s) => s.sourceRowId === id);
      if (!suggestion || !isBatchConfirmEligible(suggestion)) continue;
      const top = suggestion.candidates[0];
      if (!top?.cas) continue;

      if (suggestion.type === 'EXISTING_RISK_MATCH') {
        if (!top.riskFactorId) continue;
        next[id] = {
          sourceRowId: id,
          action: 'CONFIRM_EXISTING',
          riskFactorId: top.riskFactorId,
          officialName: top.officialName,
          cas: top.cas,
          confidence: suggestion.confidence,
          suggestionType: suggestion.type,
          rationale: suggestion.rationale,
          evidences: top.evidences,
        };
        continue;
      }

      if (suggestion.type === 'CHEMICAL_IDENTITY') {
        next[id] = {
          sourceRowId: id,
          action: 'CONFIRM_EXISTING',
          riskFactorId: null,
          officialName: top.officialName,
          cas: top.cas,
          confidence: suggestion.confidence,
          suggestionType: suggestion.type,
          rationale: suggestion.rationale,
          evidences: top.evidences,
        };
      }
    }
    setDecisions(next);
  };

  const handleDownload = async () => {
    if (!file || !sheetName || !preview) {
      setError('Arquivo perdido. Envie a planilha novamente para baixar.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const decisionList = Object.values(decisions);
      if (decisionList.length) {
        await downloadChemicalExcelAiCuration({
          companyId,
          workspaceId,
          file,
          sheetName,
          mapping,
          decisions: decisionList,
          suggestions,
        });
      } else {
        await downloadChemicalExcelPrepare({
          companyId,
          workspaceId,
          file,
          sheetName,
          mapping,
        });
      }
      setStep(4);
    } catch (err: any) {
      setError(
        mapApiError(err, 'Não foi possível baixar a planilha preparada.'),
      );
    } finally {
      setBusy(false);
    }
  };

  const goBackFromAi = () => {
    // Mantém sugestões, decisões, arquivo e mapeamento
    setStep(2);
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown={hasDraft}
      onClose={(_event, reason) => requestClose(reason)}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          maxHeight: '94vh',
          height: step >= 3 ? '94vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          width: '96vw',
          maxWidth: 1400,
        },
        onMouseDown: (event) => event.stopPropagation(),
      }}
    >
      <DialogTitle>Preparar planilha para importação</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto', flex: 1 }}>
        <Stack spacing={2} mt={1}>
          <SText fontSize={13} color="text.secondary">
            Envie uma planilha existente. O SimpleSST organiza os dados, tenta
            localizar fatores de risco e devolve uma planilha pronta para
            revisão. Nada é criado no inventário nesta etapa.
          </SText>

          <Stepper activeStep={step} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 || !analyze ? (
            <Button variant="outlined" component="label" disabled={busy}>
              Selecionar planilha .xlsx
              <input
                hidden
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
            </Button>
          ) : null}

          {file ? (
            <SText fontSize={13}>Arquivo: {file.name}</SText>
          ) : null}

          {analyze && step === 1 ? (
            <>
              {analyze.sheetAmbiguous && !sheetName ? (
                <Alert severity="warning">
                  Há mais de uma aba possível. Selecione a aba correta.
                </Alert>
              ) : null}

              <FormControl size="small" fullWidth>
                <InputLabel>Aba com os dados</InputLabel>
                <Select
                  label="Aba com os dados"
                  value={sheetName}
                  onChange={(e) => handleSheetChange(String(e.target.value))}
                >
                  {analyze.sheets.map((sheet) => (
                    <MenuItem key={sheet.name} value={sheet.name}>
                      {sheet.name} ({sheet.dataRowCount} linhas ·{' '}
                      {sheet.headerCount} colunas)
                      {sheet.name === analyze.suggestedSheetName
                        ? ' · sugerida'
                        : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <SText fontWeight={600}>Mapeamento de colunas</SText>
              <SText fontSize={13} color="text.secondary">
                Ajuste se a sugestão automática estiver errada. Só o Componente
                é obrigatório.
              </SText>
              <Stack spacing={1.25}>
                {FIELD_ORDER.map((field) => {
                  const suggestion = analyze.mappingSuggestions.find(
                    (row) => row.field === field,
                  );
                  return (
                    <FormControl key={field} size="small" fullWidth>
                      <InputLabel>{suggestion?.label || field}</InputLabel>
                      <Select
                        label={suggestion?.label || field}
                        value={mapping[field] || ''}
                        onChange={(e) =>
                          setMapping((prev) => ({
                            ...prev,
                            [field]: e.target.value || null,
                          }))
                        }
                      >
                        <MenuItem value="">
                          <em>Não mapear</em>
                        </MenuItem>
                        {headers.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                })}
              </Stack>
            </>
          ) : null}

          {preview && step === 2 ? (
            <Stack spacing={2}>
              <SText fontWeight={600}>Resumo da preparação</SText>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Componentes: ${preview.summary.components}`} />
                <Chip
                  color="success"
                  label={`Resolvidos deterministicamente: ${resolvedDeterministic}`}
                />
                <Chip
                  color="warning"
                  label={`Revisão: ${preview.summary.reviewRequired}`}
                />
                <Chip label={`Sem correspondência: ${preview.summary.noMatch}`} />
                <Chip label={`CAS inválido: ${preview.summary.invalidCas}`} />
              </Stack>

              {showAiEntry ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'warning.main',
                    bgcolor: 'warning.50',
                  }}
                >
                  <SText fontWeight={700} fontSize={18} mb={1}>
                    Pendências encontradas
                  </SText>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
                    <Chip
                      color="warning"
                      label={`Pendências totais: ${eligibleTotal}`}
                    />
                    <Chip
                      color="success"
                      label={`Resolvidas nesta preparação: ${appliedDecisionCount}`}
                    />
                    <Chip
                      color="warning"
                      label={`Restantes na fila: ${remainingEligible}`}
                    />
                    <Chip label={`Revisão necessária: ${preview.summary.reviewRequired}`} />
                    <Chip label={`Sem correspondência: ${preview.summary.noMatch}`} />
                  </Stack>
                  <SText fontSize={13} color="text.secondary" mb={2}>
                    A curadoria é incremental: analise um lote, confirme as
                    decisões e volte para continuar pelos restantes. A planilha
                    preparada deve ser baixada quando a fila estiver concluída
                    (ou quando você decidir encerrar).
                  </SText>

                  {activePendingItems.length ? (
                    <Box mb={2}>
                      <SText fontSize={13} fontWeight={600} mb={1}>
                        Pendências ativas ({activePendingItems.length})
                      </SText>
                      <Stack spacing={0.75} sx={{ maxHeight: 280, overflow: 'auto' }}>
                        {[...activePendingItems]
                          .sort((a, b) => a.sourceRow - b.sourceRow)
                          .slice(
                            (summaryPendingPage - 1) * SUMMARY_PENDING_PAGE_SIZE,
                            summaryPendingPage * SUMMARY_PENDING_PAGE_SIZE,
                          )
                          .map((item) => (
                            <Box
                              key={item.sourceRowId}
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                              }}
                            >
                              <SText fontSize={12} fontWeight={600}>
                                L{item.sourceRow}: {item.tradeName || '—'}
                              </SText>
                              <SText fontSize={12} color="text.secondary">
                                {item.componentOriginal} ·{' '}
                                {item.matchStatus === 'NO_MATCH'
                                  ? 'Sem correspondência'
                                  : item.matchStatus === 'REVIEW_REQUIRED'
                                    ? 'Revisão necessária'
                                    : item.matchStatus === 'INVALID_CAS'
                                      ? 'CAS inválido'
                                      : item.matchStatus}
                              </SText>
                            </Box>
                          ))}
                      </Stack>
                      {Math.ceil(activePendingItems.length / SUMMARY_PENDING_PAGE_SIZE) >
                      1 ? (
                        <Pagination
                          size="small"
                          sx={{ mt: 1 }}
                          page={summaryPendingPage}
                          count={Math.ceil(
                            activePendingItems.length / SUMMARY_PENDING_PAGE_SIZE,
                          )}
                          onChange={(_, p) => setSummaryPendingPage(p)}
                        />
                      ) : null}
                    </Box>
                  ) : null}

                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    disabled={busy}
                    onClick={() => {
                      void enterAiCurationStep();
                    }}
                  >
                    {appliedDecisionCount > 0
                      ? `Continuar curadoria (${remainingEligible} restantes)`
                      : 'Resolver pendências com IA'}
                  </Button>
                </Box>
              ) : curationQueueDone ? (
                <Alert severity="success">
                  Fila de curadoria concluída nesta preparação (
                  {appliedDecisionCount} decisões aplicadas). Você pode baixar a
                  planilha preparada.
                </Alert>
              ) : (
                <Alert severity="success">
                  Todos os componentes foram resolvidos pela camada
                  determinística. Você pode baixar a planilha preparada.
                </Alert>
              )}

              {suggestions.length || appliedDecisionCount ? (
                <Alert severity="info">
                  Curadoria em memória nesta preparação: {suggestions.length}{' '}
                  sugestões, {appliedDecisionCount} decisões aplicadas,{' '}
                  {remainingEligible} restantes na fila ativa.
                </Alert>
              ) : null}

              <Alert severity="info">
                Nenhum produto foi criado nesta etapa. A IA é opcional — você
                pode baixar agora e revisar manualmente.
              </Alert>
            </Stack>
          ) : null}

          {preview && step === 3 ? (
            <Stack spacing={1.5}>
              <ChemicalExcelAiCurationPanel
                pendingItems={pendingItems}
                suggestions={suggestions}
                decisions={decisions}
                failures={failures}
                busy={busy}
                aiProgress={aiProgress}
                companyId={companyId}
                workspaceId={workspaceId}
                onStartAi={handleStartAi}
                onRetryFailures={handleRetryFailures}
                onCancelAi={handleCancelAi}
                onDecision={handleDecision}
                onBatchConfirm={handleBatchConfirm}
              />
            </Stack>
          ) : null}

          {step === 4 ? (
            <Stack spacing={1.5}>
              <Alert severity="success">
                Download iniciado: simplesst-planilha-preparada-produtos-quimicos.xlsx
              </Alert>
              <Alert severity="info">
                Revise a planilha, complete os itens pendentes e use Validar
                planilha preparada antes da importação definitiva.
              </Alert>
              {onGoToValidate ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    clear();
                    onClose();
                    onGoToValidate();
                  }}
                >
                  Ir para validar planilha preparada
                </Button>
              ) : null}
            </Stack>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={() => requestClose('closeButton')}>Fechar</Button>
        {step === 2 ? (
          <Button disabled={busy} onClick={() => setStep(1)}>
            Voltar ao mapeamento
          </Button>
        ) : null}
        {step === 3 ? (
          <Button disabled={busy} onClick={goBackFromAi}>
            Voltar ao resumo
          </Button>
        ) : null}
        {step === 1 ? (
          <Button
            variant="contained"
            disabled={busy || !mapping.component || !sheetName}
            onClick={handleProcess}
          >
            Processar e correlacionar
          </Button>
        ) : null}
        {step === 2 ? (
          <>
            {showAiEntry ? (
              <Button
                variant="contained"
                color="warning"
                disabled={busy}
                onClick={() => {
                  void enterAiCurationStep();
                }}
              >
                {appliedDecisionCount > 0
                  ? `Continuar curadoria (${remainingEligible} restantes)`
                  : 'Resolver pendências com IA'}
              </Button>
            ) : null}
            {!showAiEntry &&
            (suggestions.length || appliedDecisionCount) ? (
              <Button disabled={busy} onClick={() => setStep(3)}>
                Ver histórico da curadoria
              </Button>
            ) : null}
            <Button
              variant={curationQueueDone || !showAiEntry ? 'contained' : 'outlined'}
              disabled={busy || !preview}
              onClick={handleDownload}
            >
              {appliedDecisionCount
                ? `Baixar planilha preparada (${appliedDecisionCount} decisões)`
                : 'Baixar planilha preparada'}
            </Button>
          </>
        ) : null}
        {step === 3 ? (
          <Button
            variant={remainingEligible > 0 ? 'outlined' : 'contained'}
            disabled={busy || !preview}
            onClick={handleDownload}
          >
            {remainingEligible > 0
              ? 'Baixar agora (fila ainda tem pendências)'
              : appliedDecisionCount
                ? `Baixar planilha preparada (${appliedDecisionCount} decisões)`
                : 'Baixar planilha preparada'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};
