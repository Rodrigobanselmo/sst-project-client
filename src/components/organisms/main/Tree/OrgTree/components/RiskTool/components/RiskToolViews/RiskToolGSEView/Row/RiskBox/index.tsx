import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';

import { STBoxItem } from './styles';
import { RiskToolGSEViewRowRiskBoxProps } from './types';

export const RiskToolGSEViewRowRiskBox: FC<RiskToolGSEViewRowRiskBoxProps> = ({
  data,
  hide,
  riskData,
  riskGroupId,
}) => {
  const deleteMutation = useMutDeleteManyRiskData();
  const hasData = riskData && riskData.homogeneousGroupId;

  const cleanData = (risk: IRiskFactors) => {
    if (hasData && riskData.homogeneousGroupId)
      deleteMutation.mutate({
        riskFactorGroupDataId: riskGroupId,
        homogeneousGroupIds: [riskData.homogeneousGroupId],
        riskIds: [risk.id],
      });
  };

  return (
    <STBoxItem sx={{ minHeight: '46px', position: 'relative' }}>
      <Box
        sx={{
          backgroundColor: `risk.${data?.type.toLowerCase()}`,
          px: 4,
          py: '1px',
          borderRadius: 3,
          fontSize: '12px',
          color: 'common.white',
        }}
      >
        {data.type}
      </Box>
      <STooltip minLength={15} enterDelay={1000} title={data.name}>
        <Box sx={{ ml: 5, width: '100%', mr: 15 }}>
          <SText fontSize={14} lineNumber={2}>
            {data.name}
          </SText>
        </Box>
      </STooltip>
      <SFlex sx={{ position: 'absolute', top: 'calc(50% + -14px)', right: 10 }}>
        {!hide && hasData && (
          <STooltip withWrapper title={'Limpar dados'}>
            <SIconButton
              loading={deleteMutation.isLoading}
              onClick={() => cleanData(data)}
              size="small"
            >
              <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
          </STooltip>
        )}
      </SFlex>
    </STBoxItem>
  );
};
