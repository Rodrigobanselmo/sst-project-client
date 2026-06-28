import { FC, useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  useMutateApplyRematchBiologicalIndicator,
  useMutateRematchBiologicalIndicatorPreview,
} from '@v2/services/medicine/biological-indicator/hooks/useMutateBiologicalIndicatorCuration';
import type {
  RematchBucket,
  RematchResult,
  RematchTarget,
} from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';

const TARGET_LABELS: Record<RematchTarget, string> = {
  RISK: 'risco',
  EXAM: 'exame',
  BOTH: 'risco e exame',
};

type RowItem = {
  key: string;
  title: string;
  subtitle: string;
};

const toRiskRows = (
  items: RematchResult['risk']['created'],
): RowItem[] =>
  items.map((item) => ({
    key: item.riskFactorId,
    title: item.riskName ?? item.riskFactorId,
    subtitle: [
      item.riskCas ? `CAS ${item.riskCas}` : null,
      item.matchMethod,
      item.matchConfidence,
    ]
      .filter(Boolean)
      .join(' · '),
  }));

const toExamRows = (
  items: RematchResult['exam']['created'],
): RowItem[] =>
  items.map((item) => ({
    key: String(item.examId),
    title: item.examName ?? String(item.examId),
    subtitle: [
      item.examMaterial,
      item.matchMethod,
      item.matchConfidence,
    ]
      .filter(Boolean)
      .join(' · '),
  }));

const BucketSection: FC<{
  label: string;
  color: 'success' | 'info' | 'default' | 'warning';
  rows: RowItem[];
}> = ({ label, color, rows }) => {
  if (!rows.length) return null;
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Chip size="small" color={color} label={`${label} (${rows.length})`} />
      </Stack>
      <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
        {rows.map((row) => (
          <Box component="li" key={row.key}>
            <Typography variant="body2">{row.title}</Typography>
            {row.subtitle && (
              <Typography variant="caption" color="text.secondary">
                {row.subtitle}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

const PreviewBlock: FC<{
  title: string;
  rows: {
    created: RowItem[];
    restored: RowItem[];
    ignoredConfirmed: RowItem[];
    ignoredExisting: RowItem[];
    candidates: RowItem[];
  };
}> = ({ title, rows }) => {
  const nothingFound = rows.candidates.length === 0;
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      {nothingFound ? (
        <Alert severity="info" sx={{ mb: 1 }}>
          Nenhum candidato encontrado pelo match determinístico.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          <BucketSection label="Seriam criados" color="success" rows={rows.created} />
          <BucketSection
            label="Seriam restaurados"
            color="success"
            rows={rows.restored}
          />
          <BucketSection
            label="Ignorados (já confirmados)"
            color="default"
            rows={rows.ignoredConfirmed}
          />
          <BucketSection
            label="Ignorados (já existentes/pendentes)"
            color="info"
            rows={rows.ignoredExisting}
          />
        </Stack>
      )}
    </Box>
  );
};

type Props = {
  indicatorId: string;
  target: RematchTarget | null;
  onClose: () => void;
};

export const BiologicalIndicatorRematchDialog: FC<Props> = ({
  indicatorId,
  target,
  onClose,
}) => {
  const preview = useMutateRematchBiologicalIndicatorPreview();
  const apply = useMutateApplyRematchBiologicalIndicator(indicatorId);
  const [result, setResult] = useState<RematchResult | null>(null);

  const open = Boolean(target);

  useEffect(() => {
    if (!target) {
      setResult(null);
      return;
    }
    setResult(null);
    preview.mutate(
      { indicatorId, target, dryRun: true },
      { onSuccess: (data) => setResult(data) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, indicatorId]);

  const handleApply = () => {
    if (!target) return;
    apply.mutate(
      { indicatorId, target, dryRun: false },
      { onSuccess: onClose },
    );
  };

  const showRisk = target === 'RISK' || target === 'BOTH';
  const showExam = target === 'EXAM' || target === 'BOTH';

  const totalChanges = result
    ? (showRisk
        ? result.risk.created.length + result.risk.restored.length
        : 0) +
      (showExam
        ? result.exam.created.length + result.exam.restored.length
        : 0)
    : 0;

  const buildRiskRows = (bucket: RematchBucket<RematchResult['risk']['created'][number]>) => ({
    created: toRiskRows(bucket.created),
    restored: toRiskRows(bucket.restored),
    ignoredConfirmed: toRiskRows(bucket.ignoredConfirmed),
    ignoredExisting: toRiskRows(bucket.ignoredExisting),
    candidates: toRiskRows(bucket.candidates),
  });

  const buildExamRows = (bucket: RematchBucket<RematchResult['exam']['created'][number]>) => ({
    created: toExamRows(bucket.created),
    restored: toExamRows(bucket.restored),
    ignoredConfirmed: toExamRows(bucket.ignoredConfirmed),
    ignoredExisting: toExamRows(bucket.ignoredExisting),
    candidates: toExamRows(bucket.candidates),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Reanalisar vínculos {target ? `(${TARGET_LABELS[target]})` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Prévia da reanálise. Vínculos já confirmados são preservados. Itens
          novos ou restaurados voltam como <strong>pendentes</strong> e precisam
          ser confirmados manualmente. Nada é confirmado ou ativado
          automaticamente.
        </Typography>

        {preview.isPending && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!preview.isPending && result && (
          <Stack spacing={2}>
            {showRisk && (
              <PreviewBlock
                title="Risco"
                rows={buildRiskRows(result.risk)}
              />
            )}
            {showRisk && showExam && <Divider />}
            {showExam && (
              <PreviewBlock
                title="Exame"
                rows={buildExamRows(result.exam)}
              />
            )}

            {totalChanges === 0 && (
              <Alert severity="info">
                Nada será alterado: não há novos vínculos para criar ou
                restaurar.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={apply.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={
            preview.isPending ||
            apply.isPending ||
            !result ||
            totalChanges === 0
          }
          onClick={handleApply}
        >
          Aplicar reanálise
        </Button>
      </DialogActions>
    </Dialog>
  );
};
