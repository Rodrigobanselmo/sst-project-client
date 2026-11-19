import { Box, Button, Typography, useTheme } from '@mui/material';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';

import { getHierarchyNodeVisual } from '../../constants/hierarchy-node-visual.constant';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { canHideHierarchyLevel } from '../../utils/project-visible-hierarchy';
import { resolveHierarchyLegendItems } from '../../utils/resolve-hierarchy-node-type-label';

export function HierarchyLegend({
  hiddenLevels,
  onToggle,
  onReset,
}: {
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
      {hiddenLevels.size > 0 && (
        <Button size="small" onClick={onReset} sx={{ textTransform: 'none' }}>
          Mostrar todos
        </Button>
      )}
    </Box>
  );
}
