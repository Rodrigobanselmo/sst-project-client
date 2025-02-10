import { FC, MouseEvent, useRef, useState } from 'react';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

import { SInput } from '../SInput/SInput';
import { SInputFileProps } from './SInputFile.types';
import { InputAdornment } from '@mui/material';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';

export const SInputFile: FC<SInputFileProps> = ({
  inputRef,
  accept = '*',
  value,
  onChange,
  ...props
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef || ref;

  const triggerFileSelect = (e: MouseEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.files?.[0] || null);
    }
  };

  return (
    <>
      <SInput
        {...props}
        value={value?.name || ''}
        onClick={!props.disabled ? triggerFileSelect : undefined}
        inputRef={fileInputRef}
        endAdornment={
          !props.endAdornment ? (
            <InputAdornment position="end">
              <SIconButton onClick={triggerFileSelect}>
                <CloudUploadOutlinedIcon sx={{ color: 'primary.main' }} />
              </SIconButton>
            </InputAdornment>
          ) : (
            props.endAdornment
          )
        }
      />
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept={accept}
        onChange={handleFileChange}
      />
    </>
  );
};
