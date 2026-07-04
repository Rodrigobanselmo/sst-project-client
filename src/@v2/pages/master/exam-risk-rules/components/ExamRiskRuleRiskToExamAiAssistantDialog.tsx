import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useFetchExamRiskRuleRiskToExamAiPresets } from '@v2/services/medicine/exam-risk-rule/hooks/useFetchExamRiskRuleRiskToExamAiPresets';
import {
  useMutateCreateExamRiskRuleRiskToExamAiPreset,
  useMutateDeleteExamRiskRuleRiskToExamAiPreset,
  useMutateDryRunExamRiskRuleRiskToExamAiSuggestions,
  useMutateUpdateExamRiskRuleRiskToExamAiPreset,
} from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import type { IExamRiskRuleCoverageGapItem } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule-coverage-gaps.types';
import type {
  ExamRiskRuleRiskToExamAiAnalysisStatus,
  ExamRiskRuleRiskToExamAiCandidateCompatibility,
  ExamRiskRuleRiskToExamAiDecision,
  ICreateExamRiskRuleRiskToExamAiPresetPayload,
  IExamRiskRuleRiskToExamAiPreset,
  IExamRiskRuleRiskToExamAiSuggestion,
  IExamRiskRuleRiskToExamAiSuggestionResponse,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

type Props = {
  open: boolean;
  onClose: () => void;
  selectedRisks: IExamRiskRuleCoverageGapItem[];
};

const examTypeOptions = [
  { value: '', label: 'Todos' },
  { value: 'LAB', label: 'Laboratorial' },
  { value: 'AUDIO', label: 'Audiometria' },
  { value: 'VISUAL', label: 'Visual' },
  { value: 'OTHERS', label: 'Outros' },
];

const decisionLabels: Record<ExamRiskRuleRiskToExamAiDecision, string> = {
  suggest: 'Sugerir',
  exclude: 'Excluir',
  ambiguous: 'Ambíguo',
};

const decisionColors: Record<
  ExamRiskRuleRiskToExamAiDecision,
  'success' | 'default' | 'warning'
> = {
  suggest: 'success',
  exclude: 'default',
  ambiguous: 'warning',
};

const analysisStatusLabels: Record<
  ExamRiskRuleRiskToExamAiAnalysisStatus,
  string
> = {
  AI_ANALYZED: 'IA analisou',
  AI_FALLBACK: 'Fallback IA',
  AI_MISSING_ITEM: 'Par ausente',
};

const analysisStatusColors: Record<
  ExamRiskRuleRiskToExamAiAnalysisStatus,
  'success' | 'warning' | 'error'
> = {
  AI_ANALYZED: 'success',
  AI_FALLBACK: 'error',
  AI_MISSING_ITEM: 'warning',
};

const candidateCompatibilityLabels: Record<
  ExamRiskRuleRiskToExamAiCandidateCompatibility,
  string
> = {
  DIRECT: 'Direta',
  POSSIBLE: 'Possível',
  LOW_RELEVANCE: 'Baixa',
  UNASSESSED: 'Sem foco',
};

const candidateCompatibilityColors: Record<
  ExamRiskRuleRiskToExamAiCandidateCompatibility,
  'success' | 'info' | 'warning' | 'default'
> = {
  DIRECT: 'success',
  POSSIBLE: 'info',
  LOW_RELEVANCE: 'warning',
  UNASSESSED: 'default',
};

const presetLabel = (preset: IExamRiskRuleRiskToExamAiPreset) => preset.name;

export const ExamRiskRuleRiskToExamAiAssistantDialog: FC<Props> = ({
  open,
  onClose,
  selectedRisks,
}) => {
  const [examSearch, setExamSearch] = useState('');
  const [examType, setExamType] = useState('');
  const [onlyESocial, setOnlyESocial] = useState(false);
  const [limit, setLimit] = useState(30);
  const [includeExistingRules, setIncludeExistingRules] = useState(true);
  const [includeIndirectCoverage, setIncludeIndirectCoverage] = useState(true);
  const [onlyWithoutExamCoverage, setOnlyWithoutExamCoverage] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [positiveExamples, setPositiveExamples] = useState('');
  const [negativeExamples, setNegativeExamples] = useState('');
  const [cautionRules, setCautionRules] = useState('');
  const [sessionInstruction, setSessionInstruction] = useState('');
  const [model, setModel] = useState('');
  const [presetSearch, setPresetSearch] = useState('');
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [selectedPreset, setSelectedPreset] =
    useState<IExamRiskRuleRiskToExamAiPreset | null>(null);
  const [presetMessage, setPresetMessage] = useState('');
  const [result, setResult] =
    useState<IExamRiskRuleRiskToExamAiSuggestionResponse | null>(null);

  const dryRunMutation = useMutateDryRunExamRiskRuleRiskToExamAiSuggestions();
  const createPresetMutation = useMutateCreateExamRiskRuleRiskToExamAiPreset();
  const updatePresetMutation = useMutateUpdateExamRiskRuleRiskToExamAiPreset();
  const deletePresetMutation = useMutateDeleteExamRiskRuleRiskToExamAiPreset();
  const {
    data: presets = [],
    isLoading: isLoadingPresets,
    refetch: refetchPresets,
  } = useFetchExamRiskRuleRiskToExamAiPresets(
    { search: presetSearch.trim() || undefined },
    open,
  );

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

  const presetOptions = useMemo(() => {
    const byId = new Map<string, IExamRiskRuleRiskToExamAiPreset>();
    presets.forEach((preset) => byId.set(preset.id, preset));
    if (selectedPreset) byId.set(selectedPreset.id, selectedPreset);
    return Array.from(byId.values());
  }, [presets, selectedPreset]);

  const buildPresetPayload =
    (): ICreateExamRiskRuleRiskToExamAiPresetPayload => ({
      name: presetName.trim(),
      description: presetDescription.trim() || null,
      config: {
        examFilters: {
          search: examSearch.trim() || null,
          examType: examType || null,
          onlyESocial,
          limit,
        },
        options: {
          includeExistingRules,
          includeIndirectCoverage,
          onlyWithoutExamCoverage,
        },
        aiConfig: {
          instructions: instructions.trim() || null,
          positiveExamples: positiveExamples.trim() || null,
          negativeExamples: negativeExamples.trim() || null,
          cautionRules: cautionRules.trim() || null,
          sessionInstruction: sessionInstruction.trim() || null,
          model: model.trim() || null,
        },
      },
    });

  const applyPreset = (preset: IExamRiskRuleRiskToExamAiPreset) => {
    const { config } = preset;
    setSelectedPreset(preset);
    setPresetName(preset.name);
    setPresetDescription(preset.description ?? '');
    setExamSearch(config.examFilters?.search ?? '');
    setExamType(config.examFilters?.examType ?? '');
    setOnlyESocial(config.examFilters?.onlyESocial ?? false);
    setLimit(config.examFilters?.limit ?? 30);
    setIncludeExistingRules(config.options?.includeExistingRules ?? true);
    setIncludeIndirectCoverage(config.options?.includeIndirectCoverage ?? true);
    setOnlyWithoutExamCoverage(
      config.options?.onlyWithoutExamCoverage ?? false,
    );
    setInstructions(config.aiConfig?.instructions ?? '');
    setPositiveExamples(config.aiConfig?.positiveExamples ?? '');
    setNegativeExamples(config.aiConfig?.negativeExamples ?? '');
    setCautionRules(config.aiConfig?.cautionRules ?? '');
    setSessionInstruction(config.aiConfig?.sessionInstruction ?? '');
    setModel(config.aiConfig?.model ?? '');
    setResult(null);
    setPresetMessage(
      'Modelo carregado. Os riscos selecionados não foram alterados e o resultado anterior foi limpo.',
    );
  };

  const handleSaveNewPreset = () => {
    if (!presetName.trim()) {
      setPresetMessage('Informe um nome para salvar o modelo.');
      return;
    }
    createPresetMutation.mutate(buildPresetPayload(), {
      onSuccess: (preset) => {
        setSelectedPreset(preset);
        setPresetMessage(
          'Modelo salvo. Ele não inclui riscos selecionados nem resultados.',
        );
      },
    });
  };

  const handleUpdatePreset = () => {
    if (!selectedPreset) return;
    if (!presetName.trim()) {
      setPresetMessage('Informe um nome para atualizar o modelo.');
      return;
    }
    updatePresetMutation.mutate(
      { presetId: selectedPreset.id, payload: buildPresetPayload() },
      {
        onSuccess: (preset) => {
          setSelectedPreset(preset);
          setPresetMessage(
            'Modelo atualizado sem alterar riscos selecionados.',
          );
        },
      },
    );
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;
    const presetId = selectedPreset.id;
    deletePresetMutation.mutate(
      { presetId },
      {
        onSuccess: () => {
          setSelectedPreset(null);
          setPresetMessage('Modelo excluído/inativado.');
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
          search: examSearch.trim() || undefined,
          examType: examType || undefined,
          onlyESocial,
          limit,
        },
        options: {
          includeExistingRules,
          includeIndirectCoverage,
          onlyWithoutExamCoverage,
        },
        aiConfig: {
          instructions: instructions.trim() || undefined,
          positiveExamples: positiveExamples.trim() || undefined,
          negativeExamples: negativeExamples.trim() || undefined,
          cautionRules: cautionRules.trim() || undefined,
          sessionInstruction: sessionInstruction.trim() || undefined,
          model: model.trim() || undefined,
        },
      },
      { onSuccess: setResult },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Assistente IA risco → exames</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Alert severity="warning">
            MVP dry-run: a IA apenas sugere exames. Nenhuma regra ou vínculo
            será criado.
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

          <Stack spacing={2}>
            <Typography variant="subtitle1">Modelos de pesquisa</Typography>
            <Alert severity="info">
              O modelo salva apenas filtros e instruções. Ele não salva os
              riscos selecionados nem resultados.
            </Alert>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <Autocomplete
                sx={{ minWidth: 360, flex: 1 }}
                options={presetOptions}
                value={selectedPreset}
                openOnFocus
                loading={isLoadingPresets}
                getOptionLabel={presetLabel}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterOptions={(options) => options}
                onOpen={() => {
                  setPresetSearch('');
                  void refetchPresets();
                }}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') setPresetSearch(value);
                  if (reason === 'clear') {
                    setPresetSearch('');
                    setSelectedPreset(null);
                  }
                }}
                onChange={(_, value) => {
                  if (value) {
                    applyPreset(value);
                  } else {
                    setSelectedPreset(null);
                    setPresetSearch('');
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Carregar modelo" />
                )}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedPreset(null);
                  setPresetSearch('');
                  setPresetMessage(
                    'Modelo carregado limpo. A configuração atual foi mantida.',
                  );
                }}
              >
                Limpar modelo
              </Button>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="Nome do modelo"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                sx={{ minWidth: 320, flex: 1 }}
              />
              <TextField
                label="Descrição do modelo"
                value={presetDescription}
                onChange={(event) => setPresetDescription(event.target.value)}
                sx={{ minWidth: 420, flex: 2 }}
              />
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              <Button
                variant="outlined"
                onClick={handleSaveNewPreset}
                disabled={createPresetMutation.isPending}
              >
                Salvar modelo
              </Button>
              <Button
                variant="outlined"
                onClick={handleUpdatePreset}
                disabled={!selectedPreset || updatePresetMutation.isPending}
              >
                Atualizar modelo
              </Button>
              <Button
                color="warning"
                variant="outlined"
                onClick={handleDeletePreset}
                disabled={!selectedPreset || deletePresetMutation.isPending}
              >
                Excluir
              </Button>
              {selectedPreset && (
                <Chip
                  variant="outlined"
                  label={`Carregado: ${selectedPreset.name}`}
                />
              )}
            </Box>

            {presetMessage && <Alert severity="info">{presetMessage}</Alert>}
          </Stack>

          <Stack spacing={2}>
            <Typography variant="subtitle1">Filtros de exames</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="Buscar exame"
                value={examSearch}
                onChange={(event) => setExamSearch(event.target.value)}
                size="small"
                sx={{ minWidth: 280, flex: 1 }}
              />
              <TextField
                select
                label="Tipo de exame"
                value={examType}
                onChange={(event) => setExamType(event.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
              >
                {examTypeOptions.map((option) => (
                  <MenuItem key={option.value || 'ALL'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Limite"
                type="number"
                value={limit}
                onChange={(event) =>
                  setLimit(
                    Math.min(60, Math.max(1, Number(event.target.value) || 1)),
                  )
                }
                size="small"
                sx={{ width: 110 }}
              />
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyESocial}
                    onChange={(event) => setOnlyESocial(event.target.checked)}
                  />
                }
                label="Somente exames com eSocial"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={includeExistingRules}
                    onChange={(event) =>
                      setIncludeExistingRules(event.target.checked)
                    }
                  />
                }
                label="Mostrar regras existentes"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={includeIndirectCoverage}
                    onChange={(event) =>
                      setIncludeIndirectCoverage(event.target.checked)
                    }
                  />
                }
                label="Considerar cobertura indireta"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyWithoutExamCoverage}
                    onChange={(event) =>
                      setOnlyWithoutExamCoverage(event.target.checked)
                    }
                  />
                }
                label="Somente pares sem cobertura"
              />
            </Box>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="subtitle1">Prompt e instruções</Typography>
            <TextField
              label="Instruções"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
              gap={2}
            >
              <TextField
                label="Exemplos positivos"
                value={positiveExamples}
                onChange={(event) => setPositiveExamples(event.target.value)}
                multiline
                minRows={2}
              />
              <TextField
                label="Exemplos negativos"
                value={negativeExamples}
                onChange={(event) => setNegativeExamples(event.target.value)}
                multiline
                minRows={2}
              />
              <TextField
                label="Cautelas"
                value={cautionRules}
                onChange={(event) => setCautionRules(event.target.value)}
                multiline
                minRows={2}
              />
              <TextField
                label="Instrução adicional da sessão"
                value={sessionInstruction}
                onChange={(event) => setSessionInstruction(event.target.value)}
                multiline
                minRows={2}
              />
            </Box>
            <TextField
              label="Modelo IA opcional"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              size="small"
              sx={{ maxWidth: 360 }}
            />
          </Stack>

          <Box>
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
          </Box>

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
                        <TableCell colSpan={9}>
                          Nenhuma sugestão retornada para os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map(({ riskFactorId, riskName, suggestion }) => (
                        <ResultRow
                          key={`${riskFactorId}-${suggestion.examId}`}
                          riskName={riskName}
                          suggestion={suggestion}
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
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

const ResultRow: FC<{
  riskName: string;
  suggestion: IExamRiskRuleRiskToExamAiSuggestion;
}> = ({ riskName, suggestion }) => {
  const analysisStatus = suggestion.analysisStatus ?? 'AI_ANALYZED';
  const candidateCompatibility =
    suggestion.candidateCompatibility ?? 'UNASSESSED';

  return (
    <TableRow>
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
          label={decisionLabels[suggestion.decision]}
          color={decisionColors[suggestion.decision]}
          variant={suggestion.decision === 'exclude' ? 'outlined' : 'filled'}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={analysisStatusLabels[analysisStatus]}
          color={analysisStatusColors[analysisStatus]}
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
          label={candidateCompatibilityLabels[candidateCompatibility]}
          color={candidateCompatibilityColors[candidateCompatibility]}
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
        {suggestion.existingRule ? (
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
