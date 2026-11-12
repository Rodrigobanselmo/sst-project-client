import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, TextField, Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { stringNormalize } from 'core/utils/strings/stringNormalize';
import {
  isOrganizationalDescendant,
  type OrganizationalGroup,
} from '../helpers/organizationalGrouping';

export function OrganizationalGroupingDialog({
  groups, selectedIds, counts, onApply, onClose,
  title = 'Selecionar grupos da estrutura organizacional', showRespondents = true,
}: {
  groups: OrganizationalGroup[];
  title?: string;
  showRespondents?: boolean;
  selectedIds: string[];
  counts: Map<string, number> | null;
  onApply: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(() => new Set(selectedIds));
  const [expanded, setExpanded] = useState(() => new Set(
    groups.filter((group) => selectedIds.some((id) => isOrganizationalDescendant(id, group.id)))
      .map((group) => group.id),
  ));
  const [search, setSearch] = useState('');
  const children = useMemo(() => {
    const byParent = new Map<string | null, OrganizationalGroup[]>();
    for (const group of groups) {
      const siblings = byParent.get(group.parentId) ?? [];
      siblings.push(group);
      byParent.set(group.parentId, siblings);
    }
    return byParent;
  }, [groups]);

  const query = stringNormalize(search.trim());
  const matchingIds = useMemo(() => {
    if (!query) return null;
    const byId = new Map(groups.map((group) => [group.id, group]));
    const ids = new Set<string>();
    for (const group of groups) {
      if (!stringNormalize(group.name).includes(query)) continue;
      let current: OrganizationalGroup | undefined = group;
      while (current && !ids.has(current.id)) {
        ids.add(current.id);
        current = current.parentId ? byId.get(current.parentId) : undefined;
      }
    }
    return ids;
  }, [groups, query]);

  function renderRows(parentId: string | null, depth: number, inherited: boolean): React.ReactNode {
    return (children.get(parentId) ?? []).filter((group) => !matchingIds || matchingIds.has(group.id)).map((group) => {
      const checked = selected.has(group.id);
      const partial = !checked && [...selected].some((id) => isOrganizationalDescendant(id, group.id));
      const hasChildren = children.has(group.id);
      const open = hasChildren && (expanded.has(group.id) || !!query);
      const respondents = group.participantIds.size;
      const total = counts?.get(group.id);
      return (
        <Box key={group.id}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, minHeight: 36,
            pl: depth * 3, pr: 2, bgcolor: checked ? 'action.selected' : undefined,
            '&:hover': { bgcolor: 'action.hover' },
          }}>
            {hasChildren ? (
              <IconButton
                size="small" disabled={!!query} aria-expanded={open}
                aria-label={`${open ? 'Recolher' : 'Expandir'} ${group.title}`}
                onClick={() => setExpanded((current) => {
                  const next = new Set(current);
                  if (next.has(group.id)) next.delete(group.id);
                  else next.add(group.id);
                  return next;
                })}
              >
                {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
              </IconButton>
            ) : <Box sx={{ width: 34, flexShrink: 0 }} />}
            <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, cursor: inherited ? 'default' : 'pointer' }}>
              <Checkbox
                size="small" checked={checked || inherited} indeterminate={partial}
                disabled={inherited} inputProps={{ 'aria-label': group.name }}
                onChange={() => setSelected((current) => {
                  const next = new Set([...current].filter((id) => !isOrganizationalDescendant(id, group.id)));
                  if (checked) next.delete(group.id);
                  else next.add(group.id);
                  return next;
                })}
              />
              <Typography variant="caption" color="text.secondary">{group.typeLabel}</Typography>
              <Typography variant="body2" color="text.primary">{group.title}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
              {showRespondents && `${respondents} ${respondents === 1 ? 'respondente' : 'respondentes'}${total !== undefined && total >= respondents ? ` de ${total}` : ''}`}
              {inherited && (showRespondents ? ' · abrangido' : 'Abrangido')}
            </Typography>
          </Box>
          {open && renderRows(group.id, depth + 1, inherited || checked)}
        </Box>
      );
    });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ color: 'text.primary' }}>{title}</DialogTitle>
      <DialogContent dividers>
        <TextField fullWidth size="small" label="Pesquisar por nome" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
          <Button size="small" onClick={() => setExpanded(new Set(groups.map(({ id }) => id)))}>Expandir todos</Button>
          <Button size="small" disabled={!!query} onClick={() => setExpanded(new Set())}>Recolher todos</Button>
          <Button size="small" color="error" disabled={!selected.size} onClick={() => setSelected(new Set())}>Limpar seleção</Button>
        </Box>
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: '55vh', overflow: 'auto' }}>
          {(!groups.length || matchingIds?.size === 0) ? <Typography color="text.primary" sx={{ p: 3 }}>Nenhum grupo encontrado.</Typography> : renderRows(null, 0, false)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto', ml: 1 }}>{selected.size} {selected.size === 1 ? 'grupo selecionado' : 'grupos selecionados'}</Typography>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => onApply([...selected])}>Aplicar seleção</Button>
      </DialogActions>
    </Dialog>
  );
}
