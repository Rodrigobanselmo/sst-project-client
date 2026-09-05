import { Box, IconButton } from '@mui/material';

import { SIconEdit } from '@v2/assets/icons';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';

import { ActionPlanRecommendationTypeBadge } from '../ActionPlanRecommendationTypeBadge/ActionPlanRecommendationTypeBadge';

type ActionPlanRecommendationNameCellProps = {
  row: ActionPlanBrowseResultModel;
  canRename?: boolean;
  onRename?: (row: ActionPlanBrowseResultModel) => void;
};

export function ActionPlanRecommendationNameCell({
  row,
  canRename,
  onRename,
}: ActionPlanRecommendationNameCellProps) {
  return (
    <Box
      display="flex"
      alignItems="flex-start"
      width="100%"
      minWidth={0}
      gap={0.25}
    >
      <Box flex={1} minWidth={0}>
        <STextRow
          fontSize={13}
          tooltipMinLength={30}
          lineNumber={2}
          text={row.recommendation.name}
          startAddon={
            <ActionPlanRecommendationTypeBadge
              type={row.recommendation.type}
              variant="dot"
            />
          }
        />
      </Box>
      {canRename && (
        <STooltip title="Editar texto da recomendação" minLength={0}>
          <IconButton
            size="small"
            aria-label="Editar texto da recomendação"
            onClick={(event) => {
              event.stopPropagation();
              onRename?.(row);
            }}
            sx={{
              mt: '1px',
              p: 0.25,
              color: 'text.disabled',
              '&:hover': { color: 'text.secondary' },
            }}
          >
            <SIconEdit fontSize={14} />
          </IconButton>
        </STooltip>
      )}
    </Box>
  );
}
