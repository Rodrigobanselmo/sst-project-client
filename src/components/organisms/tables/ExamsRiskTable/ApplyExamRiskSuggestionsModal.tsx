import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';

import { useApplyExamRiskSuggestions } from '@v2/services/medicine/company-exam-risk-suggestions/hooks/useApplyExamRiskSuggestions';
import {
  ApplyExamRiskSuggestionItemStatusEnum,
  type IApplyExamRiskSuggestionItem,
  type IApplyExamRiskSuggestionsResponse,
  type IResolvedExamRiskConfig,
} from '@v2/services/medicine/company-exam-risk-suggestions/company-exam-risk-suggestions.types';
import type { IExamRiskLinkMissingExam } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';

import { getExamAge, getExamPeriodic } from './exam-risk-display.util';

type Step = 'select' | 'preview' | 'result';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId?: string;
  riskId: string;
  riskName: string;
  missingExams: IExamRiskLinkMissingExam[];
  onClose: () => void;
  onSuccess: () => void;
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

const getItemStatusLabel = (
  status: ApplyExamRiskSuggestionItemStatusEnum,
  dryRun: boolean,
) => {
  switch (status) {
    case ApplyExamRiskSuggestionItemStatusEnum.CREATED:
      return dryRun ? 'Pronto para criar' : 'Criado';
    case ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_ALREADY_LINKED:
      return 'Já vinculado';
    case ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NOT_RECOMMENDED:
      return 'Não recomendado';
    case ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NOT_CHARACTERIZED:
      return 'Risco não caracterizado';
    case ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NO_LIBRARY_REFERENCE:
      return 'Sem referência na biblioteca';
    case ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NOT_SELECTED:
      return 'Não selecionado';
    case ApplyExamRiskSuggestionItemStatusEnum.ERROR:
      return 'Erro';
    default:
      return status;
  }
};

const PreviewTable: FC<{ items: IApplyExamRiskSuggestionItem[]; dryRun: boolean }> = ({
  items,
  dryRun,
}) => (
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
          <TableCell>
            {item.proposedConfig.validityInMonths ?? '-'}
          </TableCell>
          <TableCell>
            {item.proposedConfig.considerBetweenDays ?? '-'}
          </TableCell>
          <TableCell>
            {getRiskDegreeLabel(item.proposedConfig.minRiskDegree)}
          </TableCell>
          <TableCell>
            {getRiskDegreeLabel(item.proposedConfig.minRiskDegreeQuantity)}
          </TableCell>
          <TableCell>
            {getConfigSourceLabel(item.proposedConfig.configSource)}
          </TableCell>
          <TableCell>{getItemStatusLabel(item.status, dryRun)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const ApplyExamRiskSuggestionsModal: FC<Props> = ({
  open,
  companyId,
  workspaceId,
  riskId,
  riskName,
  missingExams,
  onClose,
  onSuccess,
}) => {
  const applyMutation = useApplyExamRiskSuggestions();
  const [step, setStep] = useState<Step>('select');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [previewData, setPreviewData] =
    useState<IApplyExamRiskSuggestionsResponse | null>(null);
  const [resultData, setResultData] =
    useState<IApplyExamRiskSuggestionsResponse | null>(null);

  const allExamIds = useMemo(
    () => missingExams.map((exam) => exam.examId),
    [missingExams],
  );

  useEffect(() => {
    if (!open) return;
    setStep('select');
    setSelectedExamIds(allExamIds);
    setPreviewData(null);
    setResultData(null);
    applyMutation.reset();
  }, [open, allExamIds]);

  const onToggleExam = (examId: number) => {
    setSelectedExamIds((current) =>
      current.includes(examId)
        ? current.filter((id) => id !== examId)
        : [...current, examId],
    );
  };

  const onToggleAll = (checked: boolean) => {
    setSelectedExamIds(checked ? allExamIds : []);
  };

  const onPreview = async () => {
    if (!selectedExamIds.length) return;
    const response = await applyMutation.mutateAsync({
      companyId,
      riskId,
      examIds: selectedExamIds,
      workspaceId,
      dryRun: true,
    });
    setPreviewData(response);
    setStep('preview');
  };

  const onConfirm = async () => {
    if (!selectedExamIds.length) return;
    const response = await applyMutation.mutateAsync({
      companyId,
      riskId,
      examIds: selectedExamIds,
      workspaceId,
      dryRun: false,
    });
    setResultData(response);
    setStep('result');
    if (response.summary.created > 0) {
      onSuccess();
    }
  };

  const previewItems = useMemo(() => {
    if (!previewData) return [];
    return previewData.items.filter(
      (item) => item.status !== ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NOT_SELECTED,
    );
  }, [previewData]);

  const resultItems = resultData?.items ?? [];
  const isLoading = applyMutation.isLoading;
  const allSelected =
    selectedExamIds.length === allExamIds.length && allExamIds.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {step === 'select' && 'Exames recomendados ausentes'}
        {step === 'preview' && 'Pré-visualização dos vínculos'}
        {step === 'result' && 'Resultado da criação'}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Risco: <strong>{riskName}</strong>
        </Typography>

        {step === 'select' && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selecione os exames recomendados que deseja vincular a este risco.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={
                    selectedExamIds.length > 0 && !allSelected
                  }
                  onChange={(event) => onToggleAll(event.target.checked)}
                />
              }
              label="Selecionar todos"
            />
            <Divider sx={{ my: 1 }} />
            {missingExams.map((exam) => (
              <FormControlLabel
                key={exam.examId}
                control={
                  <Checkbox
                    checked={selectedExamIds.includes(exam.examId)}
                    onChange={() => onToggleExam(exam.examId)}
                  />
                }
                label={exam.examName}
              />
            ))}
          </Box>
        )}

        {step === 'preview' && previewData && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Serão criados vínculos novos. Nenhum vínculo existente será
              alterado.
            </Alert>
            {previewData.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {previewData.warnings.join(' ')}
              </Alert>
            )}
            <PreviewTable items={previewItems} dryRun />
          </Box>
        )}

        {step === 'result' && resultData && (
          <Box>
            <Alert
              severity={resultData.summary.errors > 0 ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            >
              {resultData.summary.created} criado(s), {resultData.summary.skipped}{' '}
              ignorado(s), {resultData.summary.errors} erro(s).
            </Alert>
            {resultData.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {resultData.warnings.join(' ')}
              </Alert>
            )}
            <PreviewTable items={resultItems} dryRun={false} />
          </Box>
        )}

        {applyMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Não foi possível processar a solicitação. Tente novamente.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {step === 'select' && (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!selectedExamIds.length || isLoading}
              onClick={onPreview}
            >
              Próximo
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
              disabled={isLoading}
              onClick={onConfirm}
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
