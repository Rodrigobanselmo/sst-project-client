import React, { FC, useState } from 'react';

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { MissingRecTypeClassifyPopover } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/components/MissingRecTypeClassifyPopover';

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
}) => {
  const [classifyPopoverOpen, setClassifyPopoverOpen] = useState(false);

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
          ...(!handleRemove ? { pl: 5 } : {}),
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
            ...(isExpired ? { color: 'error.main' } : {}),
          }}
        >
          {name}
        </SText>
      </SFlex>
    </STooltip>
  );
};
