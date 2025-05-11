import PhotoIcon from '@mui/icons-material/Photo';
import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';

export const TaskEmptyPhotos = ({
  text = 'Nenhuma foto cadastrada',
}: {
  text?: string;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '205px',
        bgcolor: 'grey.200',
        border: '1px dashed',
        borderRadius: 2,
        p: 2,
      }}
    >
      <PhotoIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
      <SText fontSize={16} color="text.secondary" textAlign="center">
        {text}
      </SText>
    </Box>
  );
};
