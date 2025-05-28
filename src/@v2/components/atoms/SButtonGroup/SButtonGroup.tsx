import { Button, ButtonGroup } from '@mui/material';
import React from 'react';
import { SFlex } from '../SFlex/SFlex';
import { SButton } from '../SButton/SButton';
import { SButtonProps } from '../SButton/SButton.types';

interface Option<T> {
  label: string;
  value: T;
}

interface SButtonGroupProps<T> {
  value: T;
  onChange: (option: Option<T>) => void;
  options: Option<T>[];
  buttonProps?: SButtonProps['buttonProps'];
}

export function SButtonGroup<T>({
  options,
  onChange,
  value,
  buttonProps,
}: SButtonGroupProps<T>) {
  return (
    <SFlex
      sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        gap: 0,
        width: 'fit-content',
        height: 'fit-content',
      }}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isLastItem = index != options.length - 1;

        return (
          <SButton
            key={option.label}
            color={isSelected ? 'primary' : 'paper'}
            onClick={() => {
              onChange(option);
            }}
            variant="shade"
            text={option.label}
            buttonProps={{
              ...buttonProps,
              sx: {
                borderRadius: 0,
                py: 2,
                minWidth: 80,
                px: 5,
                border: 'none',
                borderRight: isLastItem ? '1px solid' : undefined,
                borderRightColor: 'divider',
                ...buttonProps?.sx,
                '&:hover': {
                  border: 'none',
                  borderRight: isLastItem ? '1px solid' : undefined,
                  borderRightColor: 'divider',
                  ...buttonProps?.sx?.['&:hover'],
                },
                '&:active': {
                  border: 'none',
                  borderRight: isLastItem ? '1px solid' : undefined,
                  borderRightColor: 'divider',
                  ...buttonProps?.sx?.['&:active'],
                },
              },
            }}
          />
        );
      })}
    </SFlex>
  );
}
