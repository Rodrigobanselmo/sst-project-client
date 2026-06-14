import { FC } from 'react';

import { Box } from '@mui/material';
import { HoMethodsPageContent } from './components/HoMethodsPageContent';

export const HoMethodsPage: FC = () => {
  return (
    <Box sx={{ px: { xs: 2, md: 5 }, pb: 10, pt: 2 }}>
      <HoMethodsPageContent />
    </Box>
  );
};
