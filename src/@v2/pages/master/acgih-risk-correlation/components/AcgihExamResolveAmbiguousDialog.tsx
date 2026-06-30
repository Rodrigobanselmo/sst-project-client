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
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useResolveAmbiguousAcgihExamLinks } from '@v2/services/medicine/acgih-risk-correlation/hooks/useResolveAmbiguousAcgihExamLinks';
import {
  ACGIH_EXAM_LINK_RESOLVE_AMBIGUOUS_CONFIRM_TEXT,
  IAcgihExamPreviewLink,
  IAcgihExamResolveAmbiguousResponse,
  IAcgihRiskCorrelationItem,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

type Props = {
  open: boolean;
  onClose: () => void;
  row: {
    officialIndicatorId: string | null;
    substanceName: string;
    determinant: string;
    matrix: string;
    links: IAcgihRiskCorrelationItem['links'];
    examLink?: IAcgihExamPreviewLink;
  } | null;
};

export const AcgihExamResolveAmbiguousDialog: FC<Props> = ({
  open,
  onClose,
  row,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [preview, setPreview] = useState<IAcgihExamResolveAmbiguousResponse | null>(
    null,
  );
  const [result, setResult] = useState<IAcgihExamResolveAmbiguousResponse | null>(
    null,
  );
  const resolveAmbiguous = useResolveAmbiguousAcgihExamLinks();

  const candidates = useMemo(() => {
    const fromAmbiguous = row?.examLink?.ambiguousCandidates ?? [];
    if (fromAmbiguous.length) return fromAmbiguous;
    return (row?.examLink?.candidates ?? []).map((candidate) => ({
      examId: candidate.examId,
      examName: candidate.examName,
      material: null,
      reason: candidate.reason,
    }));
  }, [row?.examLink?.ambiguousCandidates, row?.examLink?.candidates]);

  useEffect(() => {
    if (!open || !row?.officialIndicatorId) {
      setConfirmText('');
      setSelectedIds([]);
      setPreview(null);
      setResult(null);
      resolveAmbiguous.reset();
      return;
    }

    const defaultSelection = candidates
      .map((candidate) => candidate.examId)
      .filter((id) => id === row.examLink?.examId);
    setSelectedIds(
      defaultSelection.length ? defaultSelection : candidates.slice(0, 1).map((c) => c.examId),
    );

    resolveAmbiguous.mutate(
      {
        indicatorId: row.officialIndicatorId,
        examIds: defaultSelection.length
          ? defaultSelection
          : candidates.slice(0, 1).map((c) => c.examId),
        confirmText: ACGIH_EXAM_LINK_RESOLVE_AMBIGUOUS_CONFIRM_TEXT,
        dryRun: true,
      },
      { onSuccess: (data) => setPreview(data) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, row?.officialIndicatorId]);

  const toggleExam = (examId: number) => {
    setSelectedIds((current) =>
      current.includes(examId)
        ? current.filter((id) => id !== examId)
        : [...current, examId],
    );
  };

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === ACGIH_EXAM_LINK_RESOLVE_AMBIGUOUS_CONFIRM_TEXT &&
      !resolveAmbiguous.isPending &&
      selectedIds.length > 0 &&
      !!row?.officialIndicatorId,
    [confirmText, resolveAmbiguous.isPending, selectedIds.length, row?.officialIndicatorId],
  );

  const handleConfirm = () => {
    if (!canConfirm || !row?.officialIndicatorId) return;
    resolveAmbiguous.mutate(
      {
        indicatorId: row.officialIndicatorId,
        examIds: selectedIds,
        confirmText: ACGIH_EXAM_LINK_RESOLVE_AMBIGUOUS_CONFIRM_TEXT,
        dryRun: false,
      },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleClose = () => {
    if (resolveAmbiguous.isPending) return;
    onClose();
  };

  const isResult = !!result;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isResult ? 'Resolver ambiguidade — resultado' : 'Resolver ambiguidade de exame'}
      </DialogTitle>
      <DialogContent dividers>
        {row && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              {row.substanceName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Determinante: {row.determinant} · Matriz: {row.matrix}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Fator(es) de risco:{' '}
              {row.links.map((link) => link.riskName).join('; ') || '—'}
            </Typography>
            {row.examLink?.examName && (
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                Exame atualmente vinculado: <strong>{row.examLink.examName}</strong>
              </Typography>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              Selecione todos os exames tecnicamente válidos. Esta ação apenas confirma
              vínculos indicador × exame. Não cria regra da Biblioteca automaticamente.
            </Alert>

            <FormGroup>
              {candidates.map((candidate) => (
                <FormControlLabel
                  key={candidate.examId}
                  control={
                    <Checkbox
                      checked={selectedIds.includes(candidate.examId)}
                      onChange={() => toggleExam(candidate.examId)}
                      disabled={resolveAmbiguous.isPending || isResult}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{candidate.examName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[candidate.material, candidate.reason].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>

            {preview && !isResult && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Prévia: {preview.confirmedLinks} vínculo(s) a confirmar
                {preview.skipped > 0 ? `, ${preview.skipped} ignorado(s)` : ''}.
              </Typography>
            )}

            {isResult && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {result.confirmedLinks} vínculo(s) confirmado(s).
                {result.remainingPending > 0
                  ? ` ${result.remainingPending} pendente(s) restante(s).`
                  : ' Nenhum pendente restante para este indicador.'}
              </Alert>
            )}

            {!isResult && (
              <TextField
                fullWidth
                margin="normal"
                label={`Digite "${ACGIH_EXAM_LINK_RESOLVE_AMBIGUOUS_CONFIRM_TEXT}" para confirmar`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={resolveAmbiguous.isPending}
                autoComplete="off"
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={resolveAmbiguous.isPending}>
          {isResult ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isResult && (
          <Button
            variant="contained"
            color="warning"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {resolveAmbiguous.isPending ? 'Processando…' : 'Confirmar seleção'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
