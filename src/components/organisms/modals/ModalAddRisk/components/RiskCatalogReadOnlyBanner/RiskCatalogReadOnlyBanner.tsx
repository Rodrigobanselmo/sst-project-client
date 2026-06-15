import { FC } from 'react';

import { Alert, Box, Button, Typography } from '@mui/material';

import {
  FUTURE_COMPANY_RISK_COPY_HINT,
  GLOBAL_CATALOG_RISK_READ_ONLY_MESSAGE,
} from 'core/utils/risk-factor-catalog-scope.util';

type RiskCatalogReadOnlyBannerProps = {
  showFutureCopyHint?: boolean;
};

export const RiskCatalogReadOnlyBanner: FC<RiskCatalogReadOnlyBannerProps> = ({
  showFutureCopyHint = true,
}) => (
  <Alert severity="info" sx={{ mb: 3 }}>
    <Typography variant="body2">{GLOBAL_CATALOG_RISK_READ_ONLY_MESSAGE}</Typography>
    {showFutureCopyHint && (
      <Box sx={{ mt: 2 }}>
        <Button size="small" variant="outlined" disabled sx={{ mr: 2 }}>
          Criar cópia para minha empresa
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {FUTURE_COMPANY_RISK_COPY_HINT}
        </Typography>
      </Box>
    )}
  </Alert>
);
