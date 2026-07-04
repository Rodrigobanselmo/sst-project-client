import { FC, useMemo, useState } from 'react';

import {
  Alert,
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
import { useMutateDryRunExamRiskRuleRiskToExamAiSuggestions } from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import type { IExamRiskRuleCoverageGapItem } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule-coverage-gaps.types';
import type {
  ExamRiskRuleRiskToExamAiDecision,
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
  const [result, setResult] =
    useState<IExamRiskRuleRiskToExamAiSuggestionResponse | null>(null);

  const dryRunMutation = useMutateDryRunExamRiskRuleRiskToExamAiSuggestions();

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
            MVP dry-run: a IA apenas sugere exames. Nenhuma regra ou vínculo será
            criado.
          </Alert>

          {selectedRisks.length === 0 ? (
            <Alert severity="info">Selecione ao menos um risco na tabela.</Alert>
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
                  setLimit(Math.min(60, Math.max(1, Number(event.target.value) || 1)))
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
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
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
              disabled={selectedRiskIds.length === 0 || dryRunMutation.isPending}
            >
              {dryRunMutation.isPending ? 'Rodando dry-run...' : 'Rodar dry-run'}
            </Button>
          </Box>

          {result && (
            <Stack spacing={2}>
              <Alert severity="info">
                Dry-run concluído: {result.totals.risksLoaded} risco(s),{' '}
                {result.totals.examsLoaded} exame(s), {result.totals.analyzedPairs}{' '}
                par(es) analisados. Sugestões: {result.totals.suggest};
                ambíguos: {result.totals.ambiguous}; excluídos:{' '}
                {result.totals.exclude}.
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
                      <TableCell>Confiança</TableCell>
                      <TableCell>Fonte</TableCell>
                      <TableCell>Regra existente</TableCell>
                      <TableCell>Justificativa</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
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
}> = ({ riskName, suggestion }) => (
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
        <Typography key={caution} variant="caption" color="warning.main" display="block">
          {caution}
        </Typography>
      ))}
    </TableCell>
  </TableRow>
);
