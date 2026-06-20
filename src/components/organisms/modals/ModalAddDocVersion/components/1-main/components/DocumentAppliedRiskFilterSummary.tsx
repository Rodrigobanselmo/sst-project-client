import React from 'react';

import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';

type DocumentAppliedRiskFilterSummaryProps = {
  summary?: string | null;
  onClear: () => void;
};

export const DocumentAppliedRiskFilterSummary = ({
  summary,
  onClear,
}: DocumentAppliedRiskFilterSummaryProps) => {
  if (!summary) return null;

  return (
    <Box mt={4}>
      <SText color="text.secondary" fontSize={12}>
        {summary}
      </SText>
      <SButton variant="text" size="small" onClick={onClear} sx={{ mt: 2, px: 0 }}>
        Limpar filtro de riscos
      </SButton>
    </Box>
  );
};
