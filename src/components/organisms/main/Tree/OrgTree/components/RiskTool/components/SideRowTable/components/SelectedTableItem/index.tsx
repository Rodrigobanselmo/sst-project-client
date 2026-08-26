import React, { FC, useState } from 'react';

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { MissingRecTypeClassifyPopover } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/components/MissingRecTypeClassifyPopover';
import { RecTypeCategoryIcon } from 'components/organisms/tagSelects/RecSelect/RecSelectRecTypeAdornment';
import { resolveRecTypeVisualState } from 'components/organisms/tagSelects/RecSelect/resolve-rec-type-visual-state.util';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SInfoIcon } from 'assets/icons/SInfoIcon';

import { SelectedTableItemProps } from './types';

export const SelectedTableItem: FC<
  { children?: any } & SelectedTableItemProps
> = ({
  name,
  tooltip,
  handleRemove,
  isExpired,
  handleEdit,
  handleInfo,
  infoTooltip,
  showMissingTypeWarning,
  missingTypeTooltip,
  onQuickClassifyRecType,
  quickClassifyLoading,
  recType,
}) => {
  const [classifyPopoverOpen, setClassifyPopoverOpen] = useState(false);
  const recTypeVisual =
    recType !== undefined ? resolveRecTypeVisualState(recType) : null;
  const stackActionsOnEnd = recTypeVisual !== null;

  return (
    <STooltip
      title={tooltip || name}
      open={classifyPopoverOpen ? false : undefined}
      disableHoverListener={classifyPopoverOpen}
      disableFocusListener={classifyPopoverOpen}
      disableTouchListener={classifyPopoverOpen}
    >
      <SFlex
        sx={{
          border: '1px solid',
          borderColor: 'gray.400',
          backgroundColor: 'background.paper',
          borderStyle: 'dashed',
          borderRadius: 1,
          ...(isExpired ? { borderColor: 'error.main' } : {}),
          ...(showMissingTypeWarning ? { borderColor: 'warning.main' } : {}),
          ...(handleEdit ? { cursor: 'pointer' } : {}),
          ...(!handleRemove && !stackActionsOnEnd ? { pl: 5 } : {}),
        }}
        mt={4}
        align="center"
        onClick={() => handleEdit?.()}
      >
        {handleRemove && !stackActionsOnEnd && (
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
        {handleInfo && (
          <STooltip title={infoTooltip || 'Ver detalhe do CA'}>
            <SIconButton
              sx={{ maxWidth: 10, maxHeight: 10 }}
              onClick={(e) => {
                e.stopPropagation();
                handleInfo();
              }}
            >
              <Icon component={SInfoIcon} sx={{ fontSize: 14 }} />
            </SIconButton>
          </STooltip>
        )}
        {showMissingTypeWarning && onQuickClassifyRecType && (
          <MissingRecTypeClassifyPopover
            onClassify={onQuickClassifyRecType}
            loading={quickClassifyLoading}
            tooltipFallback={missingTypeTooltip}
            onOpenChange={setClassifyPopoverOpen}
          />
        )}
        {showMissingTypeWarning && !onQuickClassifyRecType && (
          <STooltip
            title={
              missingTypeTooltip ||
              'Classifique esta recomendação como Administrativa, Engenharia ou EPI para que ela seja considerada no cálculo da probabilidade residual.'
            }
          >
            <Icon
              component={WarningAmberRoundedIcon}
              sx={{
                fontSize: 15,
                color: 'warning.main',
                flexShrink: 0,
                mr: 0.25,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </STooltip>
        )}
        <SText
          lineNumber={2}
          variant="body2"
          sx={{
            ...(stackActionsOnEnd ? { flex: 1, minWidth: 0 } : {}),
            ...(isExpired ? { color: 'error.main' } : {}),
          }}
        >
          {name}
        </SText>
        {stackActionsOnEnd && recTypeVisual && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              gap: 0,
              ml: 0.25,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {recTypeVisual.kind === 'classified' && (
              <Box title={recTypeVisual.tooltip} sx={{ lineHeight: 0 }}>
                <RecTypeCategoryIcon recType={recTypeVisual.recType} fontSize={14} />
              </Box>
            )}
            {handleRemove && (
              <SIconButton
                sx={{ maxWidth: 10, maxHeight: 10, p: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <Icon component={SDeleteIcon} sx={{ fontSize: 12 }} />
              </SIconButton>
            )}
          </Box>
        )}
      </SFlex>
    </STooltip>
  );
};
