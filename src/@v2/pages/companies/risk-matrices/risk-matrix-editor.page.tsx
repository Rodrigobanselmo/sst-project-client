import { FC } from 'react';

import { Box } from '@mui/material';

import { RiskMatrixEditorPageContent } from './components/RiskMatrixEditorPageContent';

type RiskMatrixEditorPageProps = {
  companyId: string;
  matrixId?: string;
  versionId?: string;
};

export const RiskMatrixEditorPage: FC<RiskMatrixEditorPageProps> = ({
  companyId,
  matrixId,
  versionId,
}) => {
  return (
    <Box sx={{ px: { xs: 2, md: 5 }, pb: 10, pt: 2 }}>
      <RiskMatrixEditorPageContent
        companyId={companyId}
        matrixId={matrixId || ''}
        versionId={versionId || ''}
      />
    </Box>
  );
};
