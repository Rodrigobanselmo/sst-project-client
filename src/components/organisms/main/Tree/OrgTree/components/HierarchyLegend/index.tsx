import React, { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import {
  hierarchyLegendItems,
  hierarchyNodeVisualIdentity,
} from '../../constants/hierarchy-node-visual.constant';

export const HierarchyLegend: FC = () => {
  return (
    <SFlex
      sx={{
        position: 'absolute',
        bottom: 56,
        left: 30,
        zIndex: 2,
        flexWrap: 'wrap',
        gap: 2,
        maxWidth: 380,
        px: 2.5,
        py: 1,
        borderRadius: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        border: '1px solid',
        borderColor: 'grey.200',
        pointerEvents: 'none',
      }}
    >
      {hierarchyLegendItems.map((item) => {
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
