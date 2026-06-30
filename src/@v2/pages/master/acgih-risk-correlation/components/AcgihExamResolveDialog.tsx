import { FC, useEffect, useMemo, useState } from 'react';

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
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useResolveAcgihExamLinks } from '@v2/services/medicine/acgih-risk-correlation/hooks/useResolveAcgihExamLinks';
import {
  ACGIH_EXAM_LINK_RESOLVE_CONFIRM_TEXT,
  AcgihExamResolveAction,
  IAcgihExamResolveResponse,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

type Props = {
  open: boolean;
  onClose: () => void;
};

const actionColor: Record<
  AcgihExamResolveAction,
  'success' | 'info' | 'warning' | 'error'
> = {
  alreadyLinked: 'info',
  linkedExistingExam: 'success',
  createdExamAndLinked: 'success',
  ambiguous: 'warning',
  blocked: 'error',
  failed: 'error',
};

const actionLabel: Record<AcgihExamResolveAction, string> = {
  alreadyLinked: 'Já vinculado',
  linkedExistingExam: 'Vínculo criado',
  createdExamAndLinked: 'Exame criado + vínculo',
  ambiguous: 'Ambíguo',
  blocked: 'Bloqueado',
  failed: 'Falhou',
};

const Count: FC<{ label: string; value: number }> = ({ label, value }) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      minWidth: 96,
      textAlign: 'center',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
    }}
  >
    <Typography variant="h6">{value}</Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

/**
 * Resolução em lote ACGIH/BEI → Exame. dryRun primeiro; apply real vincula
 * candidatos seguros e cria exame sistêmico quando necessário. Itens ambíguos
 * ficam para curadoria manual.
 */
export const AcgihExamResolveDialog: FC<Props> = ({ open, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [preview, setPreview] = useState<IAcgihExamResolveResponse | null>(null);
  const [result, setResult] = useState<IAcgihExamResolveResponse | null>(null);
  const resolve = useResolveAcgihExamLinks();

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setPreview(null);
      setResult(null);
      resolve.reset();
      return;
    }
    resolve.mutate(
      {
        confirmText: ACGIH_EXAM_LINK_RESOLVE_CONFIRM_TEXT,
        dryRun: true,
        createMissingExams: true,
        linkSafeMatches: true,
      },
      { onSuccess: (data) => setPreview(data) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === ACGIH_EXAM_LINK_RESOLVE_CONFIRM_TEXT &&
      !resolve.isPending &&
      !!preview,
    [confirmText, resolve.isPending, preview],
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    resolve.mutate(
      {
        confirmText: ACGIH_EXAM_LINK_RESOLVE_CONFIRM_TEXT,
        dryRun: false,
        createMissingExams: true,
        linkSafeMatches: true,
      },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleClose = () => {
    if (resolve.isPending) return;
    onClose();
  };

  const view = result ?? preview;
  const isResult = !!result;
  const isLoadingPreview = !preview && resolve.isPending && !result;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isResult
          ? 'Resolver exames ACGIH/BEI — resultado'
          : 'Resolver exames ACGIH/BEI'}
      </DialogTitle>
      <DialogContent dividers>
        {isLoadingPreview && (
          <Box display="flex" alignItems="center" gap={1.5} py={3}>
            <CircularProgress size={20} />
            <Typography variant="body2">Gerando prévia (sem escrita)…</Typography>
          </Box>
        )}

        {!isResult && preview && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Esta ação cria somente <strong>exames sistêmicos ACGIH/BEI</strong>{' '}
            quando não houver exame correspondente seguro e cria o vínculo{' '}
            <strong>Indicador ACGIH/BEI → Exame</strong>. Não cria regra na
            Biblioteca, não altera NR-7 e não cria vínculo em empresas. Itens{' '}
            <strong>ambíguos</strong> não são resolvidos automaticamente.
          </Alert>
        )}

        {view && (
          <>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Indicadores" value={view.totals.indicators} />
              <Count label="Já vinculados" value={view.totals.alreadyLinked} />
              <Count
                label={isResult ? 'Vínculos criados' : 'A vincular'}
                value={view.totals.linksCreated}
              />
              <Count
                label={isResult ? 'Exames criados' : 'Exames a criar'}
                value={view.totals.examsCreated}
              />
              <Count label="Ambíguos" value={view.totals.ambiguous} />
              <Count label="Bloqueados" value={view.totals.blocked} />
              <Count label="Falhas" value={view.totals.failed} />
            </Box>

            {isResult && (
              <Alert
                severity={view.totals.failed > 0 ? 'warning' : 'success'}
                sx={{ mb: 1.5 }}
              >
                {view.totals.linksCreated} vínculo(s) criado(s),{' '}
                {view.totals.examsCreated} exame(s) criado(s),{' '}
                {view.totals.alreadyLinked} já existente(s).{' '}
                {view.totals.ambiguous > 0
                  ? `${view.totals.ambiguous} ambíguo(s) precisam de escolha manual.`
                  : 'Revise a coluna Exame do sistema na tabela e depois sincronize a Biblioteca.'}
              </Alert>
            )}

            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Itens analisados
            </Typography>
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {view.items.map((item) => {
                const candidates =
                  item.candidates?.map((c) => `${c.examName} (#${c.examId})`) ??
                  [];
                const secondary = [
                  `Determinante: ${item.determinant || '—'} · Matriz: ${
                    item.matrix || '—'
                  }`,
                  item.examName ? `Exame: ${item.examName}` : null,
                  item.reason ?? null,
                  candidates.length
                    ? `Candidatos: ${candidates.join('; ')}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' — ');

                return (
                  <ListItem
                    key={item.indicatorId}
                    sx={{ alignItems: 'flex-start' }}
                    secondaryAction={
                      <Chip
                        size="small"
                        color={actionColor[item.action]}
                        label={actionLabel[item.action]}
                      />
                    }
                  >
                    <ListItemText
                      primary={item.substanceName}
                      secondary={secondary}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}

        {resolve.isError && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            Não foi possível executar a resolução de exames ACGIH/BEI.
          </Alert>
        )}

        {!isResult && preview && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              Para confirmar, digite exatamente{' '}
              <strong>{ACGIH_EXAM_LINK_RESOLVE_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              size="small"
              fullWidth
              placeholder={ACGIH_EXAM_LINK_RESOLVE_CONFIRM_TEXT}
              disabled={resolve.isPending}
              autoComplete="off"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={resolve.isPending}>
          {isResult ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isResult && (
          <Button variant="contained" onClick={handleConfirm} disabled={!canConfirm}>
            {resolve.isPending && !!preview ? 'Resolvendo…' : 'Resolver exames'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
