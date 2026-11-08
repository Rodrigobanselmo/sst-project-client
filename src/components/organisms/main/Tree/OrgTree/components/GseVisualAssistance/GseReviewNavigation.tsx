import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { selectGhoData } from 'store/reducers/hierarchy/ghoSlice';
import { selectAllHierarchyTreeNodes, setEditNodes } from 'store/reducers/hierarchy/hierarchySlice';
import { explicitGhoSelectionTreeIds } from '../../utils/explicit-gho-selection-tree-ids.util';
import { useGseVisualAssistance } from './GseVisualAssistance.context';
import { environmentLinkNavigation, reviewNavigation, focusReviewRegion } from './gse-review-navigation';

export function GseReviewNavigation({
  containerRef,
  onChangeZoom,
  environmentWorkspaceId,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onChangeZoom: (scale: number) => void;
  environmentWorkspaceId?: string;
}) {
  const ctx = useGseVisualAssistance();
  const treeNodes = useAppSelector(selectAllHierarchyTreeNodes);
  const selectedEnvironment = useAppSelector(selectGhoData);
  const environment = !ctx?.active && environmentWorkspaceId &&
    selectedEnvironment?.type === HomoTypeEnum.ENVIRONMENT
      ? selectedEnvironment
      : null;
  const mode = ctx?.active ? 'gse' : environment ? 'environment' : null;
  const selectedId = ctx?.active ? ctx.selectedGroupId : environment?.id;
  const nodes = ctx?.active ? ctx.nodes : treeNodes;
  const slotId = mode === 'environment' ? 'environment-link-navigation-slot' : 'gse-review-navigation-slot';
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(mode ? document.getElementById(slotId) : null);
  }, [mode, slotId]);
  const dispatch = useAppDispatch();
  const saved = useRef<
    Map<
      string,
      { id: string; expand?: boolean; searchExpand?: boolean; hide?: boolean }
    >
  >(new Map());
  const [position, setPosition] = useState(0);
  const [message, setMessage] = useState('');
  const highlighted = useRef<HTMLElement[]>([]);
  const frameSequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { targets, ancestors } = environment && environmentWorkspaceId
    ? environmentLinkNavigation(nodes, explicitGhoSelectionTreeIds(environment), environmentWorkspaceId)
    : ctx?.active && ctx.selectedGroupId
      ? reviewNavigation(
          ctx.nodes,
          ctx.review,
          ctx.workspaceId,
          ctx.selectedGroupId,
        )
      : { targets: [], ancestors: [] };
  const environmentTargets = environment ? JSON.stringify(targets) : undefined;
  const navigate = (index: number) => {
    if (!targets.length) {
      setMessage(
        'Nenhum vínculo localizado neste estabelecimento.',
      );
      return;
    }
    const reveal = [...new Set([...ancestors, ...targets])];
    reveal.forEach((id) => {
      const n = nodes[id];
      if (!saved.current.has(id))
        saved.current.set(id, {
          id,
          expand: n.expand,
          searchExpand: n.searchExpand,
          hide: n.hide,
        });
    });
    // Redux presentation state only; no hierarchy action/service that persists.
    dispatch(
      setEditNodes(
        reveal.map((id) => ({
          id,
          expand: true,
          searchExpand: true,
          hide: false,
        })),
      ),
    );
    setPosition(index);
    setMessage(
      `Vínculo ${index + 1} de ${targets.length}. Use Anterior e Próximo para percorrer a revisão.`,
    );
    const c = containerRef.current;
    if (c && c.getBoundingClientRect().width / c.offsetWidth < 0.75)
      onChangeZoom(0.85);
    const sequence = ++frameSequence.current;
    highlighted.current.forEach((e) => {
      e.style.outline = '';
      e.style.outlineOffset = '';
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (sequence !== frameSequence.current) return;
        const visibleTargets = environment
          ? [targets[index]]
          : [targets[index], ...targets.filter((_, i) => i !== index)];
        const elements = visibleTargets
          .map((id) => document.getElementById(`node_card_${id}`))
          .filter((e): e is HTMLElement => !!e);
        if (containerRef.current)
          focusReviewRegion(
            containerRef.current,
            elements,
            document.getElementById(environment ? 'environment-floating-panel' : 'gse-floating-panel'),
          );
        highlighted.current = elements;
        elements.forEach((e) => {
          e.style.outline = '2px solid #3478C0';
          e.style.outlineOffset = '4px';
        });
        clearTimeout(timer.current);
        timer.current = setTimeout(
          () =>
            elements.forEach((e) => {
              e.style.outline = '';
              e.style.outlineOffset = '';
            }),
          2800,
        );
      }),
    );
  };
  const previousMode = useRef(mode);
  useEffect(() => {
    if (previousMode.current !== mode) {
      previousMode.current = mode;
      frameSequence.current++;
      clearTimeout(timer.current);
      highlighted.current.forEach((e) => {
        e.style.outline = '';
        e.style.outlineOffset = '';
      });
      if (saved.current.size)
        dispatch(
          setEditNodes(
            [...saved.current.values()].filter((n) => nodes[n.id]),
          ),
        );
      saved.current.clear();
      setMessage('');
    }
    // Restore the captured presentation state only when leaving the panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dispatch]);
  useEffect(() => {
    if (ctx?.active && ctx.navigationRequest?.groupId === ctx.selectedGroupId)
      navigate(0);
    // Only explicit selection requests trigger positioning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.navigationRequest, ctx?.active]);
  useEffect(() => {
    if (environment) navigate(0);
    // Tree expansion and manual movement do not restart navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment?.id, environmentWorkspaceId, environmentTargets]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  if (!mode || !selectedId || !slot || slot.id !== slotId) return null;
  return createPortal(
    <GseNavigationControls
      count={targets.length}
      position={position}
      message={message}
      label={environment ? 'Navegação dos vínculos do ambiente selecionado' : undefined}
      previous={() =>
        navigate((position - 1 + targets.length) % targets.length)
      }
      next={() => navigate((position + 1) % targets.length)}
    />,
    slot,
  );
}
/** Presentation only; the existing traversal, expansion and positioning stay above. */
export function GseNavigationControls({
  count,
  position,
  previous,
  next,
  message,
  label = 'Navegação dos vínculos do GSE selecionado',
}: {
  count: number;
  position: number;
  previous: () => void;
  next: () => void;
  message?: string;
  label?: string;
}) {
  if (count < 2) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
      }}
      aria-label={label}
    >
      <Tooltip title="Vínculo anterior">
        <IconButton
          size="small"
          aria-label="Vínculo anterior"
          onClick={previous}
        >
          <span style={{ fontSize: 14 }}>◀</span>
        </IconButton>
      </Tooltip>
      <Typography
        variant="caption"
        color="text.primary"
        role="status"
        title={message}
      >
        Vínculo {Math.min(position + 1, count)} de {count}
      </Typography>
      <Tooltip title="Próximo vínculo">
        <IconButton size="small" aria-label="Próximo vínculo" onClick={next}>
          <span style={{ fontSize: 14 }}>▶</span>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
