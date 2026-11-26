import { Box, Typography } from '@mui/material';
import {
  isActiveRecommendation,
  ResidualControlRecommendation,
} from '../../utils/calculateSuggestedResidualProbability.util';
import { recommendationGuidance } from '../../utils/recommendationGuidance.util';

/** Orientação visual: não integra o catálogo, o payload nem o Plano de Ação. */
export function RecommendationGuidance({ level, recommendations }: {
  level?: number;
  recommendations?: ResidualControlRecommendation[] | null;
}) {
  if ((recommendations ?? []).some(isActiveRecommendation)) return null;
  const message = recommendationGuidance(level);
  if (!message) return null;
  return (
    <Box role="note" sx={{ p: 4, mt: 4, mb: 4, border: '1px dashed', borderColor: 'divider', borderRadius: 1, bgcolor: 'action.hover', color: 'text.primary' }}>
      <Typography color="text.primary" variant="caption" component="div" fontWeight={600}>Orientação do sistema</Typography>
      <Typography color="text.primary" variant="caption" component="div" sx={{ mt: 2, lineHeight: 1.4 }}>{message}</Typography>
    </Box>
  );
}
