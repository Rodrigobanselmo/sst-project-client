import { Box, Button, Tooltip, Typography, useTheme } from '@mui/material';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';

import { getHierarchyNodeVisual } from '../../constants/hierarchy-node-visual.constant';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { canHideHierarchyLevel } from '../../utils/project-visible-hierarchy';
import { resolveHierarchyLegendItems } from '../../utils/resolve-hierarchy-node-type-label';

import { MEMBERSHIP_FILTERS, MembershipFilter } from '../../utils/filter-hierarchy-membership';

export function HierarchyLegend({
  hiddenMemberships, onToggleMembership,
  hiddenLevels,
  onToggle,
  onReset,
}: {
  hiddenMemberships: ReadonlySet<MembershipFilter>;
  onToggleMembership: (key: MembershipFilter) => void;
  hiddenLevels: ReadonlySet<TreeTypeEnum>;
  onToggle: (type: TreeTypeEnum) => void;
  onReset: () => void;
}) {
  const theme = useTheme();
  const typeLabels = useHierarchyTypeLabels();
  const legendItems = resolveHierarchyLegendItems(typeLabels);

  return (
    <Box
      role="group"
      aria-label="Níveis visíveis do organograma"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 3,
        mx: 13,
        mt: 4,
        mb: 3,
      }}
    >
      <Typography variant="body2" fontWeight={600} color="text.primary">
        Níveis visíveis
      </Typography>
      {legendItems.map(({ type, label }) => {
        const visual = getHierarchyNodeVisual(type, theme.palette.mode);
        const canHide = canHideHierarchyLevel(type);
        const visible = !hiddenLevels.has(type);
        const itemSx = {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          minHeight: 26,
          height: 26,
          px: 4,
          py: 0,
          borderRadius: '999px',
          border: '1.5px solid',
          borderColor: visual.border,
          bgcolor: visible ? visual.background : 'transparent',
          borderStyle: visible ? 'solid' : 'dashed',
          textDecoration: visible ? 'none' : 'line-through',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          fontSize: 13,
          lineHeight: 1.2,
          color: visible ? 'text.primary' : 'text.secondary',
          textTransform: 'none',
        } as const;

        return canHide ? (
          <Button
            key={type}
            variant="outlined"
            aria-pressed={visible}
            onClick={() => onToggle(type)}
            sx={{
              ...itemSx,
              '&:hover': {
                bgcolor: visual.background,
                borderColor: visual.border,
                boxShadow: `0 0 0 1px ${visual.border}`,
              },
            }}
          >
            {label}
          </Button>
        ) : (
          <Box
            key={type}
            component="span"
            title="Este nível fica sempre visível"
            sx={itemSx}
          >
            {label}
          </Box>
        );
      })}
      <Box role="group" aria-label="Visibilidade por vínculo salvo" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
        <Typography variant="caption" color="text.secondary">Vínculos visíveis</Typography>
        {MEMBERSHIP_FILTERS.map(({ key, label }) => {
          const visible = !hiddenMemberships.has(key);
          return <Tooltip key={key} title={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLocaleLowerCase('pt-BR')}. Considera vínculos salvos e herdados; mantém unidades com cargos ainda visíveis.`}>
            <Button size="small" variant="outlined" aria-pressed={visible} onClick={() => onToggleMembership(key)}
              sx={{ height: 26, borderRadius: '999px', px: 4, fontSize: 12, textTransform: 'none', color: visible ? 'text.primary' : 'text.secondary', borderColor: 'divider', borderStyle: visible ? 'solid' : 'dashed', textDecoration: visible ? 'none' : 'line-through' }}>{label}</Button>
          </Tooltip>;
        })}
      </Box>
      {(hiddenLevels.size > 0 || hiddenMemberships.size > 0) && (
        <Button size="small" onClick={onReset} sx={{ textTransform: 'none' }}>
          Mostrar todos
        </Button>
      )}
    </Box>
  );
}
