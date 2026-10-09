import React, { useEffect, useMemo, useRef, useState } from 'react';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, Button, Checkbox, TextField } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import {
  buildHierarchyLinkTreeModel,
  expandHierarchyLinkSearchPaths,
  HierarchyLinkTreeNode,
  HierarchyLinkTreeRow,
  HierarchyLinkVisualState,
  resolveHierarchyLinkTreeVisibility,
} from './hierarchy-link-tree.util';

const ROW_HEIGHT = 32;

type HierarchyLinkTreeProps = {
  nodes: HierarchyLinkTreeNode[];
  modalSelectIds: string[];
  workspaceId: string;
  typeLabels?: Partial<Record<string, string>>;
  onToggle: (nodeId: string, visualState: HierarchyLinkVisualState) => void;
  onEmployeeAdd?: () => void;
  onClearWorkspace?: () => void;
  onRestoreSelection?: () => void;
  renderRowEnd?: (nodeId: string) => React.ReactNode;
};

function rowDomId(id: string) {
  return `hierarchy-link-tree-${id}`;
}

export function HierarchyLinkTree({
  nodes,
  modalSelectIds,
  workspaceId,
  typeLabels,
  onToggle,
  onEmployeeAdd,
  onClearWorkspace,
  onRestoreSelection,
  renderRowEnd,
}: HierarchyLinkTreeProps) {
  const [search, setSearch] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const rowsRef = useRef<HierarchyLinkTreeRow[]>([]);

  useEffect(() => {
    setSearch('');
    setCollapsedIds([]);
    setFocusedId(null);
  }, [workspaceId]);

  useEffect(() => {
    setCollapsedIds((current) =>
      expandHierarchyLinkSearchPaths(rowsRef.current, current, search),
    );
  }, [search]);

  const model = useMemo(
    () =>
      buildHierarchyLinkTreeModel({
        nodes,
        modalSelectIds,
        workspaceId,
        typeLabels,
      }),
    [modalSelectIds, nodes, typeLabels, workspaceId],
  );
  rowsRef.current = model.rows;

  const visibility = useMemo(
    () =>
      resolveHierarchyLinkTreeVisibility({
        rows: model.rows,
        collapsedIds,
        search,
      }),
    [collapsedIds, model.rows, search],
  );

  const expanded = useMemo(
    () => new Set(visibility.expandedIds),
    [visibility.expandedIds],
  );

  const focusRow = (row?: HierarchyLinkTreeRow) => {
    if (!row) return;
    setFocusedId(row.id);
    requestAnimationFrame(() => {
      document.getElementById(rowDomId(row.id))?.focus();
    });
  };

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const onRowKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    row: HierarchyLinkTreeRow,
    index: number,
  ) => {
    const rows = visibility.visibleRows;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusRow(rows[index + 1]);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusRow(rows[index - 1]);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      focusRow(rows[0]);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusRow(rows[rows.length - 1]);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (row.hasChildren && !expanded.has(row.id)) {
        toggleCollapsed(row.id);
        return;
      }
      focusRow(rows.find((item) => item.parentId === row.id));
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (row.hasChildren && expanded.has(row.id)) {
        toggleCollapsed(row.id);
        return;
      }
      if (row.parentId) focusRow(rows.find((item) => item.id === row.parentId));
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (row.selectable) onToggle(row.id, row.visualState);
    }
  };

  const activeFocusId =
    focusedId && visibility.visibleRows.some((row) => row.id === focusedId)
      ? focusedId
      : visibility.visibleRows[0]?.id;

  return (
    <Box mt={2}>
      <TextField
        size="small"
        fullWidth
        value={search}
        placeholder="Pesquisar por nome..."
        onChange={(event) => setSearch(event.target.value)}
        inputProps={{ 'aria-label': 'Pesquisar por nome na hierarquia' }}
        sx={{
          mb: 1,
          '& .MuiInputBase-root': { minHeight: 36 },
        }}
      />
      <SFlex align="center" gap={1} mb={1} flexWrap="wrap">
        <Button
          size="small"
          onClick={() => setCollapsedIds([])}
          sx={{ minHeight: 28, py: 0, textTransform: 'none' }}
        >
          Expandir todos
        </Button>
        <Button
          size="small"
          onClick={() =>
            setCollapsedIds(model.rows.filter((row) => row.hasChildren).map((row) => row.id))
          }
          sx={{ minHeight: 28, py: 0, textTransform: 'none' }}
        >
          Recolher todos
        </Button>
        {onEmployeeAdd && (
          <STagButton
            tooltipTitle="Criar cargo desenvolvido"
            text={'Funcionários'}
            large
            onClick={onEmployeeAdd}
          />
        )}
        {onRestoreSelection && (
          <Button
            size="small"
            onClick={onRestoreSelection}
            sx={{ minHeight: 28, py: 0, textTransform: 'none' }}
          >
            Editar ativos
          </Button>
        )}
        {onClearWorkspace && (
          <Button
            size="small"
            color="error"
            onClick={onClearWorkspace}
            sx={{ minHeight: 28, py: 0, textTransform: 'none' }}
          >
            Limpar seleção
          </Button>
        )}
        <SText fontSize={13} color="text.secondary" sx={{ ml: 'auto' }}>
          {model.summary}
        </SText>
      </SFlex>
      <Box
        role="tree"
        aria-label="Hierarquia da empresa"
        sx={{
          maxHeight: 'calc(95vh - 320px)',
          minHeight: 180,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        {model.rows.length === 0 && (
          <SText fontSize={13} color="text.secondary" sx={{ px: 1.5, py: 1 }}>
            Nenhuma estrutura neste estabelecimento.
          </SText>
        )}
        {model.rows.length > 0 && visibility.visibleRows.length === 0 && (
          <SText fontSize={13} color="text.secondary" sx={{ px: 1.5, py: 1 }}>
            Nenhum resultado para a pesquisa.
          </SText>
        )}
        {visibility.visibleRows.map((row, index) => {
          const isOpen = expanded.has(row.id);
          const checked = row.visualState === 'explicit';
          const indeterminate = row.visualState === 'partial';
          const stateLabel = {
            available: 'disponível',
            explicit: 'selecionado',
            partial: 'parcialmente selecionado',
            inherited: 'abrangido por herança',
            contained: 'incluído no vínculo do ancestral',
          }[row.visualState];
          return (
            <STooltip key={row.id} title={row.tooltip} withWrapper>
              <Box
                id={rowDomId(row.id)}
                role="treeitem"
                aria-level={row.depth + 1}
                aria-expanded={row.hasChildren ? isOpen : undefined}
                aria-checked={indeterminate ? 'mixed' : checked}
                aria-selected={checked}
                aria-disabled={!row.selectable}
                aria-label={`${row.typeLabel} ${row.name}, ${stateLabel}`}
                tabIndex={row.id === activeFocusId ? 0 : -1}
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest('[data-tree-expand], [data-tree-ignore]')) return;
                  if (row.selectable) onToggle(row.id, row.visualState);
                }}
                onKeyDown={(event) => onRowKeyDown(event, row, index)}
                onFocus={() => setFocusedId(row.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  minHeight: ROW_HEIGHT,
                  height: ROW_HEIGHT,
                  pl: 1 + row.depth * 2,
                  pr: 1,
                  cursor: row.selectable ? 'pointer' : 'default',
                  bgcolor: checked ? 'action.selected' : 'transparent',
                  color:
                    row.visualState === 'inherited' || row.visualState === 'contained'
                      ? 'text.secondary'
                      : 'text.primary',
                  '&:hover': { bgcolor: checked ? 'action.selected' : 'action.hover' },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: -2,
                  },
                }}
              >
                {row.hasChildren ? (
                  <Box
                    component="button"
                    type="button"
                    data-tree-expand
                    aria-label={isOpen ? `Recolher ${row.name}` : `Expandir ${row.name}`}
                    tabIndex={-1}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCollapsed(row.id);
                    }}
                    sx={{
                      width: 22,
                      height: 22,
                      p: 0,
                      border: 0,
                      bgcolor: 'transparent',
                      color: 'text.secondary',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <KeyboardArrowRightIcon
                      sx={{
                        fontSize: 18,
                        transform: isOpen ? 'rotate(90deg)' : 'none',
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ width: 22, flexShrink: 0 }} />
                )}
                {row.selectable ? (
                  <Checkbox
                    size="small"
                    checked={checked}
                    indeterminate={indeterminate}
                    tabIndex={-1}
                    inputProps={{
                      'aria-hidden': true,
                      tabIndex: -1,
                    }}
                    sx={{ p: 0.25, pointerEvents: 'none' }}
                  />
                ) : (
                  <Box
                    aria-hidden
                    sx={{
                      width: 16,
                      height: 16,
                      mx: '5px',
                      flexShrink: 0,
                      borderRadius: row.visualState === 'inherited' ? '50%' : '2px',
                      border: '2px solid',
                      borderColor: 'text.disabled',
                      bgcolor:
                        row.visualState === 'inherited' ? 'action.selected' : 'transparent',
                    }}
                  />
                )}
                <SText
                  fontSize={11}
                  color="text.secondary"
                  noBreak
                  sx={{ width: 108, flexShrink: 0 }}
                >
                  {row.typeLabel}
                </SText>
                <SText
                  fontSize={13}
                  noBreak
                  color={
                    row.visualState === 'inherited' || row.visualState === 'contained'
                      ? 'text.secondary'
                      : 'text.primary'
                  }
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  {row.name}
                </SText>
                {row.visualState === 'inherited' && (
                  <SText fontSize={11} color="text.secondary" noBreak>
                    abrangido
                  </SText>
                )}
                {row.visualState === 'contained' && (
                  <SText fontSize={11} color="text.secondary" noBreak>
                    incluído
                  </SText>
                )}
                {row.visualState === 'partial' && (
                  <SText fontSize={11} color="text.secondary" noBreak>
                    parcial
                  </SText>
                )}
                {renderRowEnd && <Box data-tree-ignore>{renderRowEnd(row.id)}</Box>}
              </Box>
            </STooltip>
          );
        })}
      </Box>
    </Box>
  );
}
