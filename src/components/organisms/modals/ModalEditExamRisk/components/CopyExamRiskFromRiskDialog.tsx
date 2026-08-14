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

import SCheckBox from 'components/atoms/SCheckBox';
import SText from 'components/atoms/SText';
import { RiskSelect } from 'components/organisms/tagSelects/RiskSelect';
import {
  getExamAge,
  getExamPeriodic,
} from 'components/organisms/tables/ExamsRiskTable/exam-risk-display.util';
import {
  formatExamRiskQualitativeDegreeLabel,
  formatExamRiskQuantitativeDegreeLabel,
} from 'core/utils/helpers/exam-risk-degree-display.util';
import { IExamToRisk } from 'core/interfaces/api/IExam';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutateCopyExamRiskFromRisk } from '@v2/services/medicine/company-exam-risk-copy-from-risk/hooks/useMutateCopyExamRiskFromRisk';
import {
  ExamRiskCopyFromRiskAvailabilityEnum,
  ExamRiskCopyFromRiskItemStatusEnum,
  ExamRiskCopyFromRiskSourceEnum,
  type IExamRiskCopyFromRiskCandidate,
  type IExamRiskCopyFromRiskConfig,
  type IExamRiskCopyFromRiskItemResult,
  type IExamRiskCopyFromRiskResponse,
} from '@v2/services/medicine/company-exam-risk-copy-from-risk/company-exam-risk-copy-from-risk.types';

type Props = {
  open: boolean;
  companyId: string;
  targetRiskId: string;
  targetRiskName?: string;
  targetRisk?: Pick<IRiskFactors, 'type' | 'esocialCode'> | null;
  isMasterAdmin: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCloseParentAfterSuccess?: () => void;
};

const formatSex = (config: IExamRiskCopyFromRiskConfig) => {
  const parts: string[] = [];
  if (config.isMale) parts.push('M');
  if (config.isFemale) parts.push('F');
  return parts.length ? parts.join(' / ') : '-';
};

const toExamDisplay = (
  config: IExamRiskCopyFromRiskConfig,
): Partial<IExamToRisk> => ({
  isAdmission: config.isAdmission,
  isPeriodic: config.isPeriodic,
  isChange: config.isChange,
  isReturn: config.isReturn,
  isDismissal: config.isDismissal,
  isMale: config.isMale,
  isFemale: config.isFemale,
  fromAge: config.fromAge ?? undefined,
  toAge: config.toAge ?? undefined,
  validityInMonths: config.validityInMonths ?? undefined,
  considerBetweenDays: config.considerBetweenDays ?? undefined,
  minRiskDegree: config.minRiskDegree ?? undefined,
  minRiskDegreeQuantity: config.minRiskDegreeQuantity,
});

const formatPeriodicity = (config: IExamRiskCopyFromRiskConfig) =>
  getExamPeriodic(toExamDisplay(config)).text || '-';

const formatAge = (config: IExamRiskCopyFromRiskConfig) =>
  getExamAge(toExamDisplay(config));

const availabilityLabel = (
  availability: ExamRiskCopyFromRiskAvailabilityEnum,
) => {
  switch (availability) {
    case ExamRiskCopyFromRiskAvailabilityEnum.AVAILABLE:
      return 'Disponível';
    case ExamRiskCopyFromRiskAvailabilityEnum.ALREADY_EXISTS:
      return 'Já existente';
    case ExamRiskCopyFromRiskAvailabilityEnum.CONFLICT:
      return 'Conflito — configuração diferente';
    default:
      return availability;
  }
};

const resultStatusLabel = (status: ExamRiskCopyFromRiskItemStatusEnum) => {
  switch (status) {
    case ExamRiskCopyFromRiskItemStatusEnum.CREATED:
      return 'Vínculo local criado';
    case ExamRiskCopyFromRiskItemStatusEnum.ALREADY_EXISTS:
      return 'Já existente';
    case ExamRiskCopyFromRiskItemStatusEnum.CONFLICT:
      return 'Conflito — configuração diferente';
    case ExamRiskCopyFromRiskItemStatusEnum.SKIPPED_NOT_ELIGIBLE:
      return 'Não elegível';
    case ExamRiskCopyFromRiskItemStatusEnum.ERROR:
      return 'Erro';
    default:
      return status;
  }
};

const libraryStatusLabel = (item: IExamRiskCopyFromRiskItemResult) => {
  if (!item.systemRule) return '—';
  if (item.systemRule.action === 'created') return 'Biblioteca criada';
  if (item.systemRule.action === 'alreadyExists') {
    return 'Biblioteca já existente';
  }
  return item.systemRule.reason
    ? `Biblioteca não publicada: ${item.systemRule.reason}`
    : 'Biblioteca não publicada';
};

