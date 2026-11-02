import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import { api } from 'core/services/apiClient';
import {
  approvedSaveRequest,
  additiveRoute,
  assertSaveReceipt,
} from './gse-additive-save';
import type { SaveRequest, SaveResult } from './gse-additive-save';
import type { ApprovedGseAdditionSummary } from './gse-approved-additions';
import { useGseVisualAssistance } from './GseVisualAssistance.context';
import { summarizeApprovedGseAdditions } from './gse-approved-additions';

export function GseSaveConfirmation() {
  const ctx = useGseVisualAssistance();
  const [open, setOpen] = useState(false);
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
  const [available, setAvailable] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  const pending = useRef<{
    request: SaveRequest;
    summary: ApprovedGseAdditionSummary;
    companyId: string;
    workspaceId: string;
  } | null>(null);
  const currentScope = useRef('');
  currentScope.current = JSON.stringify([ctx?.companyId, ctx?.workspaceId]);
  const inFlight = useRef(false);
  useEffect(() => {
    let cancelled = false;
    setAvailable(false);
    if (ctx?.active && ctx.companyId && ctx.workspaceId)
      api
        .get(additiveRoute(ctx.companyId, ctx.workspaceId) + '/capabilities')
        .then(({ data }) => {
          if (!cancelled)
            setAvailable(
              data?.available === true &&
                data?.contractVersion === 'GSE_ASSISTED_ADDITIVE_V1',
            );
        })
        .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ctx?.active, ctx?.companyId, ctx?.workspaceId, availabilityAttempt]);
  useEffect(() => {
    setOpen(false);
    pending.current = null;
    setError('');
    setSuccess('');
  }, [ctx?.active, ctx?.companyId, ctx?.workspaceId]);
  if (!ctx?.active) return null;
  const summary =
    pending.current?.summary || summarizeApprovedGseAdditions(ctx);
  const save = async () => {
    if (inFlight.current || !available || !summary.applicable) return;
    inFlight.current = true;
    setBusy(true);
    ctx.setPersistenceBusy?.(true);
    setError('');
    setSuccess('');
    const attemptScope = JSON.stringify([ctx.companyId, ctx.workspaceId]);
    let confirmed: SaveResult | undefined;
    try {
      if (!pending.current)
        pending.current = {
          request: approvedSaveRequest(
            summary,
            ctx.workspaceId,
            crypto.randomUUID(),
          ),
          summary: structuredClone(summary),
          companyId: ctx.companyId,
          workspaceId: ctx.workspaceId,
        };
      const p = pending.current;
      const { data } = await api.post(
        additiveRoute(p.companyId, p.workspaceId),
        p.request,
      );
      assertSaveReceipt(data, p.request, p.companyId, p.workspaceId);
      confirmed = data;
      if (!ctx.persisted)
        throw Error(
          'Atualização do organograma indisponível. Repita a confirmação para recuperar o recibo.',
        );
      await ctx.persisted(p.request, data);
      pending.current = null;
      if (currentScope.current !== attemptScope) return;
      setOpen(false);
      setSuccess(
        `${data.createdCount} GSE(s) criado(s) e ${data.addedLinkCount} vínculo(s) adicionado(s). Recibo: ${data.receiptId}.`,
      );
    } catch (e: any) {
      if (currentScope.current !== attemptScope) return;
      const code = e?.response?.data?.message;
      const status = e?.response?.status;
      if (status >= 400 && status < 500 && status !== 408 && status !== 429)
        pending.current = null;
      setError(
        confirmed
          ? 'A API confirmou a gravação, mas a atualização da tela falhou. Repita para recuperar o mesmo recibo, sem duplicar.'
          : code === 'GSE_ADDITIVE_TEMPORAL_REVIEW_REQUIRED'
            ? 'A inclusão exige revisão temporal de histórico PPP. Nenhuma operação deste lote foi aplicada.'
            : typeof code === 'string'
              ? `A API recusou a operação: ${code}.`
              : e?.message ||
                'Não foi possível confirmar o resultado. Tente novamente com a mesma confirmação.',
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
      ctx.setPersistenceBusy?.(!!pending.current);
    }
  };
  const existingLinks = summary.existingGroups.reduce(
      (n, g) => n + g.links.length,
      0,
    ),
    newLinks = summary.newGroups.reduce((n, g) => n + g.links.length, 0);
  return (
    <Box
      sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}
    >
      <Button
        variant="contained"
        size="small"
        fullWidth
        disabled={
          !summary.applicable ||
          busy ||
          (!pending.current && ctx.loading) ||
          !available
        }
        onClick={() => setOpen(true)}
      >
        {busy ? 'Gravando…' : 'Confirmar e salvar'}
      </Button>
      <Typography variant="caption" color="text.primary" display="block">
        {available
          ? 'Somente operações aprovadas serão enviadas.'
          : 'Verificando disponibilidade da gravação protegida.'}
      </Typography>
      {!!success && <Alert severity="success">{success}</Alert>}
      {!!error && !open && <Alert severity="error">{error}</Alert>}
      {!available && (
        <Button
          size="small"
          onClick={() => setAvailabilityAttempt((v) => v + 1)}
        >
          Verificar disponibilidade
        </Button>
      )}
      {!!summary.issues.length && (
        <Typography variant="caption" color="error">
          {summary.issues[0]}
        </Typography>
      )}
      <Dialog
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="gse-save-summary-title"
      >
        <DialogTitle id="gse-save-summary-title">
          Conferir alterações aprovadas
        </DialogTitle>
        <DialogContent>
          <Typography color="text.primary">
            Estabelecimento:{' '}
            {ctx.workspaces.find((w) => w.id === ctx.workspaceId)?.name ||
              ctx.workspaceId}
          </Typography>
          <Typography color="text.primary">
            Novos GSEs: {summary.newGroups.length}. Inclusões em GSEs
            existentes: {existingLinks}. Inclusões em novos GSEs: {newLinks}.
          </Typography>
          <List dense>
            {[...summary.newGroups, ...summary.existingGroups].map((g) => (
              <ListItem key={g.groupId} sx={{ display: 'block', px: 0 }}>
                <Typography color="text.primary" fontWeight={600}>
                  {g.name} — {g.links.length} inclusão(ões)
                  {summary.newGroups.includes(g) ? ' · criação aprovada' : ''}
                </Typography>
                {summary.newGroups.includes(g) && g.description && (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {g.description}
                  </Typography>
                )}
                {g.links.map((l) => (
                  <Typography
                    key={l.nodeId}
                    variant="body2"
                    color="text.primary"
                  >
                    • {l.label}
                  </Typography>
                ))}
                {!g.links.length && (
                  <Typography variant="body2" color="text.primary">
                    Criação sem vínculos aprovados. Vínculos pendentes e
                    rejeitados não serão incluídos.
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" color="text.primary">
            Nenhuma retirada, substituição de vínculo, alteração de datas ou
            exclusão será executada nesta etapa.
          </Typography>
          {!!summary.skippedCovered && (
            <Typography variant="body2" color="text.primary">
              {summary.skippedCovered} inclusão(ões) redundante(s)
              desconsiderada(s) por vínculo direto ou abrangência superior.
            </Typography>
          )}
          {summary.issues.map((issue) => (
            <Alert key={issue} severity="error">
              {issue}
            </Alert>
          ))}
          {!available && (
            <Alert severity="warning">
              A entrada protegida não está disponível. Nenhuma requisição será
              enviada.
            </Alert>
          )}
          {!!pending.current && (
            <Alert severity="info">
              Uma confirmação já foi iniciada. A revisão está bloqueada até
              recuperar o resultado. Repetir mantém a mesma chave de
              idempotência e não duplica a operação.
            </Alert>
          )}
          {!!error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!available || !summary.applicable || busy}
            onClick={save}
          >
            {busy ? 'Gravando…' : 'Confirmar gravação'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
