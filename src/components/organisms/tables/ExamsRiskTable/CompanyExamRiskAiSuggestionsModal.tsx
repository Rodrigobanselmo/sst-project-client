import { FC, useEffect, useMemo, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { ExamRiskAiAccumulatedSelectionPanel } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiAccumulatedSelectionPanel';
import { ExamRiskAiAssistantPresetSection } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiAssistantPresetSection';
import { buildRiskExamAccumulationKey } from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant-accumulated.util';
import { useExamRiskAiAccumulatedSuggestions } from '@v2/components/medicine/exam-risk-ai-assistant/useExamRiskAiAccumulatedSuggestions';
import {
  buildRiskToExamAiPresetConfig,
  mapCompanyPresetToState,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant-preset.util';
import {
  EXAM_RISK_AI_ANALYSIS_STATUS_COLORS,
  EXAM_RISK_AI_ANALYSIS_STATUS_LABELS,
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS,
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS,
  EXAM_RISK_AI_DECISION_COLORS,
  EXAM_RISK_AI_DECISION_LABELS,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant.constants';
import {
  buildExamRiskAiAssistantPayload,
  createDefaultExamRiskAiAssistantFormValues,
  type ExamRiskAiAssistantFormValues,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant.types';
import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';

import { useApplyCompanyExamRiskAiSuggestions } from '@v2/services/medicine/company-exam-risk-ai-suggestions/hooks/useApplyCompanyExamRiskAiSuggestions';
import { useDryRunCompanyExamRiskAiSuggestions } from '@v2/services/medicine/company-exam-risk-ai-suggestions/hooks/useDryRunCompanyExamRiskAiSuggestions';
import {
  CompanyExamRiskAiApplyItemStatusEnum,
  type IApplyCompanyExamRiskAiSuggestionItemResult,
  type IApplyCompanyExamRiskAiSuggestionsResponse,
  type ICompanyExamRiskAiSuggestionItem,
  type IDryRunCompanyExamRiskAiSuggestionsResponse,
} from '@v2/services/medicine/company-exam-risk-ai-suggestions/company-exam-risk-ai-suggestions.types';
import type { IResolvedExamRiskConfig } from '@v2/services/medicine/company-exam-risk-suggestions/company-exam-risk-suggestions.types';

import { getExamAge, getExamPeriodic } from './exam-risk-display.util';

type Step = 'setup' | 'select' | 'preview' | 'result';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId?: string;
  riskId: string;
  riskName: string;
  onApplied: () => void;
};

const getRiskDegreeLabel = (value?: number | null) => {
  if (!value) return '-';
  return matrixRiskMap[value as keyof typeof matrixRiskMap]?.label || '-';
};

const getConfigSourceLabel = (source: IResolvedExamRiskConfig['configSource']) => {
  if (source.ruleExamRowId) return 'Regra da biblioteca';
  if (source.usedCompanyDefaults) return 'Padrões PCMSO da empresa';
  if (source.usedCreationDefaults) return 'Padrões de criação';
  return '-';
};

const formatSex = (config: IResolvedExamRiskConfig) => {
  const parts: string[] = [];
  if (config.isMale) parts.push('M');
  if (config.isFemale) parts.push('F');
  return parts.length ? parts.join(' / ') : '-';
};

const formatAgeRange = (config: IResolvedExamRiskConfig) =>
  getExamAge({
    fromAge: config.fromAge ?? undefined,
    toAge: config.toAge ?? undefined,
  });

const formatPeriodicity = (config: IResolvedExamRiskConfig) =>
  getExamPeriodic({
    isAdmission: config.isAdmission,
    isPeriodic: config.isPeriodic,
    isChange: config.isChange,
    isReturn: config.isReturn,
    isDismissal: config.isDismissal,
  }).text || '-';

const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}%`;

const getApplyItemStatusLabel = (
  status: CompanyExamRiskAiApplyItemStatusEnum,
  dryRun: boolean,
) => {
  switch (status) {
    case CompanyExamRiskAiApplyItemStatusEnum.CREATED:
      return dryRun ? 'Pronto para criar' : 'Criado';
    case CompanyExamRiskAiApplyItemStatusEnum.WOULD_CREATE:
      return 'Pronto para criar';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_ALREADY_LINKED:
      return 'Já vinculado';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_DUPLICATE_REQUEST:
      return 'Duplicado na solicitação';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_NOT_CHARACTERIZED:
      return 'Risco não caracterizado';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_NO_LIBRARY_REFERENCE:
      return 'Sem referência na biblioteca';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_NOT_ELIGIBLE:
      return 'Não elegível';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_LOW_RELEVANCE:
      return 'Baixa relevância';
    case CompanyExamRiskAiApplyItemStatusEnum.ERROR:
      return 'Erro';
    default:
      return status;
  }
};

const buildDefaultSelectedKeys = (suggestions: ICompanyExamRiskAiSuggestionItem[]) =>
  suggestions
    .filter((item) => item.isSelectable && item.decision === 'suggest')
    .map((item) => item.suggestionKey);

const getAnalysisStatusLabel = (status: string) =>
  EXAM_RISK_AI_ANALYSIS_STATUS_LABELS[
    status as keyof typeof EXAM_RISK_AI_ANALYSIS_STATUS_LABELS
  ] ?? status;

const getAnalysisStatusColor = (status: string) =>
  EXAM_RISK_AI_ANALYSIS_STATUS_COLORS[
    status as keyof typeof EXAM_RISK_AI_ANALYSIS_STATUS_COLORS
  ] ?? 'default';

const getCandidateCompatibilityLabel = (value: string) =>
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS[
    value as keyof typeof EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS
  ] ?? value;

const getCandidateCompatibilityColor = (value: string) =>
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS[
    value as keyof typeof EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS
  ] ?? 'default';

const ApplyPreviewTable: FC<{
  items: IApplyCompanyExamRiskAiSuggestionItemResult[];
  dryRun: boolean;
}> = ({ items, dryRun }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Exame</TableCell>
        <TableCell>Periodicidade</TableCell>
        <TableCell>Sexo</TableCell>
        <TableCell>Faixa etária</TableCell>
        <TableCell>Validade (meses)</TableCell>
        <TableCell>Considerar (dias)</TableCell>
        <TableCell>Qualitativo</TableCell>
        <TableCell>Quantitativo</TableCell>
        <TableCell>Origem</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.examId}>
          <TableCell>{item.examName}</TableCell>
          <TableCell>{formatPeriodicity(item.proposedConfig)}</TableCell>
          <TableCell>{formatSex(item.proposedConfig)}</TableCell>
          <TableCell>{formatAgeRange(item.proposedConfig)}</TableCell>
          <TableCell>{item.proposedConfig.validityInMonths ?? '-'}</TableCell>
          <TableCell>{item.proposedConfig.considerBetweenDays ?? '-'}</TableCell>
          <TableCell>
            {getRiskDegreeLabel(item.proposedConfig.minRiskDegree)}
          </TableCell>
          <TableCell>
            {getRiskDegreeLabel(item.proposedConfig.minRiskDegreeQuantity)}
          </TableCell>
          <TableCell>
            {getConfigSourceLabel(item.proposedConfig.configSource)}
          </TableCell>
          <TableCell>{getApplyItemStatusLabel(item.status, dryRun)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const SuggestionResultRow: FC<{
  item: ICompanyExamRiskAiSuggestionItem;
  selected: boolean;
  alreadyAccumulated: boolean;
  onToggle: (suggestionKey: string) => void;
}> = ({ item, selected, alreadyAccumulated, onToggle }) => {
  const decisionLabel =
    EXAM_RISK_AI_DECISION_LABELS[
      item.decision as keyof typeof EXAM_RISK_AI_DECISION_LABELS
    ] ?? item.decision;
  const decisionColor =
    EXAM_RISK_AI_DECISION_COLORS[
      item.decision as keyof typeof EXAM_RISK_AI_DECISION_COLORS
    ] ?? 'default';

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          disabled={!item.isSelectable || alreadyAccumulated}
          onChange={() => onToggle(item.suggestionKey)}
        />
        {alreadyAccumulated && (
          <Typography variant="caption" color="success.main" display="block">
            Já adicionado
          </Typography>
        )}
        {item.selectionBlockReason && !alreadyAccumulated && (
          <Typography variant="caption" color="text.secondary" display="block">
            {item.selectionBlockReason}
          </Typography>
        )}
      </TableCell>
      <TableCell>{item.examName}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={decisionLabel}
          color={decisionColor}
          variant={item.decision === 'exclude' ? 'outlined' : 'filled'}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={getAnalysisStatusLabel(item.analysisStatus)}
          color={getAnalysisStatusColor(item.analysisStatus)}
          variant={
            item.analysisStatus === 'AI_ANALYZED' ? 'outlined' : 'filled'
          }
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={getCandidateCompatibilityLabel(item.candidateCompatibility)}
          color={getCandidateCompatibilityColor(item.candidateCompatibility)}
          variant={
            item.candidateCompatibility === 'DIRECT' ? 'filled' : 'outlined'
          }
        />
      </TableCell>
      <TableCell>{formatConfidence(item.confidence)}</TableCell>
      <TableCell>
        <Typography variant="body2">{item.suggestedSource ?? '—'}</Typography>
        {item.sourceRationale && (
          <Typography variant="caption" color="text.secondary">
            {item.sourceRationale}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {item.existingCompanyLink ? (
          <Typography variant="body2">
            Vínculo #{item.existingCompanyLink.linkId} ·{' '}
            {item.existingCompanyLink.examName}
          </Typography>
        ) : item.existingGlobalRule ? (
          <Typography variant="body2">
            Biblioteca · {item.existingGlobalRule.scope} ·{' '}
            {item.existingGlobalRule.status}
          </Typography>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{item.rationale || '—'}</Typography>
        {item.exclusionReason && (
          <Typography variant="caption" color="text.secondary" display="block">
            {item.exclusionReason}
          </Typography>
        )}
        {item.cautions.map((caution) => (
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
      <TableCell sx={{ maxWidth: 180 }}>
        <Typography variant="caption" display="block">
          {formatPeriodicity(item.proposedConfig)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getConfigSourceLabel(item.proposedConfig.configSource)}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export const CompanyExamRiskAiSuggestionsModal: FC<Props> = ({
  open,
  onClose,
  companyId,
  workspaceId,
  riskId,
  riskName,
  onApplied,
}) => {
  const dryRunMutation = useDryRunCompanyExamRiskAiSuggestions();
  const applyMutation = useApplyCompanyExamRiskAiSuggestions();
  const { isMasterAdmin } = usePermissionsAccess();

  const getAccumulationKey = (item: ICompanyExamRiskAiSuggestionItem) =>
    buildRiskExamAccumulationKey(riskId, item.examId);

  const accumulated = useExamRiskAiAccumulatedSuggestions(
    getAccumulationKey,
  );

  const [step, setStep] = useState<Step>('setup');
  const [formValues, setFormValues] = useState<ExamRiskAiAssistantFormValues>(
    createDefaultExamRiskAiAssistantFormValues(),
  );
  const [includeExistingLinks, setIncludeExistingLinks] = useState(false);
  const [onlyWithoutCompanyLink, setOnlyWithoutCompanyLink] = useState(true);
  const [dryRunData, setDryRunData] =
    useState<IDryRunCompanyExamRiskAiSuggestionsResponse | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [previewData, setPreviewData] =
    useState<IApplyCompanyExamRiskAiSuggestionsResponse | null>(null);
  const [resultData, setResultData] =
    useState<IApplyCompanyExamRiskAiSuggestionsResponse | null>(null);

  const selectableSuggestions = useMemo(
    () => dryRunData?.suggestions.filter((item) => item.isSelectable) ?? [],
    [dryRunData],
  );

  const selectedSuggestions = useMemo(() => {
    if (!dryRunData) return [];
    const keySet = new Set(selectedKeys);
    return dryRunData.suggestions.filter((item) => keySet.has(item.suggestionKey));
  }, [dryRunData, selectedKeys]);

  const accumulatedRows = useMemo(
    () =>
      accumulated.items.map((item) => ({
        key: getAccumulationKey(item),
        examLabel: item.examName,
        decision: item.decision,
        confidence: item.confidence,
      })),
    [accumulated.items, riskId],
  );

  useEffect(() => {
    if (!open) return;
    setStep('setup');
    setFormValues(createDefaultExamRiskAiAssistantFormValues());
    setIncludeExistingLinks(false);
    setOnlyWithoutCompanyLink(true);
    setDryRunData(null);
    setSelectedKeys([]);
    setPreviewData(null);
    setResultData(null);
    accumulated.clear();
    dryRunMutation.reset();
    applyMutation.reset();
  }, [open, riskId]);

  const updateFormField = <K extends keyof ExamRiskAiAssistantFormValues>(
    key: K,
    value: ExamRiskAiAssistantFormValues[K],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const buildPresetConfig = () =>
    buildRiskToExamAiPresetConfig({
      formValues,
      includeExistingRules: includeExistingLinks,
      includeIndirectCoverage: false,
      onlyWithoutExamCoverage: onlyWithoutCompanyLink,
    });

  const handleApplyPreset = (
    preset: Parameters<typeof mapCompanyPresetToState>[0],
  ) => {
    const mapped = mapCompanyPresetToState(preset);
    setFormValues(mapped.formValues);
    setIncludeExistingLinks(mapped.includeExistingLinks);
    setOnlyWithoutCompanyLink(mapped.onlyWithoutCompanyLink);
    setDryRunData(null);
    setSelectedKeys([]);
    setPreviewData(null);
    setResultData(null);
    accumulated.clear();
    setStep('setup');
  };

  const onAddSelectedToAccumulated = () => {
    if (!selectedSuggestions.length) return;
    accumulated.addItems(
      selectedSuggestions,
      (item) => item.isSelectable,
    );
    setSelectedKeys([]);
  };

  const onGenerateSuggestions = async () => {
    const payload = buildExamRiskAiAssistantPayload(formValues);
    const response = await dryRunMutation.mutateAsync({
      companyId,
      riskId,
      workspaceId,
      examFilters: payload.examFilters,
      options: {
        includeExistingLinks,
        onlyWithoutCompanyLink,
      },
      aiConfig: payload.aiConfig,
    });
    setDryRunData(response);
    setSelectedKeys(buildDefaultSelectedKeys(response.suggestions));
    setStep('select');
  };

  const onToggleSuggestion = (suggestionKey: string) => {
    setSelectedKeys((current) =>
      current.includes(suggestionKey)
        ? current.filter((key) => key !== suggestionKey)
        : [...current, suggestionKey],
    );
  };

  const onToggleAllSelectable = (checked: boolean) => {
    setSelectedKeys(
      checked
        ? selectableSuggestions
            .filter(
              (item) =>
                !accumulated.isAccumulated(getAccumulationKey(item)),
            )
            .map((item) => item.suggestionKey)
        : [],
    );
  };

  const buildApplyItems = () =>
    accumulated.items.map((item) => ({
      examId: item.examId,
      rationale: item.rationale,
    }));

  const onPreviewApply = async () => {
    if (!accumulated.count) return;
    const response = await applyMutation.mutateAsync({
      companyId,
      riskId,
      workspaceId,
      dryRun: true,
      items: buildApplyItems(),
    });
    setPreviewData(response);
    setStep('preview');
  };

  const onConfirmApply = async () => {
    if (!previewData || !accumulated.count) return;
    const response = await applyMutation.mutateAsync({
      companyId,
      riskId,
      workspaceId,
      dryRun: false,
      items: buildApplyItems(),
    });
    setResultData(response);
    setStep('result');
    if (response.summary.created > 0) {
      onApplied();
    }
  };

  const isLoading = dryRunMutation.isLoading || applyMutation.isLoading;
  const allSelectableSelected =
    selectableSuggestions.length > 0 &&
    selectableSuggestions.every((item) =>
      selectedKeys.includes(item.suggestionKey),
    );

  const dialogTitle = {
    setup: 'Assistente IA risco → exames (empresa)',
    select: 'Sugestões de exames',
    preview: 'Pré-visualização dos vínculos',
    result: 'Resultado da criação',
  }[step];

  const accumulatedPanel =
    accumulated.count > 0 ? (
      <ExamRiskAiAccumulatedSelectionPanel
        title="Selecionados para aplicar"
        rows={accumulatedRows}
        onRemove={accumulated.removeItem}
      />
    ) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" fontSize="small" />
        {dialogTitle}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Risco: <strong>{dryRunData?.riskName ?? riskName}</strong>
          </Typography>

          {step === 'setup' && (
            <>
              <Alert severity="warning">
                A IA apenas sugere exames. Nada será gravado no catálogo da
                empresa até você revisar tecnicamente, selecionar os itens e
                confirmar a criação.
              </Alert>
              <Alert severity="info">
                O dry-run não cria vínculos. A confirmação gera apenas vínculos
                ExamToRisk nesta empresa e não altera a Biblioteca global.
                Revise cada sugestão antes de aplicar.
              </Alert>
              <Alert severity="info">
                Você pode rodar vários dry-runs, adicionar sugestões à lista
                acumulada e aplicar todos os vínculos de uma vez ao final.
              </Alert>

              {isMasterAdmin && (
                <ExamRiskAiAssistantPresetSection
                  open={open}
                  buildPresetConfig={buildPresetConfig}
                  onApplyPreset={handleApplyPreset}
                  contextNote="O risco selecionado e o resultado anterior foram mantidos/limpos conforme o fluxo da empresa."
                />
              )}

              <ExamRiskAiAssistantConfigForm
                values={formValues}
                onFieldChange={updateFormField}
                optionSwitches={[
                  {
                    key: 'includeExistingLinks',
                    label: 'Mostrar vínculos existentes na empresa',
                    checked: includeExistingLinks,
                    onChange: setIncludeExistingLinks,
                  },
                  {
                    key: 'onlyWithoutCompanyLink',
                    label: 'Somente pares sem vínculo na empresa',
                    checked: onlyWithoutCompanyLink,
                    onChange: setOnlyWithoutCompanyLink,
                  },
                ]}
              />
              {accumulatedPanel}
            </>
          )}

          {step === 'select' && dryRunData && (
            <Stack spacing={2}>
              {accumulatedPanel}
              <Alert severity="info">
                Dry-run concluído: {dryRunData.totals.pairsAnalyzed} par(es)
                analisado(s). Sugestões: {dryRunData.totals.suggested}; ambíguos:{' '}
                {dryRunData.totals.ambiguous}; excluídos:{' '}
                {dryRunData.totals.excluded}.
              </Alert>

              {dryRunData.warnings.length > 0 && (
                <Alert severity="warning">
                  {dryRunData.warnings.map((warning) => (
                    <Typography key={warning} variant="body2">
                      {warning}
                    </Typography>
                  ))}
                </Alert>
              )}

              {selectableSuggestions.length === 0 ? (
                <Alert severity="info">
                  Nenhum exame selecionável foi encontrado para este risco.
                  Ajuste filtros, exemplos positivos/negativos ou cautelas e gere
                  novamente.
                </Alert>
              ) : (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allSelectableSelected}
                      indeterminate={
                        selectedKeys.length > 0 && !allSelectableSelected
                      }
                      onChange={(event) =>
                        onToggleAllSelectable(event.target.checked)
                      }
                    />
                  }
                  label="Selecionar todos os itens elegíveis"
                />
              )}

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Selecionar</TableCell>
                      <TableCell>Exame sugerido</TableCell>
                      <TableCell>Decisão</TableCell>
                      <TableCell>Status IA</TableCell>
                      <TableCell>Triagem pré-IA</TableCell>
                      <TableCell>Confiança</TableCell>
                      <TableCell>Fonte</TableCell>
                      <TableCell>Vínculo / biblioteca</TableCell>
                      <TableCell>Justificativa</TableCell>
                      <TableCell>Config. PCMSO</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dryRunData.suggestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10}>
                          Nenhuma sugestão retornada para os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      dryRunData.suggestions.map((item) => (
                        <SuggestionResultRow
                          key={item.suggestionKey}
                          item={item}
                          selected={selectedKeys.includes(item.suggestionKey)}
                          alreadyAccumulated={accumulated.isAccumulated(
                            getAccumulationKey(item),
                          )}
                          onToggle={onToggleSuggestion}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}

          {step === 'preview' && previewData && (
            <Box>
              {accumulatedPanel}
              <Alert severity="info" sx={{ mb: 2, mt: accumulated.count ? 2 : 0 }}>
                Serão criados vínculos novos no catálogo desta empresa. Nenhum
                vínculo existente será alterado e nenhuma regra global será
                publicada.
              </Alert>
              {previewData.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {previewData.warnings.join(' ')}
                </Alert>
              )}
              <ApplyPreviewTable items={previewData.items} dryRun />
            </Box>
          )}

          {step === 'result' && resultData && (
            <Box>
              <Alert
                severity={resultData.summary.errors > 0 ? 'warning' : 'success'}
                sx={{ mb: 2 }}
              >
                {resultData.summary.created} criado(s),{' '}
                {resultData.summary.skipped} ignorado(s),{' '}
                {resultData.summary.errors} erro(s).
              </Alert>
              {resultData.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {resultData.warnings.join(' ')}
                </Alert>
              )}
              <ApplyPreviewTable items={resultData.items} dryRun={false} />
            </Box>
          )}

          {(dryRunMutation.isError || applyMutation.isError) && (
            <Alert severity="error">
              Não foi possível processar a solicitação. Tente novamente.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {step === 'setup' && (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            {accumulated.count > 0 && (
              <Button
                variant="outlined"
                disabled={isLoading}
                onClick={onPreviewApply}
              >
                Pré-visualizar vínculos ({accumulated.count})
              </Button>
            )}
            <Button
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              onClick={onGenerateSuggestions}
            >
              {isLoading ? 'Rodando dry-run...' : 'Rodar dry-run'}
            </Button>
          </>
        )}

        {step === 'select' && (
          <>
            <Button onClick={() => setStep('setup')} disabled={isLoading}>
              Voltar
            </Button>
            <Button onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="outlined"
              disabled={!selectedKeys.length || isLoading}
              onClick={onAddSelectedToAccumulated}
            >
              Adicionar selecionados à lista
            </Button>
            <Button
              variant="contained"
              disabled={!accumulated.count || isLoading}
              onClick={onPreviewApply}
            >
              Pré-visualizar vínculos ({accumulated.count})
            </Button>
          </>
        )}

        {step === 'preview' && (
          <>
            <Button onClick={() => setStep('select')} disabled={isLoading}>
              Voltar
            </Button>
            <Button onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={isLoading || !previewData}
              onClick={onConfirmApply}
            >
              Confirmar
            </Button>
          </>
        )}

        {step === 'result' && (
          <Button variant="contained" onClick={onClose}>
            Fechar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
