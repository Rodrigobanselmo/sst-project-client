import React, { FC } from 'react';

import { Box } from '@mui/material';

import { EditRiskSelects } from '../EditRiskSelects';
import { RiskCatalogReadOnlyBanner } from '../RiskCatalogReadOnlyBanner/RiskCatalogReadOnlyBanner';
import { RiskQuiContent } from '../RiskQuiContent/RiskQuiContent';
import { RiskSharedContent } from '../RiskSharedContent/RiskSharedContent';
import { IUseAddRisk } from '../../hooks/useAddRisk';

export const RiskEditorFields: FC<IUseAddRisk> = (props) => {
  const { type, riskData, setRiskData, isCatalogReadOnly } = props;

  return (
    <>
      {isCatalogReadOnly && <RiskCatalogReadOnlyBanner />}
      <Box
        component="fieldset"
        disabled={isCatalogReadOnly}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <RiskSharedContent {...props} />
        {type == 'QUI' && <RiskQuiContent {...props} />}
        <EditRiskSelects riskData={riskData} setRiskData={setRiskData} />
      </Box>
    </>
  );
};
