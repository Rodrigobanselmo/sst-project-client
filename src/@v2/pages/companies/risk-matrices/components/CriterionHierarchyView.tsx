import { FC } from 'react';

import { Box, Typography } from '@mui/material';

import { parseCriterionHierarchy } from '../utils/risk-matrix-criteria-display.util';

export const CriterionHierarchyView: FC<{ criterion: string }> = ({
  criterion,
}) => {
  let nodes: ReturnType<typeof parseCriterionHierarchy> = [];
  try {
    nodes = parseCriterionHierarchy(criterion ?? '');
  } catch {
    return (
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
        {criterion}
      </Typography>
    );
  }

  if (nodes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sem critério publicado para este nível.
      </Typography>
    );
  }

  return (
    <Box>
      {nodes.map((node, index) => {
        if (node.kind === 'spacer') {
          return <Box key={`spacer-${index}`} sx={{ height: 8 }} />;
        }

        if (node.kind === 'heading') {
          return (
            <Typography
              key={`heading-${index}`}
              variant="body2"
              fontWeight={700}
              sx={{ mt: node.depth === 0 ? 1 : 0.75, pl: node.depth * 1.5 }}
            >
              {node.text}
            </Typography>
          );
        }

        return (
          <Typography
            key={`body-${index}`}
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              mt: node.depth === 0 ? 1 : 0,
              pl: node.depth === 0 ? 0 : 1.5 + node.depth * 1.25,
              color: 'text.primary',
            }}
          >
            {node.text}
          </Typography>
        );
      })}
    </Box>
  );
};
