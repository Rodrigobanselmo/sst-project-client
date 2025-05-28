import { Box, CircularProgress } from '@mui/material';
import { STextProps } from '@v2/components/atoms/SText/SText.types';

export const GraphLoading = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <CircularProgress size={24} sx={{ color: 'primary.main' }} />
    </Box>
  );
};
