/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box, CircularProgress, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { useStartEndDate } from 'components/organisms/modals/ModalAddCharacterization/hooks/useStartEndDate';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { dateToString } from 'core/utils/date/date-format';
import {
  resolveDisplayedOccupationalRisk,
  resolveDisplayedResidualOccupationalRisk,
} from 'core/utils/helpers/matriz';

import { OccupationalRiskResultPill } from 'components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill';
import { useRowColumns } from '../../../../hooks/useRowColumns';
import { SEndDateBox, STGridItem } from '../../styles';
import { AdmColumn } from '../columns/AdmColumn';
import { EngColumn } from '../columns/EngColumn';
import { EpiColumn } from '../columns/EpiColumn';
import { ExamColumn } from '../columns/ExamColumn';
import { ProbabilityAfterColumn } from '../columns/ProbabilityAfterColumn';
import { ProbabilityColumn } from '../columns/ProbabilityColumn';
import { RecColumn } from '../columns/RecColumn';
import { SourceColumn } from '../columns/SourceColumn';
import { RowColumnsProps } from './types';
import { EsocialCodeEnum } from 'core/enums/esocial-code.enum';

export const RowColumns: FC<{ children?: any } & RowColumnsProps> = ({
  handleSelect,
  handleRemove,
  riskData,
  risk,
  handleEditEpi,
  handleEditEngs,
  handleEditExams,
  handleHelp,
  isSelected,
  hide,
  selectedRisks,
  isRepresentAll,
  showEndDate,
  handleDeleteRiskData,
  isDeleteLoading,
  isLoading,
  ...props
}) => {
  const { columns } = useRowColumns();
  const upsertMutation = useMutUpsertRiskData();
  const { selectStartEndDate } = useStartEndDate();

  //! Quantitativo: level é autoridade. Qualitativo SYSTEM: S×P. CUSTOM: snapshot API.
  const actualMatrixLevel = resolveDisplayedOccupationalRisk({
    isQuantity: riskData?.isQuantity,
    level: riskData?.level,
    severity: risk?.severity,
    probability: riskData?.probability,
    matrixSource: riskData?.matrixSource,
    matrixVersionId: riskData?.matrixVersionId,
    matrixEvaluatedAt: riskData?.matrixEvaluatedAt,
    resolvedLabel: riskData?.resolvedLabel,
    resolvedColor: riskData?.resolvedColor,
    classificationPresentationColor: riskData?.classificationPresentationColor,
    resolvedLegacyBand: riskData?.resolvedLegacyBand,
  });

  const actualMatrixLevelAfter = resolveDisplayedResidualOccupationalRisk({
    isQuantity: riskData?.isQuantity,
    severity: risk?.severity,
    probabilityAfter: riskData?.probabilityAfter,
    matrixSource: riskData?.matrixSource,
    matrixVersionId: riskData?.matrixVersionId,
    matrixEvaluatedAt: riskData?.matrixEvaluatedAt,
    residualLabel: riskData?.residualLabel,
    residualColor: riskData?.residualColor,
    residualClassificationPresentationColor:
      riskData?.residualClassificationPresentationColor,
    residualLegacyBand: riskData?.residualLegacyBand,
  });

  const onEditDate = () => {
    if (riskData?.homogeneousGroupId && riskData?.riskFactorGroupDataId)
      selectStartEndDate(
        (d) =>
          upsertMutation.mutate({
            riskFactorGroupDataId: riskData.riskFactorGroupDataId as any,
            homogeneousGroupId: riskData.homogeneousGroupId,
            riskId: riskData.riskId,
            startDate: d.startDate,
            endDate: d.endDate,
            id: riskData.id,
          }),
        {
          // eslint-disable-next-line prettier/prettier
          startDate: riskData.startDate ? new Date(riskData.startDate) : null,
          endDate: riskData.endDate ? new Date(riskData.endDate) : null,
        },
      );
  };

  return (
    <Box>
      <STGridItem
        loading={isLoading ? 1 : 0}
        inactive={riskData?.endDate ? 1 : 0}
        sx={{ gridTemplateColumns: columns.map((row) => row.grid).join(' ') }}
        onClick={() =>
          risk?.id
            ? null
            : document.getElementById(IdsEnum.RISK_SELECT)?.click()
        }
        selected={isSelected ? 1 : 0}
        {...props}
      >
        {!hide && EsocialCodeEnum.AUSENCIA_DE_RISCO != risk?.esocialCode && (
          <>
            {!isRepresentAll ? (
              <SourceColumn
                handleSelect={handleSelect}
                handleRemove={handleRemove}
                data={riskData}
                risk={risk}
              />
            ) : (
              <div />
            )}
            <EpiColumn
              handleSelect={handleSelect}
              handleEdit={handleEditEpi}
              handleRemove={handleRemove}
              data={riskData}
              risk={risk}
            />
            <EngColumn
              handleSelect={handleSelect}
              handleEdit={handleEditEngs}
              handleRemove={handleRemove}
              data={riskData}
              risk={risk}
            />
            <AdmColumn
              handleSelect={handleSelect}
              handleRemove={handleRemove}
              data={riskData}
              risk={risk}
            />
            {!isRepresentAll ? (
              <>
                <ProbabilityColumn
                  handleHelp={handleHelp}
                  handleSelect={handleSelect}
                  data={riskData}
                  risk={
                    risk && (selectedRisks?.length ?? 1) === 1 ? risk : null
                  }
                />
                <OccupationalRiskResultPill
                  label={actualMatrixLevel?.label || '--'}
                  level={actualMatrixLevel?.level}
                  resultColor={actualMatrixLevel?.color}
                  alignSelfStart
                />
              </>
            ) : (
              <>
                <div />
                <div />
              </>
            )}
            <ExamColumn
              handleSelect={handleSelect}
              handleEdit={handleEditExams}
              handleRemove={handleRemove}
              data={riskData}
              risk={risk}
              hideStandard={isRepresentAll}
            />
            <RecColumn
              handleSelect={handleSelect}
              handleRemove={handleRemove}
              data={riskData}
              risk={risk}
            />
            {!isRepresentAll ? (
              <>
                <ProbabilityAfterColumn
                  handleSelect={handleSelect}
                  data={riskData}
                />
                <OccupationalRiskResultPill
                  label={actualMatrixLevelAfter?.label || '--'}
                  level={actualMatrixLevelAfter?.level}
                  resultColor={actualMatrixLevelAfter?.color}
                  alignSelfStart
                />
              </>
            ) : (
              <>
                <div />
                <div />
              </>
            )}
            {isLoading && (
              <SFlex gap={5} align="center">
                <CircularProgress color="primary" size={10} />
                <SText fontSize={11}>Salvando...</SText>
              </SFlex>
            )}
          </>
        )}
      </STGridItem>
      {showEndDate && riskData && (
        <SFlex align="center">
          <STooltip title={'Editar data'}>
            <SEndDateBox mt={1} onClick={onEditDate}>
              <SText
                fontSize="11px"
                color={riskData?.endDate ? 'error.main' : 'text.light'}
                minWidth={110}
              >
                inicio: {dateToString(riskData?.startDate)}
              </SText>
              <SText
                fontSize="11px"
                color={riskData?.endDate ? 'error.main' : 'text.light'}
              >
                fim: {dateToString(riskData?.endDate)}
              </SText>
            </SEndDateBox>
          </STooltip>
          <STooltip withWrapper title={'Limpar dados'}>
            <SIconButton
              loading={isDeleteLoading}
              onClick={() => handleDeleteRiskData?.()}
              size="small"
            >
              <Icon
                component={SDeleteIcon}
                sx={{ fontSize: '1.2rem', color: 'error.dark' }}
              />
            </SIconButton>
          </STooltip>
        </SFlex>
      )}
    </Box>
  );
};
