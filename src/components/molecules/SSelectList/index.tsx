import { FC } from 'react';

import { Checkbox } from '@mui/material';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SCloseIcon from 'assets/icons/SCloseIcon';

import { STBoxContainer, STBoxItem } from './styles';
import { SSelectButtonProps } from './types';

export const SSelectList: FC<SSelectButtonProps> = ({
  disabled,
  text,
  label,
  active,
  tooltipText,
  hideCheckbox,
  activeRemove,
  ...props
}) => {
  return (
    <STooltip withWrapper minLength={15} title={tooltipText}>
      <STBoxContainer disabled={disabled ? 1 : 0} overflow="hidden" {...props}>
        <STBoxItem>
          {!hideCheckbox && (
            <Checkbox
              checked={active}
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
          {label && (
            <SText
              sx={{
                backgroundColor: disabled ? 'grey.400' : 'gray.200',
                borderRadius: '4px',
                px: 2,
              }}
              fontSize={11}
            >
              {label}
            </SText>
          )}
          <SText sx={{ width: '100%' }} lineNumber={2}>
            {text}
          </SText>
        </STBoxItem>
      </STBoxContainer>
    </STooltip>
  );
};
