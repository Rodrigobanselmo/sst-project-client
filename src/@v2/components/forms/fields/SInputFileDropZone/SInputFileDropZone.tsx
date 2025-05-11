import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useDropzone } from 'react-dropzone';
import { Box } from '@mui/material';
import {
  FileDropZoneRejection,
  SInputFileDropZoneProps,
} from './SInputFileDropZone.types';
import { SText } from '@v2/components/atoms/SText/SText';
import { useSnackbar } from 'notistack';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

export const SInputFileDropZone = ({
  accept,
  icon = <CloudUploadOutlinedIcon sx={{ color: 'primary.main' }} />,
  label,
  disabled,
  onDrop,
  maxSize,
  maxFiles,
}: SInputFileDropZoneProps) => {
  const { showSnackBar } = useSystemSnackbar();

  const onDropRejected = (fileRejections: FileDropZoneRejection[]) => {
    if (maxFiles && fileRejections.length > maxFiles)
      return showSnackBar(
        `Número de arquivo excedeu o limit de no máximo ${maxFiles}`,
        { type: 'error' },
      );
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxSize,
    onDropRejected,
    maxFiles,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '1px dashed',
        borderColor: 'grey.400',
        borderRadius: '4px',
        width: '100%',
        height: '5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
      }}
    >
      <input {...getInputProps()} disabled={disabled} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
      >
        {icon}
        <Box display="flex" flexDirection="row" alignItems="center" gap={0.5}>
          <SText color="primary" sx={{ textDecoration: 'underline' }} mr={1}>
            Clique aqui para carregar
          </SText>
          <SText>ou arraste e solte</SText>
        </Box>
        <SText>{label}</SText>
      </Box>
    </Box>
  );
};
