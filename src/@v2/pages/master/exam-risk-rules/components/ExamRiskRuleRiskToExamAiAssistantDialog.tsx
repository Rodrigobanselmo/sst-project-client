import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ExamRiskAiAssistantConfigForm } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiAssistantConfigForm';
import { ExamRiskAiAssistantPresetSection } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiAssistantPresetSection';
import {
  buildRiskToExamAiPresetConfig,
  mapExamRiskAiPresetToState,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant-preset.util';
import {
  EXAM_RISK_AI_ANALYSIS_STATUS_COLORS,
  EXAM_RISK_AI_ANALYSIS_STATUS_LABELS,
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS,
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS,
  EXAM_RISK_AI_DECISION_COLORS,
  EXAM_RISK_AI_DECISION_LABELS,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant.constants';
import type { ExamRiskAiAssistantFormValues } from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant.types';
import {
  useMutateCreateExamRiskRuleRiskToExamAiDrafts,
  useMutateDryRunExamRiskRuleRiskToExamAiSuggestions,
} from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import type { IExamRiskRuleCoverageGapItem } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule-coverage-gaps.types';
import type {
  ExamRiskRuleRiskToExamAiAnalysisStatus,
  ExamRiskRuleRiskToExamAiCandidateCompatibility,
  ExamRiskRuleRiskToExamAiDecision,
  ICreateExamRiskRuleRiskToExamAiDraftsResponse,
  IExamRiskRuleRiskToExamAiPreset,
  IExamRiskRuleRiskToExamAiSuggestion,
  IExamRiskRuleRiskToExamAiSuggestionResponse,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

type Props = {
  open: boolean;
  onClose: () => void;
  selectedRisks: IExamRiskRuleCoverageGapItem[];
};

const suggestionKey = (riskFactorId: string, examId: number) =>
  `${riskFactorId}:${examId}`;

const getSelectionBlockReason = (
  riskFactorId: string,
  suggestion: IExamRiskRuleRiskToExamAiSuggestion,
): string | null => {
  if (!riskFactorId) return 'Risco inválido.';
  if (!suggestion.examId) return 'Exame inválido.';
  if (suggestion.decision !== 'suggest') {
    return 'Apenas itens com decisão sugerir podem criar rascunho.';
  }
  if (suggestion.analysisStatus !== 'AI_ANALYZED') {
    return 'Apenas pares retornados pela IA podem criar rascunho.';
  }
  if (suggestion.candidateCompatibility === 'LOW_RELEVANCE') {
    return 'Candidato de baixa relevância não pode ser selecionado.';
  }
  if (suggestion.candidateCompatibility === 'UNASSESSED') {
    return 'Sem foco automático pré-IA; ajuste filtros, exemplos positivos ou instruções.';
  }
  if (suggestion.existingRule) {
    return 'Já existe regra para este risco/exame ou escopo equivalente.';
  }
  return null;
};

export const ExamRiskRuleRiskToExamAiAssistantDialog: FC<Props> = ({
  open,
  onClose,
  selectedRisks,
}) => {
  const [formValues, setFormValues] = useState<ExamRiskAiAssistantFormValues>({
    examSearch: '',
    examType: '',
    onlyESocial: false,
    limit: 30,
    instructions: '',
    positiveExamples: '',
    negativeExamples: '',
    cautionRules: '',
    sessionInstruction: '',
    model: '',
  });
  const [includeExistingRules, setIncludeExistingRules] = useState(true);
  const [includeIndirectCoverage, setIncludeIndirectCoverage] = useState(true);
  const [onlyWithoutExamCoverage, setOnlyWithoutExamCoverage] = useState(false);
  const [result, setResult] =
    useState<IExamRiskRuleRiskToExamAiSuggestionResponse | null>(null);
  const [selectedSuggestionKeys, setSelectedSuggestionKeys] = useState<
    string[]
  >([]);
  const [createdDraftsByKey, setCreatedDraftsByKey] = useState<
    Record<string, { ruleId: string; status: 'DRAFT' }>
  >({});
  const [draftCreationResult, setDraftCreationResult] =
    useState<ICreateExamRiskRuleRiskToExamAiDraftsResponse | null>(null);
  const [confirmCreateDraftsOpen, setConfirmCreateDraftsOpen] = useState(false);

  const dryRunMutation = useMutateDryRunExamRiskRuleRiskToExamAiSuggestions();
  const createDraftsMutation =
    useMutateCreateExamRiskRuleRiskToExamAiDrafts();

  const selectedRiskIds = useMemo(
    () => selectedRisks.map((risk) => risk.riskFactorId),
    [selectedRisks],
  );

  const rows = useMemo(
    () =>
      result?.risks.flatMap((risk) =>
        risk.suggestions.map((suggestion) => ({
          riskFactorId: risk.riskFactorId,
          riskName: risk.riskName,
          suggestion,
        })),
      ) ?? [],
    [result],
  );

  const selectedRows = useMemo(
    () =>
      rows.filter(({ riskFactorId, suggestion }) =>
        selectedSuggestionKeys.includes(
          suggestionKey(riskFactorId, suggestion.examId),
        ),
      ),
    [rows, selectedSuggestionKeys],
  );

  const updateFormField = <K extends keyof ExamRiskAiAssistantFormValues>(
    key: K,
    value: ExamRiskAiAssistantFormValues[K],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const buildPresetConfig = () =>
    buildRiskToExamAiPresetConfig({
      formValues,
      includeExistingRules,
      includeIndirectCoverage,
      onlyWithoutExamCoverage,
    });

  const handleApplyPreset = (preset: IExamRiskRuleRiskToExamAiPreset) => {
    const mapped = mapExamRiskAiPresetToState(preset);
    setFormValues(mapped.formValues);
    setIncludeExistingRules(mapped.includeExistingRules);
    setIncludeIndirectCoverage(mapped.includeIndirectCoverage);
    setOnlyWithoutExamCoverage(mapped.onlyWithoutExamCoverage);
    setResult(null);
    setSelectedSuggestionKeys([]);
    setCreatedDraftsByKey({});
    setDraftCreationResult(null);
  };

  const handleToggleSuggestion = (key: string, checked: boolean) => {
    setSelectedSuggestionKeys((current) =>
      checked ? Array.from(new Set([...current, key])) : current.filter((item) => item !== key),
    );
  };

  const handleCreateSelectedDrafts = () => {
    if (!selectedRows.length) return;

    createDraftsMutation.mutate(
      {
        context: 'MASTER_LIBRARY',
        items: selectedRows.map(({ riskFactorId, suggestion }) => ({
          riskFactorId,
          examId: suggestion.examId,
          decision: suggestion.decision,
          source: suggestion.suggestedSource,
          rationale: suggestion.rationale,
          sourceRationale: suggestion.sourceRationale,
          confidence: suggestion.confidence,
          aiStatus: suggestion.analysisStatus,
          preTriageLevel: suggestion.candidateCompatibility,
        })),
      },
      {
        onSuccess: (response) => {
          setDraftCreationResult(response);
          setConfirmCreateDraftsOpen(false);
          setSelectedSuggestionKeys([]);
          setCreatedDraftsByKey((current) => {
            const next = { ...current };
            response.created.forEach((item) => {
              next[suggestionKey(item.riskFactorId, item.examId)] = {
                ruleId: item.ruleId,
                status: item.status,
              };
            });
            return next;
          });
        },
      },
    );
  };

  const handleDryRun = () => {
    if (!selectedRiskIds.length) return;

    dryRunMutation.mutate(
      {
        context: 'MASTER_LIBRARY',
        selectedRiskFactorIds: selectedRiskIds,
        examFilters: {
          search: formValues.examSearch.trim() || undefined,
          examType: formValues.examType || undefined,
          onlyESocial: formValues.onlyESocial,
          limit: formValues.limit,
        },
        options: {
          includeExistingRules,
          includeIndirectCoverage,
          onlyWithoutExamCoverage,
        },
        aiConfig: {
          instructions: formValues.instructions.trim() || undefined,
          positiveExamples: formValues.positiveExamples.trim() || undefined,
          negativeExamples: formValues.negativeExamples.trim() || undefined,
          cautionRules: formValues.cautionRules.trim() || undefined,
          sessionInstruction: formValues.sessionInstruction.trim() || undefined,
          model: formValues.model.trim() || undefined,
        },
      },
      {
        onSuccess: (response) => {
          setResult(response);
          setSelectedSuggestionKeys([]);
          setCreatedDraftsByKey({});
          setDraftCreationResult(null);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Assistente IA risco → exames</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Alert severity="warning">
            O dry-run apenas sugere exames. A criação só ocorre para itens
            selecionados e confirmados, sempre como rascunho global.
          </Alert>
          <Alert severity="info">
            Ao criar rascunhos, nenhuma regra será ativada automaticamente. O
            MASTER deve revisar e ativar manualmente cada regra.
          </Alert>

          {selectedRisks.length === 0 ? (
            <Alert severity="info">
              Selecione ao menos um risco na tabela.
            </Alert>
          ) : (
            <Stack spacing={1}>
              <Typography variant="subtitle1">Riscos selecionados</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {selectedRisks.map((risk) => (
                  <Chip
                    key={risk.riskFactorId}
                    label={`${risk.name} · ${risk.type}`}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Stack>
          )}

          <ExamRiskAiAssistantPresetSection
            open={open}
            buildPresetConfig={buildPresetConfig}
            onApplyPreset={handleApplyPreset}
          />

          <ExamRiskAiAssistantConfigForm
            values={formValues}
            onFieldChange={updateFormField}
            optionSwitches={[
              {
                key: 'includeExistingRules',
                label: 'Mostrar regras existentes',
                checked: includeExistingRules,
                onChange: setIncludeExistingRules,
              },
              {
                key: 'includeIndirectCoverage',
                label: 'Considerar cobertura indireta',
                checked: includeIndirectCoverage,
                onChange: setIncludeIndirectCoverage,
              },
              {
                key: 'onlyWithoutExamCoverage',
                label: 'Somente pares sem cobertura',
                checked: onlyWithoutExamCoverage,
                onChange: setOnlyWithoutExamCoverage,
              },
            ]}
          />

          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            <Button
              variant="contained"
              onClick={handleDryRun}
              disabled={
                selectedRiskIds.length === 0 || dryRunMutation.isPending
              }
            >
              {dryRunMutation.isPending
                ? 'Rodando dry-run...'
                : 'Rodar dry-run'}
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setConfirmCreateDraftsOpen(true)}
              disabled={
                selectedRows.length === 0 || createDraftsMutation.isPending
              }
            >
              Criar rascunhos selecionados
            </Button>
            <Typography variant="body2" color="text.secondary">
              {selectedRows.length} item(ns) elegível(is) selecionado(s)
            </Typography>
          </Box>

          {draftCreationResult && (
            <Alert severity="success">
              Rascunhos criados: {draftCreationResult.totals.created}. Ignorados:{' '}
              {draftCreationResult.totals.skipped}. Duplicados:{' '}
              {draftCreationResult.totals.duplicates}. Inválidos:{' '}
              {draftCreationResult.totals.invalid}.
              {draftCreationResult.warnings.map((warning) => (
                <Typography key={warning} variant="body2">
                  {warning}
                </Typography>
              ))}
            </Alert>
          )}

          {result && (
            <Stack spacing={2}>
              <Alert severity="info">
                Dry-run concluído: {result.totals.risksLoaded} risco(s),{' '}
                {result.totals.examsLoaded} exame(s),{' '}
                {result.totals.analyzedPairs} par(es) analisados. Sugestões:{' '}
                {result.totals.suggest}; ambíguos: {result.totals.ambiguous};
                excluídos: {result.totals.exclude}.
              </Alert>

              {result.warnings.length > 0 && (
                <Alert severity="warning">
                  {result.warnings.map((warning) => (
                    <Typography key={warning} variant="body2">
                      {warning}
                    </Typography>
                  ))}
                </Alert>
              )}

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Selecionar</TableCell>
                      <TableCell>Risco</TableCell>
                      <TableCell>Exame sugerido</TableCell>
                      <TableCell>Decisão</TableCell>
                      <TableCell>Status IA</TableCell>
                      <TableCell>Triagem pré-IA</TableCell>
                      <TableCell>Confiança</TableCell>
                      <TableCell>Fonte</TableCell>
                      <TableCell>Regra existente</TableCell>
                      <TableCell>Justificativa</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10}>
                          Nenhuma sugestão retornada para os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map(({ riskFactorId, riskName, suggestion }) => (
                        <ResultRow
                          key={`${riskFactorId}-${suggestion.examId}`}
                          riskFactorId={riskFactorId}
                          riskName={riskName}
                          suggestion={suggestion}
                          selected={selectedSuggestionKeys.includes(
                            suggestionKey(riskFactorId, suggestion.examId),
                          )}
                          createdDraft={createdDraftsByKey[
                            suggestionKey(riskFactorId, suggestion.examId)
                          ]}
                          onToggle={handleToggleSuggestion}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <Dialog open={confirmCreateDraftsOpen} onClose={() => setConfirmCreateDraftsOpen(false)}>
        <DialogTitle>Confirmar criação de rascunhos</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="warning">
              Serão criadas regras globais em rascunho. Nenhuma regra será
              ativada automaticamente.
            </Alert>
            <Typography>
              Itens selecionados: {selectedRows.length}. O MASTER deve revisar e
              ativar manualmente cada regra.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCreateDraftsOpen(false)}>
            Cancelar
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={handleCreateSelectedDrafts}
            disabled={!selectedRows.length || createDraftsMutation.isPending}
          >
            {createDraftsMutation.isPending
              ? 'Criando rascunhos...'
              : 'Criar rascunhos'}
          </Button>
        </DialogActions>
      </Dialog>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

const ResultRow: FC<{
  riskFactorId: string;
  riskName: string;
  suggestion: IExamRiskRuleRiskToExamAiSuggestion;
  selected: boolean;
  createdDraft?: { ruleId: string; status: 'DRAFT' };
  onToggle: (key: string, checked: boolean) => void;
}> = ({
  riskFactorId,
  riskName,
  suggestion,
  selected,
  createdDraft,
  onToggle,
}) => {
  const analysisStatus = suggestion.analysisStatus ?? 'AI_ANALYZED';
  const candidateCompatibility =
    suggestion.candidateCompatibility ?? 'UNASSESSED';
  const key = suggestionKey(riskFactorId, suggestion.examId);
  const blockReason = createdDraft
    ? 'Rascunho já criado nesta sessão.'
    : getSelectionBlockReason(riskFactorId, suggestion);
  const canSelect = !blockReason;

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          disabled={!canSelect}
          onChange={(event) => onToggle(key, event.target.checked)}
        />
        {blockReason && (
          <Typography variant="caption" color="text.secondary" display="block">
            {blockReason}
          </Typography>
        )}
      </TableCell>
      <TableCell>{riskName}</TableCell>
      <TableCell>
        <Typography variant="body2">{suggestion.examName}</Typography>
        <Typography variant="caption" color="text.secondary">
          {suggestion.examType ?? 'Tipo não informado'} · eSocial{' '}
          {suggestion.esocial27Code ?? '—'}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={EXAM_RISK_AI_DECISION_LABELS[suggestion.decision]}
          color={EXAM_RISK_AI_DECISION_COLORS[suggestion.decision]}
          variant={suggestion.decision === 'exclude' ? 'outlined' : 'filled'}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={EXAM_RISK_AI_ANALYSIS_STATUS_LABELS[analysisStatus]}
          color={EXAM_RISK_AI_ANALYSIS_STATUS_COLORS[analysisStatus]}
          variant={analysisStatus === 'AI_ANALYZED' ? 'outlined' : 'filled'}
        />
        {suggestion.analysisStatusReason && (
          <Typography variant="caption" color="text.secondary" display="block">
            {suggestion.analysisStatusReason}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={
            EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS[candidateCompatibility]
          }
          color={
            EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS[candidateCompatibility]
          }
          variant={candidateCompatibility === 'DIRECT' ? 'filled' : 'outlined'}
        />
        {suggestion.candidateCompatibilityReason && (
          <Typography variant="caption" color="text.secondary" display="block">
            {suggestion.candidateCompatibilityReason}
          </Typography>
        )}
      </TableCell>
      <TableCell>{Math.round(suggestion.confidence * 100)}%</TableCell>
      <TableCell>
        <Typography variant="body2">{suggestion.suggestedSource}</Typography>
        <Typography variant="caption" color="text.secondary">
          {suggestion.sourceRationale}
        </Typography>
      </TableCell>
      <TableCell>
        {createdDraft ? (
          <Box>
            <Chip size="small" color="warning" label="Rascunho criado" />
            <Typography variant="caption" color="text.secondary" display="block">
              DRAFT · {createdDraft.ruleId}
            </Typography>
          </Box>
        ) : suggestion.existingRule ? (
          <Typography variant="body2">
            {suggestion.existingRule.scope} · {suggestion.existingRule.status} ·{' '}
            {suggestion.existingRule.matchedBy}
          </Typography>
        ) : suggestion.existingIndirectCoverage?.length ? (
          <Typography variant="body2">
            Indireta ({suggestion.existingIndirectCoverage.length})
          </Typography>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{suggestion.rationale}</Typography>
        {suggestion.cautions?.map((caution) => (
          <Typography
            key={caution}
            variant="caption"
            color="warning.main"
            display="block"
          >
            {caution}
          </Typography>
        ))}
      </TableCell>
    </TableRow>
  );
};
