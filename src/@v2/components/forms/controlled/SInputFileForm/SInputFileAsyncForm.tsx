import { FileAsync } from '@v2/types/file-async';
import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SInputFile } from '../../fields/SInputFile/SInputFile';
import { SInputFileProps } from '../../fields/SInputFile/SInputFile.types';

interface SInputFileAsyncFormProps
  extends Omit<SInputFileProps, 'onChange' | 'value'> {
  onUpload: (file: File) => Promise<string>;
  name: string;
}

export function SInputFileAsyncForm({
  name,
  onUpload,
  ...props
}: SInputFileAsyncFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  const handleUpload = (fileUpload: File | null) => {
    if (fileUpload) {
      setIsLoading(true);
      onUpload?.(fileUpload)
        .then((fileId) => {
          const file: FileAsync = fileUpload as FileAsync;
          file.id = fileId;

          setValue(name, file, { shouldValidate: true, shouldDirty: true });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setValue(name, null, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <SInputFile
      {...props}
      loading={isLoading}
      helperText={errorMessage}
      error={!!error}
      value={value}
      onChange={handleUpload}
    />
  );
}
