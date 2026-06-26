import { FC, useEffect, useMemo, useState } from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useFetchExamRiskRuleExamCandidates,
  useFetchExamRiskRuleRiskCandidates,
} from '@v2/services/medicine/exam-risk-rule/hooks/useFetchExamRiskRuleCandidates';
import {
  useMutateCreateExamRiskRule,
  useMutateUpdateExamRiskRule,
} from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import {
  ExamRiskRuleCategoryEnum,
  ExamRiskRuleScopeEnum,
  ExamRiskRuleSourceEnum,
  ExamRiskRuleStatusEnum,
  IExamRiskRule,
  IExamRiskRuleExamInput,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

import {
  examRiskRuleCategoryLabels,
  examRiskRuleScopeLabels,
  examRiskRuleSourceLabels,
  examRiskRuleStatusLabels,
} from '../exam-risk-rule-labels';

type Props = {
  open: boolean;
  rule: IExamRiskRule | null;
  onClose: () => void;
};

type ExamDraft = IExamRiskRuleExamInput & { _key: string };

const emptyExam = (): ExamDraft => ({
  _key: Math.random().toString(36).slice(2),
  examId: undefined,
  examNameSnapshot: undefined,
  isAdmission: false,
  isPeriodic: true,
  isChange: false,
  isReturn: false,
  isDismissal: false,
  isMale: true,
  isFemale: true,
  validityInMonths: null,
  considerBetweenDays: null,
  fromAge: null,
  toAge: null,
  minRiskDegree: null,
  minRiskDegreeQuantity: null,
});

const toNumberOrNull = (value: string): number | null => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const ExamRiskRuleFormModal: FC<Props> = ({ open, rule, onClose }) => {
  const isEdit = Boolean(rule);

  const [scope, setScope] = useState<ExamRiskRuleScopeEnum>(
    ExamRiskRuleScopeEnum.RISK,
  );
  const [source, setSource] = useState<ExamRiskRuleSourceEnum>(
    ExamRiskRuleSourceEnum.SIMPLE_SST,
  );
  const [status, setStatus] = useState<ExamRiskRuleStatusEnum>(
    ExamRiskRuleStatusEnum.DRAFT,
  );
  const [rationale, setRationale] = useState('');

  const [riskFactorId, setRiskFactorId] = useState<string | null>(null);
  const [riskName, setRiskName] = useState<string | null>(null);
  const [riskCategory, setRiskCategory] =
    useState<ExamRiskRuleCategoryEnum | null>(null);
  const [riskSubTypeId, setRiskSubTypeId] = useState<string>('');
  const [agentCas, setAgentCas] = useState('');
  const [agentName, setAgentName] = useState('');

  const [exams, setExams] = useState<ExamDraft[]>([]);

  const [riskSearch, setRiskSearch] = useState('');
  const [examSearch, setExamSearch] = useState('');

  const createMutation = useMutateCreateExamRiskRule();
  const updateMutation = useMutateUpdateExamRiskRule();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const { data: riskCandidates } = useFetchExamRiskRuleRiskCandidates(
    { search: riskSearch },
    open && scope === ExamRiskRuleScopeEnum.RISK,
  );
  const { data: examCandidates } = useFetchExamRiskRuleExamCandidates(
    { search: examSearch },
    open,
  );

  useEffect(() => {
    if (!open) return;
    if (rule) {
      setScope(rule.scope);
      setSource(rule.source);
      setStatus(rule.status);
      setRationale(rule.rationale ?? '');
      setRiskFactorId(rule.riskFactorId);
      setRiskName(rule.riskNameSnapshot);
      setRiskCategory(rule.riskCategory);
      setRiskSubTypeId(rule.riskSubTypeId ? String(rule.riskSubTypeId) : '');
      setAgentCas(rule.agentCas ?? '');
      setAgentName(rule.agentName ?? '');
      setExams(
        (rule.exams ?? []).map((exam) => ({
          ...exam,
          _key: exam.id,
          examId: exam.examId ?? undefined,
          examNameSnapshot: exam.examNameSnapshot ?? undefined,
        })),
      );
    } else {
      setScope(ExamRiskRuleScopeEnum.RISK);
      setSource(ExamRiskRuleSourceEnum.SIMPLE_SST);
      setStatus(ExamRiskRuleStatusEnum.DRAFT);
      setRationale('');
      setRiskFactorId(null);
      setRiskName(null);
      setRiskCategory(null);
      setRiskSubTypeId('');
      setAgentCas('');
      setAgentName('');
      setExams([]);
    }
  }, [open, rule]);

  const riskOptions = useMemo(() => {
    const options = (riskCandidates ?? []).map((risk) => ({
      id: risk.id,
      label: risk.cas ? `${risk.name} (${risk.cas})` : risk.name,
    }));
    if (riskFactorId && !options.some((option) => option.id === riskFactorId)) {
      options.unshift({ id: riskFactorId, label: riskName ?? riskFactorId });
    }
    return options;
  }, [riskCandidates, riskFactorId, riskName]);

  const updateExam = (key: string, patch: Partial<ExamDraft>) => {
    setExams((prev) =>
      prev.map((exam) => (exam._key === key ? { ...exam, ...patch } : exam)),
    );
  };

  const buildPayload = () => ({
    scope,
    source,
    status,
    rationale: rationale.trim() ? rationale.trim() : null,
    riskFactorId: scope === ExamRiskRuleScopeEnum.RISK ? riskFactorId : null,
    riskCategory: scope === ExamRiskRuleScopeEnum.CATEGORY ? riskCategory : null,
    riskSubTypeId:
      scope === ExamRiskRuleScopeEnum.GROUP
        ? toNumberOrNull(riskSubTypeId)
        : null,
    agentCas:
      scope === ExamRiskRuleScopeEnum.AGENT
        ? agentCas.trim() || null
        : null,
    agentName:
      scope === ExamRiskRuleScopeEnum.AGENT
        ? agentName.trim() || null
        : null,
    exams: exams.map(({ _key, ...rest }) => rest),
  });

  const handleSubmit = () => {
    const payload = buildPayload();
    if (isEdit && rule) {
      updateMutation.mutate(
        { id: rule.id, payload },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Editar regra Exame × Risco' : 'Nova regra Exame × Risco'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              select
              label="Escopo"
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as ExamRiskRuleScopeEnum)
              }
              sx={{ minWidth: 200 }}
            >
              {Object.values(ExamRiskRuleScopeEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {examRiskRuleScopeLabels[value]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Fonte"
              value={source}
              onChange={(event) =>
                setSource(event.target.value as ExamRiskRuleSourceEnum)
              }
              sx={{ minWidth: 180 }}
            >
              {Object.values(ExamRiskRuleSourceEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {examRiskRuleSourceLabels[value]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ExamRiskRuleStatusEnum)
              }
              sx={{ minWidth: 160 }}
            >
              {Object.values(ExamRiskRuleStatusEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {examRiskRuleStatusLabels[value]}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {scope === ExamRiskRuleScopeEnum.RISK && (
            <Autocomplete
              options={riskOptions}
              value={
                riskFactorId
                  ? riskOptions.find((option) => option.id === riskFactorId) ??
                    null
                  : null
              }
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, option) => {
                setRiskFactorId(option?.id ?? null);
                setRiskName(option?.label ?? null);
              }}
              onInputChange={(_, value) => setRiskSearch(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Risco (catálogo global SimpleSST)"
                />
              )}
            />
          )}

          {scope === ExamRiskRuleScopeEnum.CATEGORY && (
            <TextField
              select
              label="Categoria de risco"
              value={riskCategory ?? ''}
              onChange={(event) =>
                setRiskCategory(event.target.value as ExamRiskRuleCategoryEnum)
              }
              sx={{ maxWidth: 280 }}
            >
              {Object.values(ExamRiskRuleCategoryEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {examRiskRuleCategoryLabels[value]}
                </MenuItem>
              ))}
            </TextField>
          )}

          {scope === ExamRiskRuleScopeEnum.GROUP && (
            <TextField
              label="ID do grupo/subtipo (RiskSubType)"
              value={riskSubTypeId}
              onChange={(event) => setRiskSubTypeId(event.target.value)}
              type="number"
              sx={{ maxWidth: 280 }}
            />
          )}

          {scope === ExamRiskRuleScopeEnum.AGENT && (
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="CAS do agente"
                value={agentCas}
                onChange={(event) => setAgentCas(event.target.value)}
              />
              <TextField
                label="Nome do agente"
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                sx={{ minWidth: 240 }}
              />
            </Box>
          )}

          <TextField
            label="Justificativa técnica"
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            multiline
            minRows={2}
          />

          <Divider />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Exames sugeridos</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setExams((prev) => [...prev, emptyExam()])}
            >
              Adicionar exame
            </Button>
          </Box>

          {exams.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum exame sugerido adicionado.
            </Typography>
          )}

          {exams.map((exam) => {
            const examOptions = (examCandidates ?? []).map((candidate) => ({
              id: candidate.id,
              label: candidate.name,
            }));
            if (
              exam.examId &&
              !examOptions.some((option) => option.id === exam.examId)
            ) {
              examOptions.unshift({
                id: exam.examId,
                label: exam.examNameSnapshot ?? String(exam.examId),
              });
            }

            return (
              <Box
                key={exam._key}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Box display="flex" gap={1} alignItems="center" mb={1}>
                  <Autocomplete
                    sx={{ flex: 1 }}
                    options={examOptions}
                    value={
                      exam.examId
                        ? examOptions.find(
                            (option) => option.id === exam.examId,
                          ) ?? null
                        : null
                    }
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(_, option) =>
                      updateExam(exam._key, {
                        examId: option?.id,
                        examNameSnapshot: option?.label,
                      })
                    }
                    onInputChange={(_, value) => setExamSearch(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Exame (catálogo global)" />
                    )}
                  />
                  <IconButton
                    color="error"
                    onClick={() =>
                      setExams((prev) =>
                        prev.filter((item) => item._key !== exam._key),
                      )
                    }
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                  {(
                    [
                      ['isAdmission', 'Admissional'],
                      ['isPeriodic', 'Periódico'],
                      ['isChange', 'Mudança'],
                      ['isReturn', 'Retorno'],
                      ['isDismissal', 'Demissional'],
                    ] as const
                  ).map(([field, label]) => (
                    <FormControlLabel
                      key={field}
                      control={
                        <Checkbox
                          size="small"
                          checked={Boolean(exam[field])}
                          onChange={(event) =>
                            updateExam(exam._key, {
                              [field]: event.target.checked,
                            })
                          }
                        />
                      }
                      label={label}
                    />
                  ))}
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={Boolean(exam.isMale)}
                        onChange={(event) =>
                          updateExam(exam._key, { isMale: event.target.checked })
                        }
                      />
                    }
                    label="Masculino"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={Boolean(exam.isFemale)}
                        onChange={(event) =>
                          updateExam(exam._key, {
                            isFemale: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Feminino"
                  />
                  <TextField
                    label="Periodicidade (meses)"
                    type="number"
                    size="small"
                    value={exam.validityInMonths ?? ''}
                    onChange={(event) =>
                      updateExam(exam._key, {
                        validityInMonths: toNumberOrNull(event.target.value),
                      })
                    }
                    sx={{ width: 160 }}
                  />
                  <TextField
                    label="Considerar (dias)"
                    type="number"
                    size="small"
                    value={exam.considerBetweenDays ?? ''}
                    onChange={(event) =>
                      updateExam(exam._key, {
                        considerBetweenDays: toNumberOrNull(event.target.value),
                      })
                    }
                    sx={{ width: 150 }}
                  />
                  <TextField
                    label="Idade inicial"
                    type="number"
                    size="small"
                    value={exam.fromAge ?? ''}
                    onChange={(event) =>
                      updateExam(exam._key, {
                        fromAge: toNumberOrNull(event.target.value),
                      })
                    }
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Idade final"
                    type="number"
                    size="small"
                    value={exam.toAge ?? ''}
                    onChange={(event) =>
                      updateExam(exam._key, {
                        toAge: toNumberOrNull(event.target.value),
                      })
                    }
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Qualitativo mín."
                    type="number"
                    size="small"
                    value={exam.minRiskDegree ?? ''}
                    onChange={(event) =>
                      updateExam(exam._key, {
                        minRiskDegree: toNumberOrNull(event.target.value),
                      })
                    }
                    sx={{ width: 150 }}
                  />
                  <TextField
                    label="Quantitativo mín."
                    type="number"
                    size="small"
                    value={exam.minRiskDegreeQuantity ?? ''}
                    onChange={(event) =>
                      updateExam(exam._key, {
                        minRiskDegreeQuantity: toNumberOrNull(
                          event.target.value,
                        ),
                      })
                    }
                    sx={{ width: 160 }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