const CandidateTable: FC<{
  items: Array<IExamRiskCopyFromRiskCandidate | IExamRiskCopyFromRiskItemResult>;
  riskRef?: Pick<IRiskFactors, 'type' | 'esocialCode'> | null;
  selectedKeys?: string[];
  onToggle?: (item: IExamRiskCopyFromRiskCandidate) => void;
  showResultStatus?: boolean;
  showLibraryStatus?: boolean;
}> = ({
  items,
  riskRef,
  selectedKeys = [],
  onToggle,
  showResultStatus,
  showLibraryStatus,
}) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        {onToggle && <TableCell padding="checkbox" />}
        <TableCell>Exame</TableCell>
        <TableCell>Periodicidade</TableCell>
        <TableCell>Sexo</TableCell>
        <TableCell>Faixa etária</TableCell>
        <TableCell>Meses</TableCell>
        <TableCell>Dias</TableCell>
        <TableCell>Qualitativo</TableCell>
        <TableCell>Quantitativo</TableCell>
        <TableCell>Situação</TableCell>
        {showLibraryStatus && <TableCell>Biblioteca</TableCell>}
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => {
        const result = item as IExamRiskCopyFromRiskItemResult;
        const checked = selectedKeys.includes(item.key);
        return (
          <TableRow key={item.key} hover>
            {onToggle && (
              <TableCell padding="checkbox">
                <Checkbox
                  disabled={!item.selectable}
                  checked={checked}
                  onChange={() => onToggle(item)}
                />
              </TableCell>
            )}
            <TableCell>{item.examName}</TableCell>
            <TableCell>{formatPeriodicity(item.proposedConfig)}</TableCell>
            <TableCell>{formatSex(item.proposedConfig)}</TableCell>
            <TableCell>{formatAge(item.proposedConfig)}</TableCell>
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
              {formatExamRiskQuantitativeDegreeLabel(
                item.proposedConfig.minRiskDegreeQuantity,
                riskRef,
              )}
            </TableCell>
            <TableCell>
              {showResultStatus
                ? resultStatusLabel(result.status)
                : item.blockReason || availabilityLabel(item.availability)}
            </TableCell>
            {showLibraryStatus && (
              <TableCell>{libraryStatusLabel(result)}</TableCell>
            )}
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

export const CopyExamRiskFromRiskDialog: FC<Props> = ({
  open,
  companyId,
  targetRiskId,
  targetRiskName,
  targetRisk,
  isMasterAdmin,
  onClose,
  onSuccess,
  onCloseParentAfterSuccess,
}) => {
  const mutation = useMutateCopyExamRiskFromRisk();
  const [sourceRisk, setSourceRisk] = useState<IRiskFactors | null>(null);
  const [preview, setPreview] = useState<IExamRiskCopyFromRiskResponse | null>(
    null,
  );
  const [result, setResult] = useState<IExamRiskCopyFromRiskResponse | null>(
    null,
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [publishAsSystemRule, setPublishAsSystemRule] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSourceRisk(null);
    setPreview(null);
    setResult(null);
    setSelectedKeys([]);
    setPublishAsSystemRule(false);
    mutation.reset();
    // Reset only when the dialog opens; mutation identity is stable enough here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadPreview = async (sourceRiskId: string) => {
    try {
      const response = await mutation.mutateAsync({
        companyId,
        sourceRiskId,
        targetRiskId,
        dryRun: true,
        publishAsSystemRule: false,
      });
      setPreview(response);
      setResult(null);
      setSelectedKeys(
        response.items
          .filter((item) => item.selectable)
          .map((item) => item.key),
      );
    } catch {
      setPreview(null);
      setSelectedKeys([]);
    }
  };

  const libraryItems = preview?.items.filter(
    (item) => item.source === ExamRiskCopyFromRiskSourceEnum.LIBRARY,
  ) ?? [];
  const localItems = preview?.items.filter(
    (item) => item.source === ExamRiskCopyFromRiskSourceEnum.LOCAL,
  ) ?? [];
  const selectableItems = preview?.items.filter((item) => item.selectable) ?? [];

  const selectedItems = useMemo(
    () => preview?.items.filter((item) => selectedKeys.includes(item.key)) ?? [],
    [preview, selectedKeys],
  );

  const onToggle = (item: IExamRiskCopyFromRiskCandidate) => {
    if (!item.selectable) return;
    setSelectedKeys((current) => {
      const already = current.includes(item.key);
      if (already) return current.filter((key) => key !== item.key);

      const sameExamKeys = new Set(
        (preview?.items ?? [])
          .filter((candidate) => candidate.examId === item.examId)
          .map((candidate) => candidate.key),
      );

      return [...current.filter((key) => !sameExamKeys.has(key)), item.key];
    });
  };

  const onToggleAll = (checked: boolean) => {
    setSelectedKeys(checked ? selectableItems.map((item) => item.key) : []);
  };

  const onConfirm = async () => {
    if (!sourceRisk?.id || !selectedItems.length) return;
    try {
      const response = await mutation.mutateAsync({
        companyId,
        sourceRiskId: sourceRisk.id,
        targetRiskId,
        dryRun: false,
        publishAsSystemRule: isMasterAdmin && publishAsSystemRule,
        items: selectedItems.map((item) => ({
          examId: item.examId,
          source: item.source,
          sourceLinkId: item.sourceLinkId,
        })),
      });
      setResult(response);
      if (response.summary.created > 0) {
        onSuccess();
      }
    } catch {
      // Mensagem específica no Alert; o preview permanece para nova tentativa.
    }
  };

  const copyCompletedWithCreates = Boolean(
    result && result.summary.created > 0,
  );

  const handleDialogClose = () => {
    onClose();
    if (copyCompletedWithCreates) {
      onCloseParentAfterSuccess?.();
    }
  };

  const libraryPublishFailedCount =
    result?.results.filter((item) => item.systemRule?.action === 'skipped')
      .length ?? 0;

  const allSelected =
    selectableItems.length > 0 &&
    selectedKeys.length === selectableItems.length;

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="lg"
      fullWidth
      disableEnforceFocus
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
    >
      <DialogTitle>Copiar exames de outro fator</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Destino: <strong>{targetRiskName || targetRiskId}</strong>
        </Typography>

        <SText color="text.label" fontSize={14} mb={1}>
          Fator de risco de origem
        </SText>
        <RiskSelect
          large
          multiple={false}
          text={sourceRisk?.name || 'selecione um risco de origem'}
          tooltipTitle={sourceRisk?.name || ''}
          borderActive={sourceRisk?.id ? 'info' : undefined}
          menuProps={{
            disableAutoFocusItem: true,
            sx: { zIndex: (theme) => theme.zIndex.modal + 2 },
          }}
          handleSelect={(option: IRiskFactors | (string | number)[]) => {
            if (!option || Array.isArray(option) || !option.id) return;
            if (option.id === targetRiskId) return;
            setSourceRisk(option);
            void loadPreview(option.id);
          }}
        />

        {mutation.isError && !result && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {preview
              ? 'Não foi possível copiar os exames. Nenhum vínculo local foi criado. Tente novamente.'
              : 'Não foi possível carregar os exames. Tente novamente.'}
          </Alert>
        )}

        {preview && !result && (
          <Box mt={3}>
            {preview.warnings.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {preview.warnings.join(' ')}
              </Alert>
            )}

            {selectableItems.length > 0 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allSelected}
                    indeterminate={
                      selectedKeys.length > 0 && !allSelected
                    }
                    onChange={(event) => onToggleAll(event.target.checked)}
                  />
                }
                label="Selecionar todos os disponíveis"
              />
            )}

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Biblioteca SimpleSST
            </Typography>
            {libraryItems.length ? (
              <CandidateTable
                items={libraryItems}
                riskRef={targetRisk}
                selectedKeys={selectedKeys}
                onToggle={onToggle}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum exame ACTIVE encontrado na Biblioteca para este fator.
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Vínculos locais desta empresa
            </Typography>
            {localItems.length ? (
              <CandidateTable
                items={localItems}
                riskRef={targetRisk}
                selectedKeys={selectedKeys}
                onToggle={onToggle}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum vínculo local desta empresa para o fator de origem.
              </Typography>
            )}

            {isMasterAdmin && (
              <Box mt={3}>
                <SCheckBox
                  label="Criar também regra padrão na Biblioteca Risco × Exame"
                  checked={publishAsSystemRule}
                  onChange={(e) =>
                    setPublishAsSystemRule(e.target.checked)
                  }
                />
                <SText sx={{ fontSize: 12, color: 'text.light', mt: 1 }}>
                  Aplica-se somente aos exames efetivamente copiados. Não altera
                  o fator de origem. Esta opção não é ligada automaticamente.
                </SText>
              </Box>
            )}
          </Box>
        )}

        {result && (
          <Box mt={3}>
            <Alert
              severity={
                result.summary.errors > 0 || libraryPublishFailedCount > 0
                  ? 'warning'
                  : 'success'
              }
              sx={{ mb: 2 }}
            >
              {result.summary.created} vínculo(s) local(is) criado(s),{' '}
              {result.summary.skipped} ignorado(s), {result.summary.errors}{' '}
              erro(s).
            </Alert>
            {result.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {result.warnings.join(' ')}
              </Alert>
            )}
            <CandidateTable
              items={result.results}
              riskRef={targetRisk}
              showResultStatus
              showLibraryStatus={result.publishAsSystemRule}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!result && (
          <>
            <Button onClick={onClose} disabled={mutation.isLoading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={
                !selectedItems.length || mutation.isLoading || !sourceRisk?.id
              }
              onClick={onConfirm}
            >
              Copiar selecionados
            </Button>
          </>
        )}
        {result && (
          <Button variant="contained" onClick={handleDialogClose}>
            Fechar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
