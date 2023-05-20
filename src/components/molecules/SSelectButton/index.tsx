import { FC } from 'react';

import { Checkbox } from '@mui/material';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { STBoxContainer, STBoxItem } from './styles';
import { SSelectButtonProps } from './types';

export const SSelectButton: FC<{ children?: any } & SSelectButtonProps> = ({
  disabled,
  text,
  label,
  active,
  tooltipText,
  hideCheckbox,
  ...props
}) => {
  return (
    <STooltip withWrapper minLength={15} title={tooltipText}>
      <STBoxContainer disabled={disabled ? 1 : 0} overflow="hidden" {...props}>
        <SText
          sx={{
            backgroundColor: disabled ? 'grey.400' : 'gray.200',
            borderRadius: '4px',
            pl: 4,
          }}
          fontSize={12}
        >
          {label}
        </SText>

        <STBoxItem>
          {!hideCheckbox && (
            <Checkbox
              checked={active}
              size="small"
              sx={{
                'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                  color: 'grey.400',
                },
              }}
            />
          )}
          <SText sx={{ width: '100%' }} lineNumber={2}>
            {text}
          </SText>
        </STBoxItem>
      </STBoxContainer>
    </STooltip>
  );
};
