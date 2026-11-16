import React, { FC } from 'react';

import { Alert, Typography, styled } from '@mui/material';

import { RISK_FACTOR_DUPLICATE_NAME_HINT } from 'core/utils/build-risk-factor-duplicate-draft.util';

import { EditRiskSelects } from '../EditRiskSelects';
import { RiskCatalogReadOnlyBanner } from '../RiskCatalogReadOnlyBanner/RiskCatalogReadOnlyBanner';
import { RiskQuiContent } from '../RiskQuiContent/RiskQuiContent';
import { RiskSharedContent } from '../RiskSharedContent/RiskSharedContent';
import { IUseAddRisk } from '../../hooks/useAddRisk';

const RiskFieldset = styled('fieldset')(({ theme }) => ({
  border: 0,
  padding: 0,
  margin: 0,
  minWidth: 0,
  ...(theme.palette.mode === 'dark' && {
    '--choice-border': theme.palette.grey[500],
    '--choice-surface': theme.palette.background.box,
    '&& .MuiOutlinedInput-root:not(.Mui-disabled):not(.Mui-error)': {
      backgroundColor: theme.palette.background.box,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grey[500],
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.secondary,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&& [data-field-label], && .MuiFormLabel-root:not(.Mui-error):not(.Mui-disabled)':
      {
        color: theme.palette.text.dark,
        fontWeight: 600,
      },
    '& .MuiFormHelperText-root:not(.Mui-error)': {
      color: theme.palette.text.secondary,
    },
  }),
}));

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
          <Typography variant="body2">
            {RISK_FACTOR_DUPLICATE_NAME_HINT}
          </Typography>
        </Alert>
      )}
      <RiskFieldset disabled={isCatalogReadOnly}>
        <RiskSharedContent {...props} />
        {type == 'QUI' && <RiskQuiContent {...props} />}
        {!isDuplicateDraft && (
          <EditRiskSelects riskData={riskData} setRiskData={setRiskData} />
        )}
      </RiskFieldset>
    </>
  );
};
