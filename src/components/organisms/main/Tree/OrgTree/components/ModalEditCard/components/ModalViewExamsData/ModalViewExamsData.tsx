import React, { useState } from 'react';

import { Box, LinearProgress } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { SSwitch } from 'components/atoms/SSwitch';
import STooltip from 'components/atoms/STooltip';
import {
  getExamAge,
  getExamPeriodic,
} from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { RiskEnum } from 'project/enum/risk.enums';

import SStarIcon from 'assets/icons/SStarIcon';

import { useQueryExamsHierarchy } from 'core/services/hooks/queries/useQueryExamsHierarchy/useQueryExamsHierarchy';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

import SFlex from '../../../../../../../../atoms/SFlex';
import SText from '../../../../../../../../atoms/SText';
import { ITreeSelectedItem } from '../../../../interfaces';
import { useModalCardActions } from '../../hooks/useModalCardActions';

interface IModalRiskDataViewProps {
  selectedNode: ITreeSelectedItem | null;
}

export const ModalViewExamsData = ({
  selectedNode,
}: IModalRiskDataViewProps) => {
  const [showRiskExam, setShowRiskExam] = useState(true);
  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;
  const hierarchyId = String(selectedNode?.id)?.split('//')[0];

  const { onOpenOfficeRiskTool, onOpenRiskTool } = useModalCardActions({
    hierarchyId,
    riskGroupId,
    selectedNode,
  });

  //! improve invalidate fetch when risk data change (refetch all times you change a risk data on riskTool)
  //! can show schedule exam, not only done
  const { data: exams, isLoading: loadingExams } = useQueryExamsHierarchy(1, {
    hierarchyId,
  });

  return (
    <SFlex direction="column" minHeight={220}>
      {(loadingRiskGroup || loadingExams) && <LinearProgress />}

      <SFlex justify="space-between">
        <SButton
          size="small"
          sx={{
            width: 'fit-content',
            backgroundColor: 'white',
            color: 'black',
            boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
            mb: 5,
            ':hover': {
              backgroundColor: 'grey.200',
              boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.2)',
            },
          }}
          onClick={() => onOpenOfficeRiskTool()}
        >
          Adicionar exames ao cargo
        </SButton>
        <SSwitch
          onChange={() => {
            setShowRiskExam(!showRiskExam);
          }}
          label="Mostar origem"
          checked={showRiskExam}
          sx={{ mr: 4 }}
          color="text.light"
        />
      </SFlex>
      <SFlex direction="column" gap={showRiskExam ? 8 : 4}>
        {exams.map((data) => {
          return (
            <SFlex gap={0} direction="column" key={data.exam?.id}>
              {data.exam?.name}

              {showRiskExam &&
                data.origins?.map((origin, index) => {
                  const periodic = getExamPeriodic(origin);
                  return (
                    <SFlex
                      sx={{
                        backgroundColor: 'grey.200',
                        py: 4,
                        px: 5,
                        mb: 5,
                        borderRadius: 1,
                        position: 'relative',
                      }}
                      direction="column"
                      key={origin.origin}
                    >
                      <SFlex>
                        <SText
                          fontSize={9}
                          component="span"
                          sx={{
                            backgroundColor: `risk.${
                              origin.risk?.type.toLowerCase() ||
                              RiskEnum.OUTROS.toLowerCase()
                            }`,
                            color: 'common.white',
                            borderRadius: '4px',
                            px: 4,
                          }}
                        >
                          {!origin?.risk?.type ||
                          origin.risk?.type === RiskEnum.OUTROS
                            ? 'Padrão'
                            : origin.risk?.type || ''}
                        </SText>
                        <SText fontSize={10}>
                          {!origin.risk?.type ||
                          origin.risk?.type === RiskEnum.OUTROS
                            ? ''
                            : origin.risk?.name || ''}
                        </SText>
                      </SFlex>

                      <SFlex gap={6}>
                        <SText
                          color="text.secondary"
                          component="span"
                          fontSize={10}
                        >
                          Validade:{' '}
                          {origin.validityInMonths
                            ? origin.validityInMonths + ' meses'
                            : '-'}
                        </SText>
                        <SText
                          color="text.secondary"
                          component="span"
                          fontSize={10}
                        >
                          sexo: {origin?.isMale && 'M'}
                          {origin?.isMale && origin?.isFemale && ' / '}
                          {origin?.isFemale && 'F'}
                        </SText>
                        <STooltip title={periodic.tooltip}>
                          <Box my={'-7px'} p={0} display="inline">
                            <SText
                              color="text.secondary"
                              component="span"
                              fontSize={10}
                            >
                              periodicidade: {periodic.text}
                            </SText>
                          </Box>
                        </STooltip>
                        <SText
                          color="text.secondary"
                          component="span"
                          fontSize={10}
                        >
                          Faixa etária: {getExamAge(origin)}
                        </SText>
                      </SFlex>

                      <SText lineHeight="1.4rem" fontSize={11} mt={0}>
                        <b>Origem:</b>{' '}
                        <SText
                          component="span"
                          sx={{
                            borderRadius: '4px',
                            cursor: 'pointer',
                            mr: 1,
                            backgroundColor: 'background.box',
                            px: 3,
                            py: '1px',
                            border: '1px solid',
                            borderColor: 'grey.400',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          fontSize={11}
                          onClick={() =>
                            onOpenRiskTool(origin.homogeneousGroup, origin.risk)
                          }
                        >
                          {origin.origin || ''}
                        </SText>
                      </SText>

                      {index === 0 && (
                        <STooltip
                          title={`utilizando valores abaixo para o exame: ${data.exam?.name}`}
                        >
                          <SStarIcon
                            sx={{
                              position: 'absolute',
                              right: 10,
                              fontSize: 13,
                              color: 'grey.400',
                            }}
                          />
                        </STooltip>
                      )}
                    </SFlex>
                  );
                })}
            </SFlex>
          );
        })}
      </SFlex>
    </SFlex>
  );
};
