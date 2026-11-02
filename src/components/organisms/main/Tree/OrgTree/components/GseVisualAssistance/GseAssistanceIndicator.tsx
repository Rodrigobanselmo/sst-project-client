import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Popper,
  Paper,
  ClickAwayListener,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
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
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setAnchor(null);
  }, [ctx?.selectedGroupId, ctx?.workspaceId, ctx?.active]);
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
  const disabled = ctx.stale || ctx.loading || groupRejected;
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
    'Clique para revisar uma proposta temporária, sem gravar.';
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
      <Tooltip title={title} arrow>
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
            setAnchor(e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setAnchor(e.currentTarget);
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
              {!visual.change && visual.kind === 'existing' && (
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
              {!visual.change &&
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
                Somente revisão visual. Retiradas dependerão da validação do
                PPP/eSocial e poderão exigir encerramento por data-fim.
              </Typography>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
