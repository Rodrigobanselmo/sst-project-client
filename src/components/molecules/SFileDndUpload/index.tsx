import { FC, useState } from 'react';
import { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { useSnackbar } from 'notistack';

import SUploadFileIcon from 'assets/icons/SUploadFileIcon';

import { STSFileUploaderContainer } from './styles';

interface ISFileDndUpload {
  accept?: string | string[];
  maxFiles?: number;
  onChange: (files: File[]) => void;
  text?: string;
}

const getFileSizeName = (size: number) => {
  if (size < 1_000) return size + ' B';
  if (size < 1_000_000) return (size / 1_000).toFixed(2) + ' KB';
  if (size < 1_000_000_000) return (size / 1_000_000).toFixed(2) + ' MB';
  return (size / 1_000_000_000).toFixed(2) + ' GB';
};

const getFileName = (name: string) => {
  const split = name.split('.');
  const ext = split.pop();
  const rest = split.join('.');

  const end =
    rest.length > 30 ? rest.slice(0, 15) + ' ... ' + rest.slice(-15) : rest;

  return end + '.' + ext;
};

export const SFileDndUpload: FC<ISFileDndUpload> = ({
  accept,
  maxFiles,
  onChange,
  text = 'Arraste ou click aqui \n para selecionar um arquivo',
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
    <>
      <STSFileUploaderContainer
        {...getRootProps()}
        is_drag_active={isDragActive ? 1 : 0}
      >
        <input {...getInputProps()} />
        <SUploadFileIcon sx={{ color: 'grey.400', fontSize: '2rem' }} />
        {isDragActive && <p>Solte seu arquivo aqui ...</p>}{' '}
        {!isDragActive && (
          <p style={{ whiteSpace: 'pre-wrap', textAlign: 'center' }}>{text}</p>
        )}
      </STSFileUploaderContainer>
      {files.length > 0 && (
        <Box sx={{ marginTop: 3 }}>
          {files.map((file) => (
            <SFlex
              key={file.name}
              sx={{
                p: 3,
                px: 6,
                border: '2px solid',
                borderRadius: 1,
                borderColor: 'grey.300',
              }}
            >
              <SText flex={1} fontSize={14} color="info.main">
                {getFileName(file.name)}
              </SText>
              <SText fontSize={14}>{getFileSizeName(file.size)}</SText>
            </SFlex>
          ))}
        </Box>
      )}
    </>
  );
};
