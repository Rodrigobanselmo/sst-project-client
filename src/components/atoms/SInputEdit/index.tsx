/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, FC, useRef, useState } from 'react';

import { Icon } from '@mui/material';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import { SSaveIcon } from 'assets/icons/SSaveIcon';

import SIconButton from '../SIconButton';
import { SInput } from '../SInput';
import STooltip from '../STooltip';
import { SInputEditProps } from './types';

export const SInputEdit: FC<SInputEditProps> = ({
  value,
  onBlur,
  onFocus,
  onCloseAction,
  onSave,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const onFocusInput = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onFocus?.(e);
    setIsFocused(true);
  };

  const onBlurInput = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onBlur?.(e);
    if (value !== e.target.value) onSave?.(e.target.value);
    setIsFocused(false);
  };

  const onCloseActionInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCloseAction?.();
    setIsFocused(false);
  };

  return (
    <div>
      {!isFocused && (
        <SInput
          value={value}
          onFocus={onFocusInput}
          endAdornment={<Icon sx={{ fontSize: 15 }} component={SEditIcon} />}
          {...props}
        />
      )}
      {isFocused && (
        <SInput
          inputRef={editRef}
          endAdornment={
            // <STooltip withWrapper title={'Não salvar'}>
            <SIconButton sx={{ height: 25, width: 25 }}>
              <Icon sx={{ fontSize: 15 }} component={SSaveIcon} />
            </SIconButton>
            // </STooltip>
          }
          autoFocus
          defaultValue={value}
          onBlur={onBlurInput}
          {...props}
        />
      )}
    </div>
  );
};
