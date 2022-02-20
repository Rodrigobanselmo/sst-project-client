import { FC, useState } from 'react';
import { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

import { useSnackbar } from 'notistack';

import { STSFileUploaderContainer } from './styles';

interface ISFileDndUpload {
  accept?: string | string[];
  maxFiles?: number;
  onChange: (files: File[]) => void;
}

export const SFileDndUpload: FC<ISFileDndUpload> = ({
  accept,
  maxFiles,
  onChange,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      onChange(acceptedFiles);
    },
    [onChange],
  );

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      if (maxFiles && fileRejections.length > maxFiles)
        return enqueueSnackbar(
          `Número de arquivo excedeu o limit de no máximo ${maxFiles}`,
          {
            variant: 'error',
            autoHideDuration: 1500,
          },
        );

      return enqueueSnackbar('Esse tipo de arquivo não é aceito.', {
        variant: 'error',
        autoHideDuration: 1500,
      });
    },
    [enqueueSnackbar, maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    onDropRejected,
  });

  return (
    <STSFileUploaderContainer
      {...getRootProps()}
      is_drag_active={isDragActive ? 1 : 0}
    >
      <input {...getInputProps()} />
      {files.length === 0 && isDragActive && (
        <p>Solte seu arquivo aqui ...</p>
      )}{' '}
      {files.length === 0 && !isDragActive && (
        <p>Arraste seu aqui, ou click para selecionar um arquivo</p>
      )}
      {files.length > 0 &&
        files.map((file) => <p key={file.name}>{file.name}</p>)}
    </STSFileUploaderContainer>
  );
};
