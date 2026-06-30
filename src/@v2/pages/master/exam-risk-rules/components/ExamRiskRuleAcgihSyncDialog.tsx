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
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useMutateSyncExamRiskRulesAcgihBei } from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import {
  EXAM_RISK_RULE_SYNC_ACGIH_CONFIRM_TEXT,
  ExamRiskRuleAcgihSyncAction,
  IExamRiskRuleAcgihSyncResponse,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

type Props = {
  open: boolean;
  onClose: () => void;
};

const actionColor: Record<
  ExamRiskRuleAcgihSyncAction,
  'success' | 'default' | 'error' | 'info' | 'warning'
> = {
  ruleCreated: 'success',
  referenceCreated: 'success',
  alreadySynced: 'info',
  blocked: 'warning',
  failed: 'error',
};

const actionLabel: Record<ExamRiskRuleAcgihSyncAction, string> = {
  ruleCreated: 'Regra criada',
  referenceCreated: 'Referência ACGIH',
  alreadySynced: 'Já sincronizado',
  blocked: 'Bloqueado',
  failed: 'Falhou',
};

const Count: FC<{ label: string; value: number }> = ({ label, value }) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      minWidth: 100,
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

export const ExamRiskRuleAcgihSyncDialog: FC<Props> = ({ open, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [preview, setPreview] = useState<IExamRiskRuleAcgihSyncResponse | null>(
    null,
  );
  const [result, setResult] = useState<IExamRiskRuleAcgihSyncResponse | null>(
    null,
  );
  const sync = useMutateSyncExamRiskRulesAcgihBei();

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setPreview(null);
      setResult(null);
      sync.reset();
      return;
    }
    sync.mutate(
      {
        confirmText: EXAM_RISK_RULE_SYNC_ACGIH_CONFIRM_TEXT,
        dryRun: true,
      },
      { onSuccess: (data) => setPreview(data) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === EXAM_RISK_RULE_SYNC_ACGIH_CONFIRM_TEXT &&
      !sync.isPending,
    [confirmText, sync.isPending],
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    sync.mutate(
      {
        confirmText: EXAM_RISK_RULE_SYNC_ACGIH_CONFIRM_TEXT,
        dryRun: false,
      },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleClose = () => {
    if (sync.isPending) return;
    onClose();
  };

  const totals = result?.totals ?? preview?.totals;
  const blockedItems =
    result?.items.filter((i) => i.action === 'blocked') ?? [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {!result ? (
        <>
          <DialogTitle>Sincronizar ACGIH/BEI</DialogTitle>
          <DialogContent dividers>
            <Alert severity="info" sx={{ mb: 2 }}>
              Esta ação sincroniza indicadores ACGIH/BEI consolidados com a
              Biblioteca Risco × Exame. Pode criar regras técnicas (
              <strong>Critério técnico</strong>) ou anexar ACGIH/BEI como fonte
              complementar a regras NR-07 existentes. Não altera NR-7, não altera
              fatores de risco e não cria vínculos diretamente em empresas.
            </Alert>

            {totals && (
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Count label="Indicadores" value={totals.indicators} />
                <Count label="Regras novas" value={totals.rulesCreated} />
                <Count
                  label="Referências"
                  value={totals.referencesCreated}
                />
                <Count label="Bloqueados" value={totals.blocked} />
                <Count label="Já sincronizados" value={totals.alreadySynced} />
              </Box>
            )}

            {preview && totals && totals.blocked > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {totals.blocked} item(ns) bloqueado(s) — em geral por falta de
                exame vinculado ao indicador ACGIH/BEI. Eles não gerarão regra
                incompleta.
              </Alert>
            )}

            <Typography variant="body2" sx={{ mb: 1 }}>
              Para confirmar, digite exatamente{' '}
              <strong>{EXAM_RISK_RULE_SYNC_ACGIH_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              size="small"
              fullWidth
              placeholder={EXAM_RISK_RULE_SYNC_ACGIH_CONFIRM_TEXT}
              disabled={sync.isPending}
              autoComplete="off"
            />

            {sync.isError && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                Não foi possível sincronizar ACGIH/BEI. Verifique permissões e
                tente novamente.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={sync.isPending}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {sync.isPending ? 'Sincronizando…' : 'Sincronizar ACGIH/BEI'}
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Sincronização ACGIH/BEI — resultado</DialogTitle>
          <DialogContent dividers>
            {totals && (
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Count label="Regras criadas" value={totals.rulesCreated} />
                <Count
                  label="Referências"
                  value={totals.referencesCreated}
                />
                <Count label="Já sincronizados" value={totals.alreadySynced} />
                <Count label="Bloqueados" value={totals.blocked} />
                <Count label="Falhas" value={totals.failed} />
              </Box>
            )}

            <Alert
              severity={totals && totals.failed > 0 ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            >
              Sincronização concluída. Revise a biblioteca e teste o fator de
              risco na empresa com &quot;Mostrar todos os exames&quot; desligado.
            </Alert>

            {blockedItems.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Bloqueados (sem exame ou vínculo)
                </Typography>
                <List dense sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                  {blockedItems.map((item) => (
                    <ListItem key={`${item.indicatorId}-${item.riskFactorId}`}>
                      <ListItemText
                        primary={`${item.substanceName}${item.riskName ? ` · ${item.riskName}` : ''}`}
                        secondary={item.reason}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {result.items.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Todos os itens processados
                </Typography>
                <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
                  {result.items.map((item, idx) => (
                    <ListItem
                      key={`${item.indicatorId}-${item.riskFactorId}-${idx}`}
                      secondaryAction={
                        <Chip
                          size="small"
                          color={actionColor[item.action]}
                          label={actionLabel[item.action]}
                        />
                      }
                    >
                      <ListItemText
                        primary={`${item.substanceName}${item.riskName ? ` · ${item.riskName}` : ''}${item.examName ? ` → ${item.examName}` : ''}`}
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
