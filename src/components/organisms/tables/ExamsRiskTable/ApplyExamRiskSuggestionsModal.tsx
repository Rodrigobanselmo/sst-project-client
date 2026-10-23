import { FC, useEffect, useMemo, useState } from 'react';
import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';

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

import { formatExamRiskQualitativeDegreeLabel } from 'core/utils/helpers/exam-risk-degree-display.util';

import {
  useApplyExamRiskSuggestions,
  confirmPreviewedExamRiskSuggestions,
} from '@v2/services/medicine/company-exam-risk-suggestions/hooks/useApplyExamRiskSuggestions';
import {
  ApplyExamRiskSuggestionItemStatusEnum,
  type IApplyExamRiskSuggestionItem,
  type IApplyExamRiskSuggestionsResponse,
  type IResolvedExamRiskConfig,
} from '@v2/services/medicine/company-exam-risk-suggestions/company-exam-risk-suggestions.types';
import type { IExamRiskLinkMissingExam } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import { PcmsoLinkStatusEnum } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import { pcmsoLinkStatusLabels } from '@v2/services/medicine/company-exam-risk-link-status/pcmso-link-status-display.util';

import {
  formatExamAge,
  formatExamEvents,
  formatExamSex,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-display.util';

type Step = 'select' | 'preview' | 'result';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId?: string;
  riskId: string;
  riskName: string;
  riskType?: string;
  riskEsocialCode?: string | null;
  missingExams: IExamRiskLinkMissingExam[];
  onClose: () => void;
  onSuccess: () => void;
};

const getConfigSourceLabel = (
  source: IResolvedExamRiskConfig['configSource'],
) => {
  if (source.ruleExamRowId) return 'Regra da biblioteca';
  if (source.usedCompanyDefaults) return 'Padrões PCMSO da empresa';
  if (source.usedCreationDefaults) return 'Padrões de criação';
  return '-';
};

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
      return pcmsoLinkStatusLabels[PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED];
    case ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NO_LIBRARY_REFERENCE:
      return pcmsoLinkStatusLabels[PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE];
    case ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NOT_SELECTED:
      return 'Não selecionado';
    case ApplyExamRiskSuggestionItemStatusEnum.ERROR:
      return 'Erro';
    default:
      return status;
  }
};

