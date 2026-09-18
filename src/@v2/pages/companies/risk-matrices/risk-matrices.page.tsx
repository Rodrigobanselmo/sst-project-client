import { FC } from 'react';

import { Box } from '@mui/material';

import { RiskMatricesPageContent } from './components/RiskMatricesPageContent';

type RiskMatricesPageProps = {
  companyId: string;
};

export const RiskMatricesPage: FC<RiskMatricesPageProps> = ({ companyId }) => {
  return (
    <Box sx={{ px: { xs: 2, md: 5 }, pb: 10, pt: 2 }}>
      <RiskMatricesPageContent companyId={companyId} />
    </Box>
  );
};
