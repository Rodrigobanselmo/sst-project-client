import React, { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';

import { hierarchyNodeVisualIdentity } from '../../constants/hierarchy-node-visual.constant';
import { resolveHierarchyLegendItems } from '../../utils/resolve-hierarchy-node-type-label';

export const HierarchyLegend: FC = () => {
  const typeLabels = useHierarchyTypeLabels();
  const legendItems = resolveHierarchyLegendItems(typeLabels);

  return (
    <SFlex
      aria-label="Legenda do organograma"
      sx={{
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        minWidth: 0,
        flex: '1 1 240px',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        border: '1px solid',
        borderColor: 'grey.200',
        pointerEvents: 'none',
      }}
    >
      {legendItems.map((item) => {
        const visual = hierarchyNodeVisualIdentity[item.type];

        return (
          <SFlex key={item.type} center gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '2px',
                backgroundColor: visual.headerBg,
                border: `1px solid ${visual.border}`,
                flexShrink: 0,
              }}
            />
            <SText
              color="text.light"
              fontSize={10}
              sx={{ lineHeight: 1, whiteSpace: 'nowrap' }}
            >
              {item.label}
            </SText>
          </SFlex>
        );
      })}
    </SFlex>
  );
};
