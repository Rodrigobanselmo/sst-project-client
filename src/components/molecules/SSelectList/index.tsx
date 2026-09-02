import { FC } from 'react';

import { Checkbox } from '@mui/material';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SCloseIcon from 'assets/icons/SCloseIcon';

import { STBoxContainer, STBoxItem } from './styles';
import { SSelectButtonProps } from './types';

export const SSelectList: FC<{ children?: any } & SSelectButtonProps> = ({
  disabled,
  text,
  label,
  active,
  tooltipText,
  tooltipMinLength = 15,
  hideCheckbox,
  activeRemove,
  endIcon,
  startContent,
  textNoBreak,
  labelSx,
  ...props
}) => {
  return (
    <STooltip withWrapper minLength={tooltipMinLength} title={tooltipText}>
      <STBoxContainer disabled={disabled ? 1 : 0} overflow="hidden" {...props}>
        <STBoxItem>
          {!hideCheckbox && (
            <Checkbox
              checked={active}
              disabled={disabled}
              size="small"
              {...(activeRemove && {
                checkedIcon: <SCloseIcon />,
                color: 'error',
              })}
              sx={{
                'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                  color: 'grey.400',
                },
                m: 0,
                p: 2,
                mx: 2,
              }}
            />
          )}
          {startContent}
          {label && (
            <SText
              sx={{
                backgroundColor: disabled ? 'grey.400' : 'gray.200',
                borderRadius: '4px',
                px: 2,
                flexShrink: 0,
                ...labelSx,
              }}
              fontSize={11}
            >
              {label}
            </SText>
          )}
          <SText
            sx={{ flex: 1, minWidth: 0 }}
            lineNumber={textNoBreak ? undefined : 2}
            noBreak={textNoBreak}
          >
            {text}
          </SText>
          {endIcon}
        </STBoxItem>
      </STBoxContainer>
    </STooltip>
  );
};
