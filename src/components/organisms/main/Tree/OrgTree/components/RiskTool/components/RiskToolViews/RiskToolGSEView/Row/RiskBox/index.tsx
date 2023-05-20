import React, { FC } from 'react';

import { Box, Divider, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { useStartEndDate } from 'components/organisms/modals/ModalAddCharacterization/hooks/useStartEndDate';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { dateToString } from 'core/utils/date/date-format';

import { STBoxItem } from './styles';
import { RiskToolGSEViewRowRiskBoxProps } from './types';

export const RiskToolGSEViewRowRiskBox: FC<
  { children?: any } & RiskToolGSEViewRowRiskBoxProps
> = ({ data, hide, riskData, riskGroupId, isRepresentAll }) => {
  const deleteMutation = useMutDeleteManyRiskData();
  const upsertMutation = useMutUpsertRiskData();
  const { selectStartEndDate } = useStartEndDate();
  const hasData = riskData && riskData.homogeneousGroupId;

  const cleanData = (risk: IRiskFactors) => {
    if (hasData && riskData.homogeneousGroupId)
      deleteMutation.mutate({
        // riskFactorGroupDataId: riskGroupId,
        // homogeneousGroupIds: [riskData.homogeneousGroupId],
        // riskIds: [risk.id],
        ids: [riskData.id],
      });
  };

  const onEditDate = () => {
    if (riskData?.homogeneousGroupId)
      selectStartEndDate(
        (d) =>
          upsertMutation.mutate({
            riskFactorGroupDataId: riskGroupId,
            homogeneousGroupId: riskData.homogeneousGroupId,
            riskId: data.id,
            startDate: d.startDate,
            endDate: d.endDate,
            id: riskData.id,
          }),
        {
          // eslint-disable-next-line prettier/prettier
          startDate: riskData.startDate ? new Date(riskData.startDate) : undefined,
          endDate: riskData.endDate ? new Date(riskData.endDate) : undefined,
        },
      );
  };

  return (
    <STBoxItem inactive={riskData?.endDate ? 1 : 0}>
      <SFlex className="item_box" align="center">
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
          {!isRepresentAll ? data.type : 'PADRÃO'}
        </Box>
        <STooltip
          minLength={15}
          placement="right"
          enterDelay={3000}
          title={data.name}
        >
          <Box sx={{ ml: 5, width: '100%', mr: 15 }}>
            <SText fontSize={14} lineNumber={2}>
              {!isRepresentAll ? data.name : 'Informações gerais'}
            </SText>
          </Box>
        </STooltip>
        <SFlex
          sx={{ position: 'absolute', top: 'calc(50% + -14px)', right: 10 }}
        >
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
      </SFlex>
      <STooltip title={'Editar data'}>
        <SFlex className="item_end_date" onClick={onEditDate}>
          <SText fontSize="11px" color="text.light" minWidth={110}>
            inicio: {dateToString(riskData?.startDate)}
          </SText>
          <SText fontSize="11px" color="text.light">
            fim: {dateToString(riskData?.endDate)}
          </SText>
        </SFlex>
      </STooltip>
    </STBoxItem>
  );
};
