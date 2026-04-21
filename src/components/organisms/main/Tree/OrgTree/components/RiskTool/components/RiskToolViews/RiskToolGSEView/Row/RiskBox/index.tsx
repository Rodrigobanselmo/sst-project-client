import React, { FC, useMemo } from 'react';

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
          startDate: riskData.startDate
            ? new Date(riskData.startDate)
            : undefined,
          endDate: riskData.endDate ? new Date(riskData.endDate) : undefined,
        },
      );
  };

  const isPsicologico = data.subTypes?.find(
    (subType) => subType.sub_type.name === 'Psicossociais',
  );

  const subCategoryLabels = useMemo(() => {
    if (!data.subTypes?.length) return '';
    const names = [
      ...new Set(
        data.subTypes
          .map((s) => s.sub_type?.name)
          .filter((n): n is string => typeof n === 'string' && n.trim().length > 0),
      ),
    ];
    const filtered = isPsicologico
      ? names.filter((n) => n !== 'Psicossociais')
      : names;
    return filtered.length ? filtered.join(' · ') : '';
  }, [data.subTypes, isPsicologico]);

  const displayNextToChip = useMemo(() => {
    if (!isRepresentAll && isPsicologico) {
      return subCategoryLabels
        ? `Ergonômico · ${subCategoryLabels}`
        : 'Ergonômico';
    }
    return subCategoryLabels;
  }, [isRepresentAll, isPsicologico, subCategoryLabels]);

  return (
    <STBoxItem inactive={riskData?.endDate ? 1 : 0}>
      <SFlex className="item_box" direction="column" align="stretch" gap={2}>
        <SFlex
          align="center"
          justify="space-between"
          gap={2}
          sx={{ width: '100%', minHeight: 28 }}
        >
          <SFlex
            align="center"
            gap={2}
            flexWrap="wrap"
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Box
              sx={{
                flexShrink: 0,
                px: 4,
                py: '1px',
                borderRadius: 3,
                fontSize: '12px',
                ...(!isRepresentAll
                  ? isPsicologico
                    ? {
                        backgroundColor: 'risk.psic',
                        color: 'grey.900',
                        border: '1px solid',
                        borderColor: 'risk.erg',
                        fontWeight: 600,
                      }
                    : {
                        backgroundColor: `risk.${data?.type.toLowerCase()}`,
                        color: 'common.white',
                      }
                  : {}),
                ...(isRepresentAll
                  ? {
                      backgroundColor: isPsicologico ? 'risk.psic' : 'risk.all',
                      border: '1px solid',
                      borderColor: `risk.${data?.type.toLowerCase()}`,
                      color: `risk.${data?.type.toLowerCase()}`,
                    }
                  : {}),
              }}
            >
              {!isRepresentAll ? (isPsicologico ? 'PSIC' : data.type) : 'PADRÃO'}
            </Box>
            {!!displayNextToChip && (
              <SText
                component="span"
                fontSize={12}
                color="text.secondary"
                sx={{ lineHeight: 1.3, wordBreak: 'break-word' }}
              >
                {displayNextToChip}
              </SText>
            )}
          </SFlex>
          <Box sx={{ flexShrink: 0, ml: 1 }}>
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
          </Box>
        </SFlex>
        <STooltip
          minLength={15}
          placement="right"
          enterDelay={3000}
          title={data.name}
        >
          <Box sx={{ width: '100%', minWidth: 0, px: 0.5, py: 0.5 }}>
            <SText
              fontSize={14}
              sx={{
                wordBreak: 'break-word',
                display: 'block',
              }}
            >
              {!isRepresentAll ? data.name : 'Informações gerais'}
            </SText>
          </Box>
        </STooltip>
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
