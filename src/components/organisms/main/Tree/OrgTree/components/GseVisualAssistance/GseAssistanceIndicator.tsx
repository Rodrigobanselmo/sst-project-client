import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Popper,
  Paper,
  ClickAwayListener,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { assessmentPeriodCivilDate, civilDateDisplay } from '@v2/features/sst-operational/civil-date';
import { getHierarchyIdFromTreeId } from '../../utils/get-copy-hierarchy-destinations';
import { SstDateField } from '@v2/features/sst-operational/SstDateField';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import axios from 'axios';
import type { ITreeMapObject } from '../../interfaces';
import { GseLinkSymbol } from './GseLinkSymbol';
import { useGseVisualAssistance } from './GseVisualAssistance.context';
import {
  canReviewNode,
  linkVisual,
  REVIEW_COLORS,
  emptyIntegratedReview,
} from './gse-integrated-review.model';

export function GseAssistanceIndicator({ node }: { node: ITreeMapObject }) {
  const ctx = useGseVisualAssistance();
  const multiWorkspace = useOrgMultiWorkspaceMode();
  const { isAuthSuccess } = useAuthShow();
  const canEdit =
    !multiWorkspace &&
    isAuthSuccess({ permissions: [PermissionEnum.HOMO_GROUP], cruds: 'u' });
  const canDelete = isAuthSuccess({ permissions: [PermissionEnum.HOMO_GROUP], cruds: 'd' });
  const [ending, setEnding] = useState<'loading' | 'dated' | 'ordinary' | 'unavailable' | null>(null);
  const modeRequest = useRef(0);
  const closeEnding = () => {
    modeRequest.current += 1;
    setEnding(null);
  };
  const [historical, setHistorical] = useState<{ previousLinkId: number; expectedEnd: string } | null>(null);
  const [historicalAction, setHistoricalAction] = useState<'UNDO_END' | 'START_NEW_PERIOD' | null>(null);
  const [endDate, setEndDate] = useState('');
  const [validDate, setValidDate] = useState(true);
  const [endError, setEndError] = useState('');
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setAnchor(null);
    closeEnding();
    setHistorical(null);
  }, [ctx?.selectedGroupId, ctx?.companyId, ctx?.workspaceId, ctx?.active]);
  if (
    !ctx?.active ||
    !ctx.selectedGroupId ||
    !canReviewNode(node, ctx.workspaceId)
  )
    return null;
  const groupId = ctx.selectedGroupId,
    nodeId = String(node.id);
  const visual = linkVisual(
    ctx.stale ? emptyIntegratedReview() : ctx.review,
    ctx.nodes,
    ctx.groups,
    ctx.workspaceId,
    groupId,
    nodeId,
  );
  const groupRejected = ctx.review.newGroups.some(
    (g) => g.id === groupId && g.decision === 'rejected',
  );
  const disabled = ctx.stale || ctx.loading || !!ctx.persistenceBusy || groupRejected;
  const group = ctx.groups.find((group) => group.id === groupId);
  const manual = canEdit && !!group && !visual.change;
  const canAddDirect = manual && visual.kind === 'empty';
  const closedLink = canAddDirect && ctx.changeHistoricalLink
    ? group?.hierarchyOnHomogeneous
        ?.filter((link) => link.hierarchyId === getHierarchyIdFromTreeId(nodeId) && !link.deletedAt && link.endDate)
        .sort((left, right) => new Date(right.endDate).getTime() - new Date(left.endDate).getTime() || right.id - left.id)[0]
    : undefined;
  const closedDay = assessmentPeriodCivilDate(closedLink?.endDate)?.format('YYYY-MM-DD');
  const canEndDirect = manual && visual.kind === 'existing' && !!ctx.endDirectLink && !!ctx.directLinkRequiresEndDate;
  const requiresDate = ending === 'dated' || historicalAction === 'START_NEW_PERIOD';
  const finishLink = async () => {
    if (!manual || disabled) return;
    setEndError('');
    try {
      if (historical) {
        if (!ctx.changeHistoricalLink || !historicalAction) return;
        if (historicalAction === 'START_NEW_PERIOD' && (!validDate || !endDate || endDate < historical.expectedEnd)) return;
        await ctx.changeHistoricalLink(groupId, nodeId, historicalAction === 'UNDO_END'
          ? { ...historical, action: historicalAction }
          : { ...historical, action: historicalAction, startDate: endDate });
        setHistorical(null);
      } else {
        if (!ctx.endDirectLink) return;
        if (ending === 'dated') {
          if (!validDate || !endDate) return;
          await ctx.endDirectLink(groupId, nodeId, endDate);
        } else if (ending === 'ordinary' && canDelete) {
          await ctx.endDirectLink(groupId, nodeId);
        } else {
          return;
        }
        closeEnding();
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      if (ending === 'ordinary' && axios.isAxiosError(error) &&
          error.response?.data?.code === 'GSE_LINK_END_DATE_REQUIRED') {
        setEnding('dated');
      }
      setEndError(
        typeof message === 'string'
          ? message
          : error instanceof Error
            ? error.message
            : 'Não foi possível alterar o vínculo com o GSE.',
      );
    }
  };
  const color =
    visual.kind === 'existing' || visual.kind === 'inherited'
      ? REVIEW_COLORS.existing
      : visual.kind === 'add' || visual.kind === 'inherited-add'
        ? REVIEW_COLORS.add
        : visual.kind === 'remove'
          ? REVIEW_COLORS.remove
          : REVIEW_COLORS.neutral;
  const label =
    visual.kind === 'existing'
      ? 'Vínculo direto existente — mantido.'
      : visual.kind === 'inherited'
        ? 'Abrangência herdada — não é vínculo direto individual removível.'
        : visual.kind === 'add' || visual.kind === 'inherited-add'
          ? visual.kind === 'inherited-add'
            ? 'Abrangência sugerida por inclusão superior — não é vínculo direto individual.'
            : 'Inclusão direta sugerida.'
          : visual.kind === 'remove'
            ? 'Retirada de vínculo direto sugerida.'
            : 'Sem vínculo direto neste GSE.';
  const decision = visual.change
    ? ` Decisão: ${visual.change.decision === 'accepted' ? 'aceita' : visual.change.decision === 'rejected' ? 'rejeitada' : 'pendente'}.`
    : '';
  const reason =
    visual.change?.reason ||
    (canAddDirect
      ? closedDay
        ? 'Revisar encerramento anterior ou iniciar novo período.'
        : 'Adicionar vínculo direto e revisar antes de salvar.'
      : canEndDirect
        ? 'Revisar a remoção do vínculo direto.'
        : 'Clique para revisar uma proposta temporária, sem gravar.');
  const sourceIds = [
    ...new Set([...visual.sources, ...visual.proposedSources]),
  ];
  const dependency = sourceIds.length
    ? ` Abrangência superior: ${sourceIds.map((id) => ctx.nodes[id]?.label).join(', ')}.${visual.dependency ? ' Há retirada proposta no vínculo superior; revise essa dependência.' : ''}`
    : '';
  const title = ctx.stale
    ? 'Contexto alterado — analise novamente.'
    : groupRejected
      ? 'Criação rejeitada — reabra a proposta de GSE na lista.'
      : `${label} ${reason}${decision}${dependency}`;
  const close = () => setAnchor(null);
  const activate = (target: HTMLElement) => {
    if (!disabled && canAddDirect) {
      if (closedLink && closedDay) {
        setHistorical({ previousLinkId: closedLink.id, expectedEnd: closedDay });
        setHistoricalAction(null);
        setEndDate('');
        setValidDate(true);
        setEndError('');
      } else {
        ctx.propose(groupId, nodeId, 'ADD', true);
      }
      return;
    }
    if (!disabled && canEndDirect && ctx.directLinkRequiresEndDate) {
      setHistoricalAction(null);
      setEndDate('');
      setValidDate(true);
      setEndError('');
      setEnding('loading');
      const request = ++modeRequest.current;
      void ctx.directLinkRequiresEndDate().then(
        (dated) => {
          if (modeRequest.current === request) setEnding(dated ? 'dated' : 'ordinary');
        },
        () => {
          if (modeRequest.current !== request) return;
          setEnding('unavailable');
          setEndError('Não foi possível consultar a regra de remoção. Feche e tente novamente.');
        },
      );
      return;
    }
    setAnchor(target);
  };
  const focusSource = (id: string) => {
    document.getElementById(`node_card_${id}`)?.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth',
    });
    close();
  };
  const glyph =
    visual.kind === 'inherited' || visual.kind === 'inherited-add'
      ? '↑'
      : visual.kind === 'add'
        ? '●'
        : visual.kind === 'remove'
          ? '−'
          : visual.kind === 'existing'
            ? '●'
            : visual.change?.decision === 'rejected'
              ? '↺'
              : '+';
  return (
    <>
      <Tooltip title={anchor || ending || historical ? '' : title} arrow>
        <GseLinkSymbol
          kind={
            visual.kind === 'add' || visual.kind === 'inherited-add'
              ? 'add'
              : visual.kind === 'remove'
                ? 'remove'
                : visual.kind === 'existing' || visual.kind === 'inherited'
                  ? 'existing'
                  : 'neutral'
          }
          inherited={
            visual.kind === 'inherited' || visual.kind === 'inherited-add'
          }
          role="button"
          tabIndex={0}
          aria-label={`${node.label}: ${title}`}
          onClick={(e) => {
            e.stopPropagation();
            activate(e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              activate(e.currentTarget);
            }
          }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color.color,
            bgcolor:
              visual.kind === 'inherited' || visual.kind === 'inherited-add'
                ? 'transparent'
                : color.background,
            border: `2px ${visual.kind === 'inherited' || visual.kind === 'inherited-add' ? 'dashed' : 'solid'} ${color.color}`,
            fontSize: 14,
            fontWeight: 900,
            minWidth: 21,
            maxWidth: 21,
            minHeight: 21,
            maxHeight: 21,
            m: 0,
            position: 'relative',
            boxShadow:
              visual.change?.decision === 'pending'
                ? `0 0 0 2px ${color.background}`
                : undefined,
          }}
        >
          {glyph}
          {visual.change?.decision === 'accepted' && (
            <Box
              component="span"
              sx={{
                position: 'absolute',
                right: -7,
                top: -9,
                fontSize: 10,
                bgcolor: 'background.paper',
              }}
            >
              ✓
            </Box>
          )}
        </GseLinkSymbol>
      </Tooltip>
      <Popper
        open={!!anchor}
        anchorEl={anchor}
        placement="bottom-start"
        sx={{ zIndex: 1500 }}
      >
        <ClickAwayListener onClickAway={close}>
          <Paper elevation={6}>
            <Stack
              spacing={1}
              sx={{ p: 1.5, maxWidth: 330 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="subtitle2">{node.label}</Typography>
              <Typography variant="body2">{title}</Typography>
              {visual.change && (
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                  <Button
                    size="small"
                    disabled={disabled}
                    onClick={() => {
                      ctx.decide(visual.change!.id, 'accepted');
                      close();
                    }}
                  >
                    Aceitar sugestão
                  </Button>
                  <Button
                    size="small"
                    disabled={disabled}
                    onClick={() => {
                      ctx.decide(visual.change!.id, 'rejected');
                      close();
                    }}
                  >
                    Rejeitar sugestão
                  </Button>
                  <Button
                    size="small"
                    disabled={disabled}
                    onClick={() => {
                      ctx.decide(visual.change!.id, 'pending');
                      close();
                    }}
                  >
                    Reabrir decisão
                  </Button>
                </Stack>
              )}
              {!visual.change && !canEndDirect && visual.kind === 'existing' && (
                <Button
                  size="small"
                  disabled={disabled}
                  onClick={() => {
                    ctx.propose(groupId, nodeId, 'REMOVE');
                    close();
                  }}
                >
                  Propor retirada do vínculo direto
                </Button>
              )}
              {!visual.change && !canAddDirect &&
                (visual.kind === 'empty' ||
                  visual.kind === 'inherited' ||
                  visual.kind === 'inherited-add') && (
                  <Button
                    size="small"
                    disabled={disabled}
                    onClick={() => {
                      ctx.propose(groupId, nodeId, 'ADD');
                      close();
                    }}
                  >
                    Propor inclusão direta
                  </Button>
                )}
              {sourceIds.map((id) => (
                <Button key={id} size="small" onClick={() => focusSource(id)}>
                  Revisar vínculo superior: {ctx.nodes[id]?.label}
                </Button>
              ))}
              <Typography variant="caption">
                Revise as propostas no painel. Retiradas dependem da validação do PPP/eSocial.
              </Typography>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
      <Dialog
        open={!!ending || !!historical}
        onClose={() => {
          if (!ctx.persistenceBusy) {
            closeEnding();
            setHistorical(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{historical ? 'Vínculo encerrado' : ending === 'dated' ? 'Encerrar vínculo direto' : 'Remover vínculo direto'}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: '16px' }}>
            {historical
              ? `${node.label} teve o vínculo com este GSE encerrado em ${civilDateDisplay(historical.expectedEnd)}.`
              : ending === 'dated'
                ? `${node.label}. O vínculo com este GSE deixa de valer na data informada.`
                : ending === 'ordinary'
                  ? `${node.label} será desvinculado deste GSE. O cargo ou setor permanece no organograma.`
                  : node.label}
          </Typography>
          {historical && (
            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: '16px' }}>
              <Button
                variant={historicalAction === 'UNDO_END' ? 'contained' : 'outlined'}
                aria-pressed={historicalAction === 'UNDO_END'}
                disabled={ctx.persistenceBusy}
                onClick={() => { setHistoricalAction('UNDO_END'); setEndError(''); }}
              >
                Desfazer encerramento
              </Button>
              <Button
                variant={historicalAction === 'START_NEW_PERIOD' ? 'contained' : 'outlined'}
                aria-pressed={historicalAction === 'START_NEW_PERIOD'}
                disabled={ctx.persistenceBusy}
                onClick={() => { setHistoricalAction('START_NEW_PERIOD'); setEndError(''); }}
              >
                Iniciar novo período
              </Button>
            </Stack>
          )}
          {historical && historicalAction === 'UNDO_END' && (
            <Typography variant="body2">Confirme se o encerramento foi acidental e o vínculo deve voltar a valer desde o início original.</Typography>
          )}
          {ending === 'loading' && <Typography role="status">Consultando a regra de remoção…</Typography>}
          {ending === 'ordinary' && !canDelete && <Alert severity="warning">Você não tem permissão para remover este vínculo.</Alert>}
          {requiresDate && (
            <SstDateField
              key={historical ? 'start' : 'end'}
              id={historical ? 'gse-link-start-date' : 'gse-link-end-date'}
              label={historical ? 'Início do novo período' : 'Válido antes de'}
              value={endDate}
              onChange={setEndDate}
              onValidityChange={setValidDate}
              disabled={ctx.persistenceBusy}
            />
          )}
          {historical && historicalAction === 'START_NEW_PERIOD' && endDate && endDate < historical.expectedEnd && (
            <Alert severity="warning" sx={{ mt: '12px' }}>O início deve ser na data do encerramento anterior ou depois.</Alert>
          )}
          {endError && <Alert severity="error" sx={{ mt: '12px' }}>{endError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button disabled={ctx.persistenceBusy} onClick={() => { closeEnding(); setHistorical(null); }}>Cancelar</Button>
          <Button
            disabled={disabled || !manual || (historical ? !historicalAction : ending !== 'dated' && !(ending === 'ordinary' && canDelete)) ||
              (requiresDate && (!validDate || !endDate || (!!historical && endDate < historical.expectedEnd)))}
            onClick={finishLink}
          >
            {historical ? 'Confirmar alteração' : ending === 'dated' ? 'Confirmar encerramento' : 'Confirmar remoção'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
