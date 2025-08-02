import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import { getSizeInMbOrKb } from '@v2/utils/get-file-size';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';

export class FileDropZoneView extends File {
  isUploaded?: boolean;
  error?: string;
  id?: any;
}

interface SInputFileDropZoneViewProps {
  files: FileDropZoneView[];
  onRemoveFile: (fileId: number | string) => void;
}

export const SInputFileDropZoneFilesView = ({
  files,
  onRemoveFile = () => {},
}: SInputFileDropZoneViewProps) => {
  return (
    <Box padding={2} display="flex" flexDirection="column" gap={2}>
      {files.map((file) => {
        const isUploading = !file.error && !file.isUploaded;
        const isError = file.error;
        const isComplete = !file.error && file.isUploaded;

        const message = isError
          ? `${file.error}`
          : isComplete
            ? 'Completo'
            : 'Carregando...';

        return (
          <Box
            key={file.name}
            mt={4}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={8}>
              <Box>
                <CloudUploadOutlinedIcon sx={{ color: 'primary.main' }} />
              </Box>
              <Box color={isError ? 'error.dark' : 'text.main'}>
                <SText color={'inherit'}>{file.name}</SText>
                <Box display="flex" alignItems="center" gap={4}>
                  <SText color={'inherit'} fontSize={12}>
                    {getSizeInMbOrKb(file.size)}
                  </SText>{' '}
                  •
                  <SText color={'inherit'} fontSize={12}>
                    {message}
                  </SText>
                </Box>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <SIconButton onClick={() => onRemoveFile(file.id)}>
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 22 }} />
              </SIconButton>

              {isUploading && <CircularProgress size={20} />}
              {isComplete && (
                <CheckCircleIcon color="success" sx={{ fontSize: 22 }} />
              )}
              {isError && (
                <ErrorOutlineOutlinedIcon color="error" sx={{ fontSize: 22 }} />
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
