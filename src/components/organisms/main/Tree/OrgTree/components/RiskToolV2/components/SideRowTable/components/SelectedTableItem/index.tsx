import React, { FC, useMemo } from 'react';

import { Box, Icon, Typography } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import palette from 'configs/theme/palette';

import { getPlanStatusTooltipDetails } from '../../../../utils/characterization-action-plan-visual';

import { SelectedTableItemProps } from './types';

const TOOLTIP_TEXT_MAIN = 'rgba(255, 255, 255, 0.94)';
const TOOLTIP_TEXT_MUTED = 'rgba(255, 255, 255, 0.72)';

export const SelectedTableItem: FC<
  { children?: any } & SelectedTableItemProps
> = ({
  name,
  tooltip,
  handleRemove,
  isExpired,
  handleEdit,
  itemTintSx,
  planStatus,
  planTooltipStatus,
  planDeleteBlockedHint,
  showPlanDerivedTransformedNote,
}) => {
  const { tooltipTitle, tooltipSurfaceSx } = useMemo(() => {
    const tooltipSurfaceSxBase = {
      maxWidth: 360,
      px: 1.25,
      py: 1,
      bgcolor: palette.gray[800],
      color: TOOLTIP_TEXT_MAIN,
      border: `1px solid ${palette.gray[700]}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      '& .MuiTypography-root': {
        fontFamily: 'inherit',
      },
    };

    const primary = tooltip || name;
    const statusForTooltip = planTooltipStatus ?? planStatus;
    const statusExtras = getPlanStatusTooltipDetails(statusForTooltip);
    if (!statusExtras) {
      if (planDeleteBlockedHint) {
        return {
          tooltipTitle: (
            <Box sx={{ maxWidth: 300, py: 0.35, color: TOOLTIP_TEXT_MAIN }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  mb: 1,
                  lineHeight: 1.45,
                  fontWeight: 500,
                  color: TOOLTIP_TEXT_MAIN,
                }}
              >
                {primary}
              </Typography>
              <Typography
                variant="caption"
                component="div"
                sx={{ color: TOOLTIP_TEXT_MUTED, lineHeight: 1.45 }}
              >
                {planDeleteBlockedHint}
              </Typography>
            </Box>
          ),
          tooltipSurfaceSx: tooltipSurfaceSxBase,
        };
      }
      return { tooltipTitle: primary, tooltipSurfaceSx: undefined };
    }
    return {
      tooltipTitle: (
        <Box
          sx={{
            maxWidth: 300,
            py: 0.35,
            color: TOOLTIP_TEXT_MAIN,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              mb: 1.25,
              lineHeight: 1.45,
              fontWeight: 500,
              color: TOOLTIP_TEXT_MAIN,
            }}
          >
            {primary}
          </Typography>
          <Typography
            component="div"
            variant="caption"
            sx={{
              color: TOOLTIP_TEXT_MUTED,
              mb: 0.65,
              display: 'block',
              letterSpacing: 0.02,
            }}
          >
            Status no plano de ação
          </Typography>
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              px: 1.1,
              py: 0.4,
              borderRadius: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              lineHeight: 1.35,
              letterSpacing: 0.02,
              color: statusExtras.chipTextColor,
              backgroundColor: statusExtras.chipBackgroundColor,
            }}
          >
            {statusExtras.statusLabel}
          </Box>
          {(showPlanDerivedTransformedNote !== undefined
            ? !!statusExtras.showTransformedNote &&
              showPlanDerivedTransformedNote
            : statusExtras.showTransformedNote) ? (
            <Typography
              variant="caption"
              component="div"
              sx={{
                mt: 1.1,
                color: TOOLTIP_TEXT_MUTED,
                lineHeight: 1.45,
              }}
            >
              Recomendação transformada em medida de controle existente.
            </Typography>
          ) : null}
          {planDeleteBlockedHint ? (
            <Typography
              variant="caption"
              component="div"
              sx={{
                mt: 1.1,
                color: TOOLTIP_TEXT_MUTED,
                lineHeight: 1.45,
              }}
            >
              {planDeleteBlockedHint}
            </Typography>
          ) : null}
        </Box>
      ),
      tooltipSurfaceSx: tooltipSurfaceSxBase,
    };
  }, [
    name,
    planDeleteBlockedHint,
    planStatus,
    planTooltipStatus,
    showPlanDerivedTransformedNote,
    tooltip,
  ]);

  return (
    <STooltip
      title={tooltipTitle}
      componentsProps={
        tooltipSurfaceSx
          ? {
              tooltip: {
                sx: tooltipSurfaceSx,
              },
            }
          : undefined
      }
    >
      <SFlex
        sx={{
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: 'gray.400',
          backgroundColor: 'background.paper',
          borderRadius: 1,
          ...(handleEdit ? { cursor: 'pointer' } : {}),
          ...(!handleRemove ? { pl: 5 } : {}),
          ...itemTintSx,
          ...(isExpired ? { borderColor: 'error.main' } : {}),
        }}
        mt={4}
        align="center"
        onClick={() => handleEdit?.()}
      >
        {handleRemove && (
          <SIconButton
            sx={{ maxWidth: 10, maxHeight: 10 }}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
          >
            <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
          </SIconButton>
        )}
        <SText
          lineNumber={2}
          variant="body2"
          sx={{
            ...(isExpired ? { color: 'error.main' } : {}),
          }}
        >
          {name}
        </SText>
      </SFlex>
    </STooltip>
  );
};
