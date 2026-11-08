import { Box, Button, Typography } from '@mui/material';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';

import { hierarchyNodeVisualIdentity } from '../../constants/hierarchy-node-visual.constant';
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
      <Typography variant="body2" fontWeight={600}>
        Níveis visíveis
      </Typography>
      {legendItems.map(({ type, label }) => {
        const visual = hierarchyNodeVisualIdentity[type];
        const canHide = canHideHierarchyLevel(type);
        const visible = !hiddenLevels.has(type);
        const swatch = (
          <Box
            component="span"
            aria-hidden
            sx={{
              width: 16,
              height: 16,
              borderRadius: '3px',
              bgcolor: visual.headerBg,
              border: `2px solid ${visual.border}`,
              flexShrink: 0,
            }}
          />
        );
        const itemSx = {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 32,
          px: 3,
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
              bgcolor: visible ? 'background.paper' : 'transparent',
              borderColor: 'divider',
              borderStyle: visible ? 'solid' : 'dashed',
              textDecoration: visible ? 'none' : 'line-through',
            }}
          >
            {swatch}
            {label}
          </Button>
        ) : (
          <Box
            key={type}
            component="span"
            title="Este nível fica sempre visível"
            sx={itemSx}
          >
            {swatch}
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
