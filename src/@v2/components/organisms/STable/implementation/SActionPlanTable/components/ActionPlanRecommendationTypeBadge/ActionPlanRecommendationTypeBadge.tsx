import { Box } from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { RecommendationTypeEnum } from '@v2/models/security/enums/recommendation-type.enum';
import { recommendationTypeHierarchyTooltip } from '@v2/models/security/translations/recommendation-type.translation';
import { getRecommendationTypeDisplay } from '../../maps/action-plan-recommendation-type-map';

export const ActionPlanRecommendationTypeBadge = ({
  type,
  variant = 'dot',
  size = 'sm',
}: {
  type: RecommendationTypeEnum;
  /** dot: marcador mínimo na tabela; badge: rótulo textual no modal */
  variant?: 'dot' | 'badge';
  size?: 'sm' | 'md';
}) => {
  const display = getRecommendationTypeDisplay(type);
  const tooltip = recommendationTypeHierarchyTooltip[type];

  if (variant === 'dot') {
    const dotSize = size === 'sm' ? 8 : 10;

    return (
      <STooltip title={tooltip} placement="top" minLength={0}>
        <Box
          component="span"
          aria-label={tooltip}
          sx={{
            width: dotSize,
            height: dotSize,
            minWidth: dotSize,
            borderRadius: '50%',
            bgcolor: display.borderColor,
            flexShrink: 0,
            display: 'inline-block',
            alignSelf: 'center',
          }}
        />
      </STooltip>
    );
  }

  return (
    <STooltip title={tooltip} placement="top" minLength={0}>
      <SFlex
        center
        flexShrink={0}
        px={size === 'sm' ? 3 : 4}
        py={size === 'sm' ? 0 : 1}
        width="fit-content"
        sx={{
          borderRadius: '4px',
          borderColor: display.borderColor,
          backgroundColor: display.backgroundColor,
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
      >
        <SText
          color={display.color}
          fontSize={size === 'sm' ? 10 : 11}
          fontWeight={display.fontWeight}
          lineNumber={1}
        >
          {display.label}
        </SText>
      </SFlex>
    </STooltip>
  );
};
