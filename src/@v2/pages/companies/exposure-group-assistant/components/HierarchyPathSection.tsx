import { Box, Stack, Typography } from '@mui/material';

import type { InterpretedRecommendation } from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

type PathStep = NonNullable<InterpretedRecommendation['hierarchyPath']>[number];

export function HierarchyPathSection({
  path,
  display,
}: {
  path?: PathStep[];
  display?: string;
}) {
  if (!path?.length && !display) return null;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Localização na estrutura organizacional
      </Typography>
      {path?.length ? (
        <Stack spacing={0.5}>
          {path.map((step) => (
            <Typography
              key={`${step.hierarchyId}-${step.depth}`}
              variant="body2"
              sx={{ pl: Math.min(step.depth, 6) * 1.5 }}
            >
              {step.typeLabel}: {step.name}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2">{display}</Typography>
      )}
    </Box>
  );
}