export const PreviewTable: FC<{
  items: IApplyExamRiskSuggestionItem[];
  dryRun: boolean;
  riskRef?: {
    type?: string;
    esocialCode?: string | null;
    quantitativeLimitApplicable?: boolean;
  };
}> = ({ items, dryRun, riskRef }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Exame</TableCell>
        <TableCell>Eventos</TableCell>
        <TableCell>Sexo</TableCell>
        <TableCell>Faixa etária</TableCell>
        <TableCell>Validade (meses)</TableCell>
        <TableCell>Considerar (dias)</TableCell>
        <TableCell>Qualitativo</TableCell>
        <TableCell>Quantitativo</TableCell>
        <TableCell>Motivo / observações</TableCell>
        <TableCell>Origem</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.examId}>
          <TableCell>{item.examName}</TableCell>
          <TableCell>{formatExamEvents(item.proposedConfig)}</TableCell>
          <TableCell>{formatExamSex(item.proposedConfig)}</TableCell>
          <TableCell>{formatExamAge(item.proposedConfig)}</TableCell>
          <TableCell>{item.proposedConfig.validityInMonths ?? '-'}</TableCell>
          <TableCell>
            {item.proposedConfig.considerBetweenDays ?? '-'}
          </TableCell>
          <TableCell>
            {formatExamRiskQualitativeDegreeLabel(
              item.proposedConfig.minRiskDegree,
            )}
          </TableCell>
          <TableCell>
            {riskRef?.quantitativeLimitApplicable === false
              ? 'Não aplicável'
              : riskRef?.quantitativeLimitApplicable !== true
                ? 'Elegibilidade não resolvida'
                : item.proposedConfig.minRiskDegreeQuantity == null
                  ? 'Não informado'
                  : (matrixRiskMap[
                      item.proposedConfig
                        .minRiskDegreeQuantity as keyof typeof matrixRiskMap
                    ]?.label ?? 'Valor inválido')}
          </TableCell>
          <TableCell>{item.message ?? '—'}</TableCell>
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
  riskType,
  riskEsocialCode,
  missingExams,
  onClose,
  onSuccess,
}) => {
  const applyMutation = useApplyExamRiskSuggestions();
  const [step, setStep] = useState<Step>('select');
  const [confirmError, setConfirmError] = useState('');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [previewData, setPreviewData] =
    useState<IApplyExamRiskSuggestionsResponse | null>(null);
  const [resultData, setResultData] =
    useState<IApplyExamRiskSuggestionsResponse | null>(null);

  const allExamIds = useMemo(
    () => missingExams.map((exam) => exam.examId),
    [missingExams],
  );

  const riskRef = useMemo(
    () => ({
      type: riskType,
      esocialCode: riskEsocialCode,
      quantitativeLimitApplicable: (resultData ?? previewData)?.meta
        .quantitativeLimitApplicable,
    }),
    [riskEsocialCode, riskType, resultData, previewData],
  );

  useEffect(() => {
    if (!open) return;
    setStep('select');
    setSelectedExamIds(allExamIds);
    setPreviewData(null);
    setResultData(null);
    setConfirmError('');
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
    if (!selectedExamIds.length || applyMutation.isLoading) return;
    setConfirmError('');
    try {
      const response = await applyMutation.mutateAsync({
        companyId,
        riskId,
        examIds: selectedExamIds,
        workspaceId,
        dryRun: true,
      });
      setPreviewData(response);
      setStep('preview');
    } catch {
      setConfirmError(
        'Não foi possível carregar a prévia. Nenhum exame foi adotado por esta solicitação.',
      );
    }
  };

  const onConfirm = async () => {
    if (
      !selectedExamIds.length ||
      !previewData?.previewFingerprint ||
      applyMutation.isLoading
    )
      return;
    setConfirmError('');
    try {
      const response = await confirmPreviewedExamRiskSuggestions(
        applyMutation.mutateAsync,
        {
          companyId,
          riskId,
          examIds: selectedExamIds,
          workspaceId,
          dryRun: false,
          expectedPreviewFingerprint: previewData.previewFingerprint,
        },
        onSuccess,
      );
      setResultData(response);
      setStep('result');
    } catch (error: any) {
      setPreviewData(null);
      setStep('select');
      setConfirmError(
        error?.response?.status === 409
          ? 'As recomendações ou os vínculos mudaram. Refaça a prévia antes de confirmar.'
          : 'Não foi possível concluir a adoção. Os dados serão atualizados; confira os vínculos e refaça a prévia.',
      );
    }
  };

  const previewItems = useMemo(() => {
    if (!previewData) return [];
    return previewData.items.filter(
      (item) =>
        item.status !==
        ApplyExamRiskSuggestionItemStatusEnum.SKIPPED_NOT_SELECTED,
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
                  indeterminate={selectedExamIds.length > 0 && !allSelected}
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
              Apenas os exames marcados como "Pronto para criar" serão
              incluídos. Exames com erro não serão adotados. Nenhum vínculo
              existente será alterado.
            </Alert>
            {previewData.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {previewData.warnings.join(' ')}
              </Alert>
            )}
            <PreviewTable items={previewItems} dryRun riskRef={riskRef} />
          </Box>
        )}

        {step === 'result' && resultData && (
          <Box>
            <Alert
              severity={
                resultData.summary.errors > 0 || resultData.warnings.length > 0
                  ? 'warning'
                  : 'success'
              }
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
            <PreviewTable
              items={resultItems}
              dryRun={false}
              riskRef={riskRef}
            />
          </Box>
        )}

        {confirmError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {confirmError}
          </Alert>
        )}
        {applyMutation.isError && !confirmError && (
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
              disabled={
                isLoading ||
                !previewData?.previewFingerprint ||
                !previewData?.summary.created
              }
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
