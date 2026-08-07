import React, { FC } from 'react';

import { Alert, Box, Typography } from '@mui/material';

import { RISK_FACTOR_DUPLICATE_NAME_HINT } from 'core/utils/build-risk-factor-duplicate-draft.util';

import { EditRiskSelects } from '../EditRiskSelects';
import { RiskCatalogReadOnlyBanner } from '../RiskCatalogReadOnlyBanner/RiskCatalogReadOnlyBanner';
import { RiskQuiContent } from '../RiskQuiContent/RiskQuiContent';
import { RiskSharedContent } from '../RiskSharedContent/RiskSharedContent';
import { IUseAddRisk } from '../../hooks/useAddRisk';

type RiskEditorFieldsProps = IUseAddRisk & {
  canCopyToCompany?: boolean;
  onCopyToCompany?: () => void;
};

export const RiskEditorFields: FC<RiskEditorFieldsProps> = (props) => {
  const {
    type,
    riskData,
    setRiskData,
    isCatalogReadOnly,
    canCopyToCompany,
    onCopyToCompany,
  } = props;

  const isDuplicateDraft = Boolean(riskData?.isDuplicateDraft);

  return (
    <>
      {isCatalogReadOnly && (
        <RiskCatalogReadOnlyBanner
          canCopyToCompany={canCopyToCompany}
          onCopyToCompany={onCopyToCompany}
        />
      )}
      {isDuplicateDraft && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">{RISK_FACTOR_DUPLICATE_NAME_HINT}</Typography>
        </Alert>
      )}
      <Box
        component="fieldset"
        disabled={isCatalogReadOnly}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <RiskSharedContent {...props} />
        {type == 'QUI' && <RiskQuiContent {...props} />}
        {!isDuplicateDraft && (
          <EditRiskSelects riskData={riskData} setRiskData={setRiskData} />
        )}
      </Box>
    </>
  );
};
