import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
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
import { useApplyAcgihPromotion } from '@v2/services/medicine/acgih-promotion-preview/hooks/useApplyAcgihPromotion';
import {
  ACGIH_PROMOTION_APPLY_CONFIRM_TEXT,
  AcgihPromotionApplyItemStatus,
  IAcgihPromotionApplyResponse,
} from '@v2/services/medicine/acgih-promotion-preview/service/acgih-promotion-preview.types';

type Props = {
  open: boolean;
  onClose: () => void;
  eligible: number;
  primary: number;
  divergenceDerived: number;
  includeDivergenceDerived: boolean;
};

const statusColor: Record<
  AcgihPromotionApplyItemStatus,
  'success' | 'default' | 'error'
> = {
  created: 'success',
  skipped: 'default',
  blocked: 'error',
};

const statusLabel: Record<AcgihPromotionApplyItemStatus, string> = {
  created: 'Criado (DRAFT)',
  skipped: 'Ignorado',
  blocked: 'Bloqueado',
};

const Count: FC<{ label: string; value: number }> = ({ label, value }) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      minWidth: 110,
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

export const AcgihPromotionApplyDialog: FC<Props> = ({
  open,
  onClose,
  eligible,
  primary,
  divergenceDerived,
  includeDivergenceDerived,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<IAcgihPromotionApplyResponse | null>(
    null,
  );
  const apply = useApplyAcgihPromotion();

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setResult(null);
      apply.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === ACGIH_PROMOTION_APPLY_CONFIRM_TEXT &&
      !apply.isPending,
    [confirmText, apply.isPending],
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    apply.mutate(
      {
        includeDivergenceDerived,
        confirmText: ACGIH_PROMOTION_APPLY_CONFIRM_TEXT,
      },
      {
        onSuccess: (data) => setResult(data),
      },
    );
  };

  const handleClose = () => {
    if (apply.isPending) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!result ? (
        <>
          <DialogTitle>Sincronizar ACGIH/BEI — confirmar promoção</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Elegíveis" value={eligible} />
              <Count label="Primários" value={primary} />
              {includeDivergenceDerived && (
                <Count
                  label="Derivados de divergência"
                  value={divergenceDerived}
                />
              )}
            </Box>

            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Serão criados <strong>{eligible}</strong> indicador(es) oficial(is)
              ACGIH/BEI em status <strong>DRAFT</strong>. Apenas itens{' '}
              <strong>elegíveis</strong> do preview atual são promovidos.
            </Alert>

            <Typography variant="body2" color="text.secondary" component="div">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Não serão criadas regras na Biblioteca Risco × Exame.</li>
                <li>Não haverá vínculo automático com risco/exame.</li>
                <li>Os indicadores criados ficam como DRAFT e exigem curadoria.</li>
                <li>
                  A NR-7 permanece como referência legal brasileira obrigatória.
                </li>
                <li>
                  A ACGIH/BEI é referência técnica adicional, não exigência legal
                  NR-7.
                </li>
              </ul>
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ mb: 1 }}>
              Para confirmar, digite exatamente{' '}
              <strong>{ACGIH_PROMOTION_APPLY_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              size="small"
              fullWidth
              placeholder={ACGIH_PROMOTION_APPLY_CONFIRM_TEXT}
              disabled={apply.isPending}
              autoComplete="off"
            />

            {apply.isError && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                Não foi possível concluir a promoção ACGIH/BEI. Verifique sua
                conexão e tente novamente.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={apply.isPending}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {apply.isPending ? 'Promovendo…' : 'Promover'}
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Promoção ACGIH/BEI — resultado</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Solicitados" value={result.totals.requested} />
              <Count label="Elegíveis" value={result.totals.eligible} />
              <Count label="Criados" value={result.totals.created} />
              <Count label="Ignorados" value={result.totals.skipped} />
              <Count label="Bloqueados" value={result.totals.blocked} />
            </Box>

            <Alert severity="success" sx={{ mb: 1.5 }}>
              {result.totals.created} indicador(es) criado(s) como{' '}
              <strong>DRAFT</strong>. Eles ainda precisam de curadoria/revisão
              normativa antes do uso operacional.
            </Alert>

            {result.items.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Itens processados
                </Typography>
                <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
                  {result.items.map((item) => (
                    <ListItem
                      key={item.acgihBeiIndicatorId}
                      sx={{ alignItems: 'flex-start' }}
                      secondaryAction={
                        <Chip
                          size="small"
                          color={statusColor[item.status]}
                          label={statusLabel[item.status]}
                        />
                      }
                    >
                      <ListItemText
                        primary={item.acgihBeiIndicatorId}
                        secondary={item.reason}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onClose}>
              Fechar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
