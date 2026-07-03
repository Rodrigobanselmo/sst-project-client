import { FC, useEffect, useMemo, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Stack,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useFetchBrowseExamRiskRules } from '@v2/services/medicine/exam-risk-rule/hooks/useFetchBrowseExamRiskRules';
import { useFetchExamRiskRuleAiPresets } from '@v2/services/medicine/exam-risk-rule/hooks/useFetchExamRiskRuleAiPresets';
import { useFetchExamRiskRuleExamCandidates } from '@v2/services/medicine/exam-risk-rule/hooks/useFetchExamRiskRuleCandidates';
import {
  useMutateCreateExamRiskRuleAiDrafts,
  useMutateCreateExamRiskRuleAiPreset,
  useMutateDeleteExamRiskRuleAiPreset,
  useMutateDryRunExamRiskRuleAiSuggestions,
  useMutateUpdateExamRiskRuleAiPreset,
} from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import { getExamRiskRuleById } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.service';
import {
  ICreateExamRiskRuleAiPresetPayload,
  ICreateExamRiskRuleAiDraftsPayload,
  ExamRiskRuleAiDecision,
  ExamRiskRuleAiSuggestionMode,
  ExamRiskRuleCategoryEnum,
  ExamRiskRuleSourceEnum,
  ExamRiskRuleStatusEnum,
  IExamRiskRule,
  IExamRiskRuleAiPreset,
  IExamRiskRuleAiSuggestionRequest,
  ICreateExamRiskRuleAiDraftsResponse,
  IExamRiskRuleAiSuggestionResponse,
  IExamRiskRuleExamCandidate,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import { useFetchBrowseRiskSubTypesMaster } from '@v2/services/security/risk/sub-type/risk-sub-type-master/hooks/useFetchBrowseRiskSubTypesMaster';
import type { IRiskSubTypeMasterItem } from '@v2/services/security/risk/sub-type/risk-sub-type-master/risk-sub-type-master.types';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import {
  examRiskRuleCategoryLabels,
  examRiskRuleSourceLabels,
} from '../exam-risk-rule-labels';

type Props = {
  open: boolean;
  onClose: () => void;
};

const decisionLabels: Record<ExamRiskRuleAiDecision, string> = {
  include: 'Incluir',
  exclude: 'Excluir',
  ambiguous: 'Ambíguo',
};

const decisionColors: Record<
  ExamRiskRuleAiDecision,
  'success' | 'default' | 'warning'
> = {
  include: 'success',
  exclude: 'default',
  ambiguous: 'warning',
};

const ruleLabel = (rule: IExamRiskRule): string => {
  const risk =
    rule.riskFactorDisplayName ||
    rule.riskNameSnapshot ||
    rule.agentName ||
    rule.subTypeNameSnapshot ||
    rule.id;
  const exams = rule.exams
    .map((exam) => exam.examNameSnapshot)
    .filter(Boolean)
    .join(', ');
  return exams ? `${risk} -> ${exams}` : risk;
};

const examLabel = (exam: IExamRiskRuleExamCandidate): string =>
  exam.esocial27Code ? `${exam.name} (${exam.esocial27Code})` : exam.name;

const presetLabel = (preset: IExamRiskRuleAiPreset): string =>
  preset.examName ? `${preset.name} · ${preset.examName}` : preset.name;

export const ExamRiskRuleAiAssistantDialog: FC<Props> = ({ open, onClose }) => {
  const [presetSearch, setPresetSearch] = useState('');
  const [selectedPreset, setSelectedPreset] =
    useState<IExamRiskRuleAiPreset | null>(null);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presetMessage, setPresetMessage] = useState('');
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);

  const [mode, setMode] = useState<ExamRiskRuleAiSuggestionMode>(
    ExamRiskRuleAiSuggestionMode.FROM_RULE,
  );
  const [ruleSearch, setRuleSearch] = useState('');
  const [examSearch, setExamSearch] = useState('');
  const [selectedRule, setSelectedRule] = useState<IExamRiskRule | null>(null);
  const [selectedRuleExamId, setSelectedRuleExamId] = useState<number | ''>('');
  const [selectedExam, setSelectedExam] =
    useState<IExamRiskRuleExamCandidate | null>(null);
  const [manualExamName, setManualExamName] = useState('');
  const [technicalObjective, setTechnicalObjective] = useState('');
  const [applicationCriteria, setApplicationCriteria] = useState('');

  const [riskType, setRiskType] = useState<ExamRiskRuleCategoryEnum>(
    ExamRiskRuleCategoryEnum.QUI,
  );
  const [includedSubTypes, setIncludedSubTypes] = useState<IRiskSubTypeMasterItem[]>(
    [],
  );
  const [excludedSubTypes, setExcludedSubTypes] = useState<IRiskSubTypeMasterItem[]>(
    [],
  );
  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyPcmso, setOnlyPcmso] = useState(true);
  const [onlyWithoutRuleForExam, setOnlyWithoutRuleForExam] = useState(true);
  const [riskSearch, setRiskSearch] = useState('');
  const [limit, setLimit] = useState(30);

  const [instructions, setInstructions] = useState('');
  const [positiveExamples, setPositiveExamples] = useState('');
  const [negativeExamples, setNegativeExamples] = useState('');
  const [cautionRules, setCautionRules] = useState('');
  const [sessionInstruction, setSessionInstruction] = useState('');
  const [model, setModel] = useState('');
  const [rationalePrefix, setRationalePrefix] = useState('');
  const [copyExamConfig, setCopyExamConfig] = useState(true);

  const [result, setResult] = useState<IExamRiskRuleAiSuggestionResponse | null>(
    null,
  );
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [confirmAmbiguousOnly, setConfirmAmbiguousOnly] = useState(false);
  const [draftReport, setDraftReport] =
    useState<ICreateExamRiskRuleAiDraftsResponse | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  const {
    data: presets = [],
    isLoading: isLoadingPresets,
    refetch: refetchPresets,
  } =
    useFetchExamRiskRuleAiPresets(
      { search: presetSearch.trim() || undefined },
      open,
    );

  const { data: rulesData, isLoading: isLoadingRules } =
    useFetchBrowseExamRiskRules(
      { page: 1, limit: 20, search: ruleSearch.trim() || undefined },
      open && mode === ExamRiskRuleAiSuggestionMode.FROM_RULE,
    );

  const { data: examCandidates, isLoading: isLoadingExams } =
    useFetchExamRiskRuleExamCandidates(
      { search: examSearch.trim() || undefined },
      open && mode === ExamRiskRuleAiSuggestionMode.FROM_EXAM,
    );

  const { data: subTypesData } = useFetchBrowseRiskSubTypesMaster({
    page: 1,
    limit: 200,
    type: riskType as unknown as RiskTypeEnum,
    status: StatusEnum.ACTIVE,
  });

  const dryRunMutation = useMutateDryRunExamRiskRuleAiSuggestions();
  const createDraftsMutation = useMutateCreateExamRiskRuleAiDrafts();
  const createPresetMutation = useMutateCreateExamRiskRuleAiPreset();
  const updatePresetMutation = useMutateUpdateExamRiskRuleAiPreset();
  const deletePresetMutation = useMutateDeleteExamRiskRuleAiPreset();

  const modelRuleExams = selectedRule?.exams ?? [];
  const subTypeOptions = useMemo(
    () => subTypesData?.results ?? [],
    [subTypesData?.results],
  );
  const presetOptions = useMemo(() => {
    const byId = new Map<string, IExamRiskRuleAiPreset>();
    presets.forEach((preset) => byId.set(preset.id, preset));
    if (selectedPreset) byId.set(selectedPreset.id, selectedPreset);
    return Array.from(byId.values());
  }, [presets, selectedPreset]);

  useEffect(() => {
    if (!selectedRule) {
      setSelectedRuleExamId('');
      return;
    }

    const examIds = selectedRule.exams
      .map((exam) => exam.examId)
      .filter((examId): examId is number => examId != null);
    setSelectedRuleExamId((current) => {
      if (current && examIds.includes(Number(current))) return current;
      return examIds.length === 1 ? examIds[0] : '';
    });
  }, [selectedRule]);

  useEffect(() => {
    if (!open) {
      setValidationMessage('');
      setPresetMessage('');
      setResult(null);
    }
  }, [open]);

  useEffect(() => {
    if (!result) {
      setSelectedCandidateIds(new Set());
      setDraftReport(null);
      setDraftConfirmOpen(false);
      setConfirmAmbiguousOnly(false);
    }
  }, [result]);

  const resolveSubTypesByIds = (
    ids: number[],
    nextRiskType: ExamRiskRuleCategoryEnum,
  ): IRiskSubTypeMasterItem[] =>
    ids.map((id) => {
      const option = subTypeOptions.find((subType) => subType.id === id);
      return (
        option ?? {
          id,
          name: `Subtipo #${id}`,
          slug: String(id),
          type: nextRiskType as unknown as RiskTypeEnum,
          status: StatusEnum.ACTIVE,
          system: true,
        }
      );
    });

  const getCurrentExamName = (): string | null => {
    if (mode === ExamRiskRuleAiSuggestionMode.MANUAL) {
      return manualExamName.trim() || null;
    }
    if (mode === ExamRiskRuleAiSuggestionMode.FROM_EXAM) {
      return selectedExam?.name ?? null;
    }
    const selectedModelExam = modelRuleExams.find(
      (exam) => exam.examId === selectedRuleExamId,
    );
    return (
      selectedModelExam?.examNameSnapshot ??
      modelRuleExams[0]?.examNameSnapshot ??
      null
    );
  };

  const buildDryRunPayload = (): IExamRiskRuleAiSuggestionRequest => ({
    mode,
    modelRuleId:
      mode === ExamRiskRuleAiSuggestionMode.FROM_RULE
        ? selectedRule?.id
        : undefined,
    exam: {
      examId:
        mode === ExamRiskRuleAiSuggestionMode.FROM_RULE
          ? selectedRuleExamId || undefined
          : selectedExam?.id,
      examName:
        mode === ExamRiskRuleAiSuggestionMode.MANUAL
          ? manualExamName.trim()
          : selectedExam?.name,
      technicalObjective: technicalObjective.trim() || undefined,
      applicationCriteria: applicationCriteria.trim() || undefined,
    },
    filters: {
      riskType,
      includedSubTypeIds: includedSubTypes.map((subType) => subType.id),
      excludedSubTypeIds: excludedSubTypes.map((subType) => subType.id),
      onlyActive,
      onlyPcmso,
      onlyWithoutRuleForExam,
      search: riskSearch.trim() || undefined,
      limit,
    },
    suggestedRuleDefaults: {
      source: ExamRiskRuleSourceEnum.TECHNICAL,
      status: ExamRiskRuleStatusEnum.DRAFT,
      rationalePrefix: rationalePrefix.trim() || undefined,
      copyExamConfigFromModelRule: copyExamConfig,
    },
    aiConfig: {
      instructions: instructions.trim() || undefined,
      positiveExamples: positiveExamples.trim() || undefined,
      negativeExamples: negativeExamples.trim() || undefined,
      cautionRules: cautionRules.trim() || undefined,
      sessionInstruction: sessionInstruction.trim() || undefined,
      model: model.trim() || undefined,
    },
  });

  const buildPresetPayload = (): ICreateExamRiskRuleAiPresetPayload => {
    const payload = buildDryRunPayload();
    return {
      name: presetName.trim(),
      description: presetDescription.trim() || null,
      mode: payload.mode,
      modelRuleId: payload.modelRuleId ?? null,
      examId: payload.exam?.examId ?? null,
      examName: getCurrentExamName(),
      technicalObjective: payload.exam?.technicalObjective ?? null,
      applicationCriteria: payload.exam?.applicationCriteria ?? null,
      riskType: payload.filters?.riskType ?? null,
      riskSearch: payload.filters?.search ?? null,
      includedSubTypeIds: payload.filters?.includedSubTypeIds ?? [],
      excludedSubTypeIds: payload.filters?.excludedSubTypeIds ?? [],
      onlyActive: payload.filters?.onlyActive ?? true,
      onlyPcmso: payload.filters?.onlyPcmso ?? true,
      onlyWithoutRuleForExam: payload.filters?.onlyWithoutRuleForExam ?? false,
      copyExamConfigFromModelRule:
        payload.suggestedRuleDefaults?.copyExamConfigFromModelRule ?? false,
      limit: payload.filters?.limit ?? 30,
      suggestedSource:
        payload.suggestedRuleDefaults?.source ?? ExamRiskRuleSourceEnum.TECHNICAL,
      rationalePrefix: payload.suggestedRuleDefaults?.rationalePrefix ?? null,
      instructions: payload.aiConfig?.instructions ?? null,
      positiveExamples: payload.aiConfig?.positiveExamples ?? null,
      negativeExamples: payload.aiConfig?.negativeExamples ?? null,
      cautionRules: payload.aiConfig?.cautionRules ?? null,
      sessionInstruction: payload.aiConfig?.sessionInstruction ?? null,
      model: payload.aiConfig?.model ?? null,
    };
  };

  const applyPreset = async (preset: IExamRiskRuleAiPreset) => {
    setSelectedPreset(preset);
    setPresetName(preset.name);
    setPresetDescription(preset.description ?? '');
    setPresetMessage('');
    setValidationMessage('');
    setResult(null);
    setIsLoadingPreset(true);

    const nextMode = preset.mode;
    const nextRiskType = preset.riskType ?? ExamRiskRuleCategoryEnum.QUI;
    setMode(nextMode);
    setRiskType(nextRiskType);
    setManualExamName(nextMode === ExamRiskRuleAiSuggestionMode.MANUAL ? preset.examName ?? '' : '');
    setTechnicalObjective(preset.technicalObjective ?? '');
    setApplicationCriteria(preset.applicationCriteria ?? '');
    setRiskSearch(preset.riskSearch ?? '');
    setIncludedSubTypes(resolveSubTypesByIds(preset.includedSubTypeIds, nextRiskType));
    setExcludedSubTypes(resolveSubTypesByIds(preset.excludedSubTypeIds, nextRiskType));
    setOnlyActive(preset.onlyActive);
    setOnlyPcmso(preset.onlyPcmso);
    setOnlyWithoutRuleForExam(preset.onlyWithoutRuleForExam);
    setCopyExamConfig(preset.copyExamConfigFromModelRule);
    setLimit(preset.limit);
    setInstructions(preset.instructions ?? '');
    setPositiveExamples(preset.positiveExamples ?? '');
    setNegativeExamples(preset.negativeExamples ?? '');
    setCautionRules(preset.cautionRules ?? '');
    setSessionInstruction(preset.sessionInstruction ?? '');
    setModel(preset.model ?? '');
    setRationalePrefix(preset.rationalePrefix ?? '');

    if (nextMode === ExamRiskRuleAiSuggestionMode.FROM_EXAM) {
      setSelectedExam(
        preset.examId || preset.examName
          ? {
              id: preset.examId ?? 0,
              name: preset.examName ?? `Exame ${preset.examId}`,
              type: null,
              esocial27Code: null,
            }
          : null,
      );
    } else {
      setSelectedExam(null);
    }

    if (nextMode === ExamRiskRuleAiSuggestionMode.FROM_RULE && preset.modelRuleId) {
      try {
        const rule = await getExamRiskRuleById(preset.modelRuleId);
        setSelectedRule(rule);
        setSelectedRuleExamId(preset.examId ?? '');
      } catch {
        setSelectedRule(null);
        setSelectedRuleExamId(preset.examId ?? '');
        setValidationMessage(
          'Modelo carregado, mas a regra modelo não foi encontrada para preenchimento automático.',
        );
      } finally {
        setIsLoadingPreset(false);
      }
      return;
    }

    setSelectedRule(null);
    setSelectedRuleExamId(preset.examId ?? '');
    setIsLoadingPreset(false);
  };

  const handleSaveNewPreset = () => {
    const payload = buildPresetPayload();
    if (!payload.name) {
      setPresetMessage('Informe um nome para salvar o modelo.');
      return;
    }
    createPresetMutation.mutate(payload, {
      onSuccess: (preset) => {
        setSelectedPreset(preset);
        setPresetSearch('');
        setPresetMessage('Modelo salvo e carregado.');
        void refetchPresets();
      },
    });
  };

  const handleUpdatePreset = () => {
    if (!selectedPreset) {
      setPresetMessage('Carregue um modelo antes de atualizar.');
      return;
    }
    const payload = buildPresetPayload();
    if (!payload.name) {
      setPresetMessage('Informe um nome para atualizar o modelo.');
      return;
    }
    updatePresetMutation.mutate(
      { presetId: selectedPreset.id, payload },
      {
        onSuccess: (preset) => {
          setSelectedPreset(preset);
          setPresetSearch('');
          setPresetMessage('Modelo atualizado.');
          void refetchPresets();
        },
      },
    );
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;
    deletePresetMutation.mutate(
      { presetId: selectedPreset.id },
      {
        onSuccess: () => {
          setSelectedPreset(null);
          setPresetSearch('');
          setPresetMessage('Modelo inativado.');
          void refetchPresets();
        },
      },
    );
  };

  const conflictingSubTypes = useMemo(() => {
    const excludedIds = new Set(excludedSubTypes.map((subType) => subType.id));
    return includedSubTypes.filter((subType) => excludedIds.has(subType.id));
  }, [excludedSubTypes, includedSubTypes]);

  const selectedCandidates = useMemo(
    () =>
      result?.candidates.filter((candidate) =>
        selectedCandidateIds.has(candidate.riskFactorId),
      ) ?? [],
    [result?.candidates, selectedCandidateIds],
  );

  const selectedCounts = useMemo(
    () => ({
      total: selectedCandidates.length,
      include: selectedCandidates.filter(
        (candidate) => candidate.decision === 'include',
      ).length,
      ambiguous: selectedCandidates.filter(
        (candidate) => candidate.decision === 'ambiguous',
      ).length,
    }),
    [selectedCandidates],
  );

  const hasOnlyAmbiguousSelected =
    selectedCounts.total > 0 &&
    selectedCounts.ambiguous === selectedCounts.total;

  const validate = (): boolean => {
    if (mode === ExamRiskRuleAiSuggestionMode.FROM_RULE && !selectedRule) {
      setValidationMessage('Selecione uma regra modelo.');
      return false;
    }

    if (
      mode === ExamRiskRuleAiSuggestionMode.FROM_RULE &&
      modelRuleExams.length > 1 &&
      !selectedRuleExamId
    ) {
      setValidationMessage('Selecione um exame da regra modelo.');
      return false;
    }

    if (mode === ExamRiskRuleAiSuggestionMode.FROM_EXAM && !selectedExam) {
      setValidationMessage('Selecione um exame.');
      return false;
    }

    if (
      mode === ExamRiskRuleAiSuggestionMode.MANUAL &&
      !manualExamName.trim()
    ) {
      setValidationMessage('Informe o nome do exame no modo manual.');
      return false;
    }

    setValidationMessage('');
    return true;
  };

  const handleRunDryRun = () => {
    if (!validate()) return;

    setResult(null);
    dryRunMutation.mutate(
      buildDryRunPayload(),
      {
        onSuccess: (response) => {
          setResult(response);
          setDraftReport(null);
          setSelectedCandidateIds(
            new Set(
              response.candidates
                .filter((candidate) => candidate.decision === 'include')
                .map((candidate) => candidate.riskFactorId),
            ),
          );
        },
      },
    );
  };

  const handleCopyResult = () => {
    if (!result) return;
    void navigator.clipboard?.writeText(JSON.stringify(result, null, 2));
  };

  const handleSelectIncludes = () => {
    if (!result) return;
    setSelectedCandidateIds(
      new Set(
        result.candidates
          .filter((candidate) => candidate.decision === 'include')
          .map((candidate) => candidate.riskFactorId),
      ),
    );
  };

  const handleClearSelection = () => {
    setSelectedCandidateIds(new Set());
  };

  const handleToggleCandidate = (
    candidate: IExamRiskRuleAiSuggestionResponse['candidates'][number],
    checked: boolean,
  ) => {
    if (candidate.decision === 'exclude') return;
    setSelectedCandidateIds((current) => {
      const next = new Set(current);
      if (checked) next.add(candidate.riskFactorId);
      else next.delete(candidate.riskFactorId);
      return next;
    });
  };

  const handleOpenDraftConfirmation = () => {
    if (!result) return;
    if (!result.sourceContext.examId) {
      setValidationMessage(
        'Para criar rascunhos, selecione um exame com examId no catálogo.',
      );
      return;
    }
    if (!selectedCounts.total) return;
    setConfirmAmbiguousOnly(false);
    setDraftConfirmOpen(true);
  };

  const buildDraftCreationPayload =
    (): ICreateExamRiskRuleAiDraftsPayload | null => {
      if (!result?.sourceContext.examId) return null;

      return {
        sourceContext: {
          ...result.sourceContext,
          examId: result.sourceContext.examId,
          onlyPcmso,
        },
        selectedCandidates: selectedCandidates.map((candidate) => ({
          riskFactorId: candidate.riskFactorId,
          riskName: candidate.riskName,
          decision: candidate.decision,
          confidence: candidate.confidence,
          rationale: candidate.rationale,
          suggestedSource: candidate.suggestedSource,
          sourceRationale: candidate.sourceRationale,
          copiedFromModelRule: candidate.wouldCreate?.copiedFromModelRule,
          examConfig: candidate.wouldCreate?.examConfig,
        })),
        options: {
          allowAmbiguous: selectedCounts.ambiguous > 0,
          rationalePrefix: rationalePrefix.trim() || undefined,
          copyExamConfigFromModelRule: copyExamConfig,
        },
      };
    };

  const handleCreateSelectedDrafts = () => {
    const payload = buildDraftCreationPayload();
    if (!payload) return;

    createDraftsMutation.mutate(payload, {
      onSuccess: (response) => {
        setDraftReport(response);
        setDraftConfirmOpen(false);
      },
    });
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Assistente de padrões Risco × Exame</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Alert severity="info">
            A IA apenas sugere pertinência técnica. O MASTER pode revisar e criar
            rascunhos selecionados; nenhuma regra ACTIVE é criada automaticamente.
          </Alert>

          <Stack spacing={2}>
            <Typography variant="subtitle1">Modelo salvo</Typography>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <Autocomplete
                sx={{ minWidth: 360, flex: 1 }}
                options={presetOptions}
                value={selectedPreset}
                openOnFocus
                loading={isLoadingPresets || isLoadingPreset}
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
                    void applyPreset(value);
                  } else {
                    setSelectedPreset(null);
                    setPresetSearch('');
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Carregar modelo salvo" />
                )}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedPreset(null);
                  setPresetSearch('');
                  setPresetMessage('Modelo carregado limpo. A configuração atual foi mantida.');
                }}
              >
                Limpar modelo carregado
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
                Salvar como novo modelo
              </Button>
              <Button
                variant="outlined"
                onClick={handleUpdatePreset}
                disabled={!selectedPreset || updatePresetMutation.isPending}
              >
                Atualizar modelo carregado
              </Button>
              <Button
                color="warning"
                variant="outlined"
                onClick={handleDeletePreset}
                disabled={!selectedPreset || deletePresetMutation.isPending}
              >
                Inativar modelo
              </Button>
              {selectedPreset && (
                <Chip
                  variant="outlined"
                  label={`Carregado: ${selectedPreset.name}`}
                />
              )}
            </Box>

            {presetMessage && <Alert severity="info">{presetMessage}</Alert>}

            {conflictingSubTypes.length > 0 && (
              <Alert severity="warning">
                Há subtipo em candidatos e excluídos:{' '}
                {conflictingSubTypes.map((subType) => subType.name).join(', ')}.
                A exclusão continua vencendo no dry-run.
              </Alert>
            )}
          </Stack>

          <Divider />

          {validationMessage && <Alert severity="warning">{validationMessage}</Alert>}

          <Stack spacing={2}>
            <Typography variant="subtitle1">1. Origem do padrão</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                select
                label="Modo"
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value as ExamRiskRuleAiSuggestionMode);
                  setResult(null);
                }}
                sx={{ minWidth: 240 }}
              >
                <MenuItem value={ExamRiskRuleAiSuggestionMode.FROM_RULE}>
                  Regra modelo existente
                </MenuItem>
                <MenuItem value={ExamRiskRuleAiSuggestionMode.FROM_EXAM}>
                  Exame específico
                </MenuItem>
                <MenuItem value={ExamRiskRuleAiSuggestionMode.MANUAL}>
                  Configuração manual
                </MenuItem>
              </TextField>

              {mode === ExamRiskRuleAiSuggestionMode.FROM_RULE && (
                <Autocomplete
                  sx={{ minWidth: 420, flex: 1 }}
                  options={rulesData?.data ?? []}
                  value={selectedRule}
                  loading={isLoadingRules}
                  getOptionLabel={ruleLabel}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onInputChange={(_, value) => setRuleSearch(value)}
                  onChange={(_, value) => setSelectedRule(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Regra modelo" />
                  )}
                />
              )}

              {mode === ExamRiskRuleAiSuggestionMode.FROM_EXAM && (
                <Autocomplete
                  sx={{ minWidth: 420, flex: 1 }}
                  options={examCandidates ?? []}
                  value={selectedExam}
                  loading={isLoadingExams}
                  getOptionLabel={examLabel}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onInputChange={(_, value) => setExamSearch(value)}
                  onChange={(_, value) => setSelectedExam(value)}
                  renderInput={(params) => <TextField {...params} label="Exame" />}
                />
              )}

              {mode === ExamRiskRuleAiSuggestionMode.MANUAL && (
                <TextField
                  label="Nome do exame"
                  value={manualExamName}
                  onChange={(event) => setManualExamName(event.target.value)}
                  sx={{ minWidth: 420, flex: 1 }}
                />
              )}
            </Box>

            {mode === ExamRiskRuleAiSuggestionMode.FROM_RULE &&
              modelRuleExams.length > 1 && (
                <TextField
                  select
                  label="Exame da regra modelo"
                  value={selectedRuleExamId}
                  onChange={(event) =>
                    setSelectedRuleExamId(Number(event.target.value))
                  }
                  sx={{ maxWidth: 520 }}
                >
                  {modelRuleExams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.examId ?? ''}>
                      {exam.examNameSnapshot || `Exame ${exam.examId}`}
                    </MenuItem>
                  ))}
                </TextField>
              )}

            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="Objetivo técnico do exame"
                value={technicalObjective}
                onChange={(event) => setTechnicalObjective(event.target.value)}
                sx={{ minWidth: 320, flex: 1 }}
              />
              <TextField
                label="Critério de aplicação"
                value={applicationCriteria}
                onChange={(event) => setApplicationCriteria(event.target.value)}
                sx={{ minWidth: 320, flex: 1 }}
              />
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1">2. Filtros de candidatos</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                select
                label="Tipo de risco"
                value={riskType}
                onChange={(event) =>
                  setRiskType(event.target.value as ExamRiskRuleCategoryEnum)
                }
                sx={{ minWidth: 180 }}
              >
                {Object.values(ExamRiskRuleCategoryEnum).map((value) => (
                  <MenuItem key={value} value={value}>
                    {examRiskRuleCategoryLabels[value]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Buscar risco"
                value={riskSearch}
                onChange={(event) => setRiskSearch(event.target.value)}
                sx={{ minWidth: 260 }}
              />
              <TextField
                label="Limite"
                type="number"
                value={limit}
                onChange={(event) =>
                  setLimit(Math.max(1, Math.min(80, Number(event.target.value))))
                }
                sx={{ width: 120 }}
              />
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Autocomplete
                multiple
                sx={{ minWidth: 360, flex: 1 }}
                options={subTypeOptions}
                value={includedSubTypes}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, value) => setIncludedSubTypes(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Subtipos candidatos" />
                )}
              />
              <Autocomplete
                multiple
                sx={{ minWidth: 360, flex: 1 }}
                options={subTypeOptions}
                value={excludedSubTypes}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, value) => setExcludedSubTypes(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Subtipos excluídos" />
                )}
              />
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onlyActive}
                    onChange={(event) => setOnlyActive(event.target.checked)}
                  />
                }
                label="Somente ACTIVE"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onlyPcmso}
                    onChange={(event) => setOnlyPcmso(event.target.checked)}
                  />
                }
                label="Somente PCMSO"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onlyWithoutRuleForExam}
                    onChange={(event) =>
                      setOnlyWithoutRuleForExam(event.target.checked)
                    }
                  />
                }
                label="Somente sem regra para este exame"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={copyExamConfig}
                    onChange={(event) => setCopyExamConfig(event.target.checked)}
                  />
                }
                label="Copiar campos do exame da regra modelo"
              />
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1">3. Prompt da sessão</Typography>
            <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={2}>
              <TextField
                label="Instruções"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                multiline
                minRows={3}
              />
              <TextField
                label="Cautelas"
                value={cautionRules}
                onChange={(event) => setCautionRules(event.target.value)}
                multiline
                minRows={3}
              />
              <TextField
                label="Exemplos positivos"
                value={positiveExamples}
                onChange={(event) => setPositiveExamples(event.target.value)}
                multiline
                minRows={3}
              />
              <TextField
                label="Exemplos negativos"
                value={negativeExamples}
                onChange={(event) => setNegativeExamples(event.target.value)}
                multiline
                minRows={3}
              />
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="Instrução adicional da sessão"
                value={sessionInstruction}
                onChange={(event) => setSessionInstruction(event.target.value)}
                sx={{ minWidth: 420, flex: 1 }}
              />
              <TextField
                label="Modelo IA opcional"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="ex.: gpt-4o-mini"
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Prefixo do racional"
                value={rationalePrefix}
                onChange={(event) => setRationalePrefix(event.target.value)}
                sx={{ minWidth: 260 }}
              />
            </Box>
          </Stack>

          {dryRunMutation.isPending && <LinearProgress />}

          {result && (
            <Stack spacing={2}>
              <Divider />
              <Box display="flex" justifyContent="space-between" gap={2}>
                <Box>
                  <Typography variant="subtitle1">Resultado dry-run</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.sourceContext.examName} · analisados{' '}
                    {result.totals.analyzed} de {result.totals.candidatesLoaded}{' '}
                    candidatos
                  </Typography>
                </Box>
                <Button variant="outlined" onClick={handleCopyResult}>
                  Copiar JSON
                </Button>
              </Box>

              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip color="success" label={`Incluir: ${result.totals.include}`} />
                <Chip label={`Excluir: ${result.totals.exclude}`} />
                <Chip
                  color="warning"
                  label={`Ambíguos: ${result.totals.ambiguous}`}
                />
                <Chip
                  variant="outlined"
                  label={`Pulados por regra existente: ${result.totals.skippedByExistingRule}`}
                />
              </Box>

              <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                <Chip
                  color={selectedCounts.total > 0 ? 'primary' : 'default'}
                  label={`Selecionados: ${selectedCounts.total}`}
                />
                <Chip color="success" label={`Includes: ${selectedCounts.include}`} />
                <Chip
                  color="warning"
                  label={`Ambíguos: ${selectedCounts.ambiguous}`}
                />
                <Button variant="outlined" onClick={handleSelectIncludes}>
                  Selecionar includes
                </Button>
                <Button variant="outlined" onClick={handleClearSelection}>
                  Limpar seleção
                </Button>
                <Button
                  variant="contained"
                  onClick={handleOpenDraftConfirmation}
                  disabled={
                    selectedCounts.total === 0 || createDraftsMutation.isPending
                  }
                >
                  Criar rascunhos selecionados
                </Button>
              </Box>

              {selectedCounts.ambiguous > 0 && (
                <Alert severity="warning">
                  Você selecionou itens ambíguos. Eles serão criados como DRAFT
                  para revisão manual.
                </Alert>
              )}

              {draftReport && (
                <Alert severity={draftReport.totals.failed ? 'warning' : 'success'}>
                  <Box>
                    Relatório: {draftReport.totals.created} criados,{' '}
                    {draftReport.totals.skippedByExistingRule} ignorados por regra
                    existente, {draftReport.totals.skippedByDecision} ignorados por
                    decisão não permitida, {draftReport.totals.failed} falhas,{' '}
                    {draftReport.totals.totalSelected} selecionados.
                  </Box>
                  {draftReport.created.length > 0 && (
                    <Box>
                      Criados:{' '}
                      {draftReport.created
                        .map((item) => `${item.riskName} (${item.status})`)
                        .join('; ')}
                    </Box>
                  )}
                  {draftReport.skippedExistingRule.length > 0 && (
                    <Box>
                      Ignorados por regra existente:{' '}
                      {draftReport.skippedExistingRule
                        .map((item) => `${item.riskName}: ${item.reason}`)
                        .join('; ')}
                    </Box>
                  )}
                  {draftReport.failed.length > 0 && (
                    <Box>
                      Falhas:{' '}
                      {draftReport.failed
                        .map((item) => `${item.riskName}: ${item.reason}`)
                        .join('; ')}
                    </Box>
                  )}
                </Alert>
              )}

              {result.warnings.length > 0 && (
                <Alert severity="warning">
                  {result.warnings.map((warning) => (
                    <Box key={warning}>{warning}</Box>
                  ))}
                </Alert>
              )}

              <TableContainer sx={{ maxHeight: 520 }}>
                <MuiTable size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Selecionar</TableCell>
                      <TableCell>Risco</TableCell>
                      <TableCell>Subtipo</TableCell>
                      <TableCell>Decisão</TableCell>
                      <TableCell>Conf.</TableCell>
                      <TableCell>Fonte</TableCell>
                      <TableCell>Regra existente</TableCell>
                      <TableCell>Justificativa</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.candidates.map((candidate) => (
                      <TableRow key={candidate.riskFactorId} hover>
                        <TableCell>
                          <Checkbox
                            checked={selectedCandidateIds.has(candidate.riskFactorId)}
                            disabled={
                              candidate.decision === 'exclude' ||
                              createDraftsMutation.isPending
                            }
                            onChange={(event) =>
                              handleToggleCandidate(candidate, event.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 220 }}>
                          <Typography variant="body2">{candidate.riskName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {candidate.cas || 'Sem CAS'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          {candidate.subTypes.map((subType) => subType.name).join(', ') ||
                            '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={decisionColors[candidate.decision]}
                            label={decisionLabels[candidate.decision]}
                          />
                        </TableCell>
                        <TableCell>{Math.round(candidate.confidence * 100)}%</TableCell>
                        <TableCell>
                          {examRiskRuleSourceLabels[candidate.suggestedSource]}
                        </TableCell>
                        <TableCell>
                          {candidate.existingRule
                            ? `${candidate.existingRule.scope} · ${candidate.existingRule.status}`
                            : '—'}
                        </TableCell>
                        <TableCell sx={{ minWidth: 360 }}>
                          <Typography variant="body2">{candidate.rationale}</Typography>
                          {candidate.cautions.length > 0 && (
                            <Typography variant="caption" color="warning.main">
                              Cautelas: {candidate.cautions.join('; ')}
                            </Typography>
                          )}
                          {candidate.wouldCreate && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                            >
                              Simulação: criaria rascunho DRAFT, sem ACTIVE.
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </MuiTable>
              </TableContainer>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Prompt enviado para auditoria</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontSize: 12,
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      maxHeight: 360,
                      overflow: 'auto',
                    }}
                  >
                    {result.promptPreview}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button
          variant="contained"
          onClick={handleRunDryRun}
          disabled={dryRunMutation.isPending}
        >
          Rodar dry-run
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog
      open={draftConfirmOpen}
      onClose={() => setDraftConfirmOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Criar rascunhos selecionados</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Nenhuma regra ACTIVE será criada. Regras existentes serão ignoradas e
            todos os itens criados ficarão como DRAFT para revisão manual.
          </Alert>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip label={`Selecionados: ${selectedCounts.total}`} />
            <Chip color="success" label={`Includes: ${selectedCounts.include}`} />
            <Chip
              color="warning"
              label={`Ambíguos: ${selectedCounts.ambiguous}`}
            />
          </Box>
          {selectedCounts.ambiguous > 0 && (
            <Alert severity="warning">
              Você selecionou itens ambíguos. Eles serão criados como DRAFT para
              revisão manual.
            </Alert>
          )}
          {hasOnlyAmbiguousSelected && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmAmbiguousOnly}
                  onChange={(event) =>
                    setConfirmAmbiguousOnly(event.target.checked)
                  }
                />
              }
              label="Confirmo criar apenas itens ambíguos como DRAFT para revisão manual"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDraftConfirmOpen(false)}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleCreateSelectedDrafts}
          disabled={
            createDraftsMutation.isPending ||
            selectedCounts.total === 0 ||
            (hasOnlyAmbiguousSelected && !confirmAmbiguousOnly)
          }
        >
          Criar rascunhos selecionados
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

