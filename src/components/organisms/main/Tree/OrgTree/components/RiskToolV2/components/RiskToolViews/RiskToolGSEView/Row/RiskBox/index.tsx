import React, { FC, useMemo } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Icon } from '@mui/material';
import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { useStartEndDate } from 'components/organisms/modals/ModalAddCharacterization/hooks/useStartEndDate';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutDeleteManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { dateToString } from 'core/utils/date/date-format';
import { getMatrizRisk } from 'core/utils/helpers/matriz';

import { MatrixEquation } from './MatrixEquation';
import { STBoxItem } from './styles';
import { RiskToolGSEViewRowRiskBoxProps } from './types';

function severityAction(severity?: number): ITagActionColors {
  if (!severity || severity < 1) return 'none';
  if (severity >= 6) return '6';
  return String(Math.min(5, Math.max(1, severity))) as ITagActionColors;
}

export const RiskToolGSEViewRowRiskBox: FC<
  { children?: any } & RiskToolGSEViewRowRiskBoxProps
> = ({
  data,
  hide,
  riskData,
  riskGroupId,
  isRepresentAll,
  expanded = true,
  onToggleExpand,
  framed = false,
}) => {
  const deleteMutation = useMutDeleteManyRiskData();
  const upsertMutation = useMutUpsertRiskData();
  const { selectStartEndDate } = useStartEndDate();
  const hasData = riskData && riskData.homogeneousGroupId;

  const cleanData = (risk: IRiskFactors) => {
    if (hasData && riskData.homogeneousGroupId)
      deleteMutation.mutate({
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
          startDate: riskData.startDate
            ? new Date(riskData.startDate)
            : undefined,
          endDate: riskData.endDate ? new Date(riskData.endDate) : undefined,
        },
      );
  };

  const riskTypeKey = (data?.type ?? '').toLowerCase();
  const riskName = data?.name || '';
  const riskTypeLabel = data?.type || '—';
  const severity = data?.severity;

  const isPsicologico = data?.subTypes?.find(
    (subType) => subType?.sub_type?.name === 'Psicossociais',
  );

  const subCategoryLabels = useMemo(() => {
    if (!data?.subTypes?.length) return '';
    const names = [
      ...new Set(
        data.subTypes
          .map((s) => s?.sub_type?.name)
          .filter(
            (n): n is string => typeof n === 'string' && n.trim().length > 0,
          ),
      ),
    ];
    const filtered = isPsicologico
      ? names.filter((n) => n !== 'Psicossociais')
      : names;
    return filtered.length ? filtered.join(' · ') : '';
  }, [data?.subTypes, isPsicologico]);

  const displayNextToChip = useMemo(() => {
    if (!isRepresentAll && isPsicologico) {
      return subCategoryLabels
        ? `Ergonômico · ${subCategoryLabels}`
        : 'Ergonômico';
    }
    return subCategoryLabels;
  }, [isRepresentAll, isPsicologico, subCategoryLabels]);

  // Mesma ordem de args usada em RowColumns (legado do getMatrizRisk).
  const inherentMatrix = useMemo(
    () => getMatrizRisk(riskData?.probability, data?.severity),
    [data?.severity, riskData?.probability],
  );

  const hasRecs = !!(riskData?.recs && riskData.recs.length > 0);
  const residualProbability =
    hasRecs && riskData?.probabilityAfter
      ? riskData.probabilityAfter
      : undefined;

  const residualMatrix = useMemo(
    () =>
      residualProbability
        ? getMatrizRisk(residualProbability, data?.severity)
        : null,
    [data?.severity, residualProbability],
  );

  const showCollapsedSummary =
    !expanded && !isRepresentAll && (!!severity || !!riskData?.probability);

  return (
    <STBoxItem
      inactive={riskData?.endDate ? 1 : 0}
      collapsed={expanded ? 0 : 1}
      framed={framed ? 1 : 0}
    >
      <SFlex
        className="item_box"
        direction="row"
        align="center"
        gap={3}
        sx={{
          width: '100%',
          cursor: onToggleExpand ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        onClick={() => onToggleExpand?.()}
      >
        {onToggleExpand && (
          <ExpandMoreIcon
            sx={{
              fontSize: '1.4rem',
              color: 'text.secondary',
              flexShrink: 0,
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.15s ease',
            }}
          />
        )}

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
                      backgroundColor: riskTypeKey
                        ? `risk.${riskTypeKey}`
                        : 'grey.400',
                      color: 'common.white',
                    }
                : {}),
              ...(isRepresentAll
                ? {
                    backgroundColor: isPsicologico ? 'risk.psic' : 'risk.all',
                    border: '1px solid',
                    borderColor: riskTypeKey
                      ? `risk.${riskTypeKey}`
                      : 'grey.400',
                    color: riskTypeKey ? `risk.${riskTypeKey}` : 'grey.700',
                  }
                : {}),
            }}
          >
            {!isRepresentAll
              ? isPsicologico
                ? 'PSIC'
                : riskTypeLabel
              : 'PADRÃO'}
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
          <STooltip
            minLength={20}
            placement="top"
            enterDelay={800}
            title={riskName}
          >
            <SText
              fontSize={14}
              fontWeight={600}
              sx={{
                wordBreak: 'break-word',
                lineHeight: 1.35,
              }}
            >
              {!isRepresentAll
                ? riskName || 'Risco sem nome'
                : 'Informações gerais'}
            </SText>
          </STooltip>
        </SFlex>

        <SFlex
          align="center"
          gap={2}
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ flexShrink: 0, maxWidth: { xs: '100%', md: '58%' } }}
          onClick={(e) => e.stopPropagation()}
        >
          {showCollapsedSummary ? (
            <SFlex
              align="center"
              gap={3}
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={{ rowGap: 1 }}
            >
              <MatrixEquation
                label="Inerente"
                probability={riskData?.probability}
                severity={severity}
                resultLabel={inherentMatrix?.label}
                resultLevel={inherentMatrix?.level}
              />
              <MatrixEquation
                label="Residual"
                probability={residualProbability}
                severity={severity}
                resultLabel={residualMatrix?.label}
                resultLevel={residualMatrix?.level}
                empty={!residualProbability}
              />
            </SFlex>
          ) : (
            !isRepresentAll &&
            !!severity && (
              <STag
                text={`Severidade ${severity}`}
                action={severityAction(severity)}
                sx={{
                  px: 3,
                  py: 0.5,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  borderRadius: '999px',
                }}
              />
            )
          )}
          {!hide && hasData && data && (
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
      {expanded && hasData && (
        <STooltip title={'Editar data'}>
          <SFlex
            className="item_end_date"
            onClick={onEditDate}
            gap={4}
            sx={{ opacity: 0.85 }}
          >
            <SText fontSize="10px" color="text.disabled" noBreak>
              início: {dateToString(riskData?.startDate)}
            </SText>
            <SText fontSize="10px" color="text.disabled" noBreak>
              fim: {dateToString(riskData?.endDate)}
            </SText>
          </SFlex>
        </STooltip>
      )}
    </STBoxItem>
  );
};
