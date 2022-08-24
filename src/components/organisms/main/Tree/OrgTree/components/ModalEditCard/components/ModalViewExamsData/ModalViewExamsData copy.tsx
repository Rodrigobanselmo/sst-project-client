import React, { useMemo } from 'react';

import { Box, LinearProgress } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import STooltip from 'components/atoms/STooltip';
import { initialRiskToolState } from 'components/organisms/modals/ModalRiskTool/hooks/useModalRiskTool';
import {
  getExamAge,
  getExamPeriodic,
} from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { RiskEnum, RiskOrderEnum } from 'project/enum/risk.enums';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useModal } from 'core/hooks/useModal';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryExamsHierarchy } from 'core/services/hooks/queries/useQueryExamsHierarchy/useQueryExamsHierarchy';
import { useQueryRiskDataByHierarchy } from 'core/services/hooks/queries/useQueryRiskDataByHierarchy';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import { ModalEnum } from '../../../../../../../../../core/enums/modal.enums';
import SFlex from '../../../../../../../../atoms/SFlex';
import SText from '../../../../../../../../atoms/SText';
import { ITreeSelectedItem } from '../../../../interfaces';
import { useOpenRiskTool } from '../../../RiskTool/hooks/useOpenRiskTool';
import { ViewsDataEnum } from '../../../RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum } from '../../../RiskTool/utils/view-risk-type.constant';
import { useModalCardActions } from '../../hooks/useModalCardActions';

interface IModalRiskDataViewProps {
  selectedNode: ITreeSelectedItem | null;
}

export const ModalViewExamsData = ({
  selectedNode,
}: IModalRiskDataViewProps) => {
  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;
  const hierarchyId = String(selectedNode?.id)?.split('//')[0];

  const { onOpenOfficeRiskTool, onOpenRiskTool } = useModalCardActions({
    hierarchyId,
    riskGroupId,
    selectedNode,
  });

  const { data: riskDataHierarchy, isLoading: loadingRiskData } =
    useQueryRiskDataByHierarchy(riskGroupId, hierarchyId);

  const { data: exams, isLoading: loadingExams } = useQueryExamsHierarchy(1, {
    hierarchyId,
  });

  console.log('exams', exams);

  const riskDataMemo = useMemo(() => {
    const risks: Record<
      string,
      { riskData: IRiskData[]; riskFactor: IRiskFactors }
    > = {};

    riskDataHierarchy.forEach((riskData) => {
      if (!risks[riskData.riskId])
        risks[riskData.riskId] = {
          riskData: [],
          riskFactor: riskData.riskFactor as IRiskFactors,
        };

      risks[riskData.riskId].riskData.push(riskData);
    });

    return Object.values(risks)
      .sort(({ riskFactor: a }, { riskFactor: b }) => sortString(a, b, 'name'))
      .sort(({ riskFactor: a }, { riskFactor: b }) =>
        sortNumber(
          RiskOrderEnum[a?.type || 'FIS'],
          RiskOrderEnum[b?.type || 'FIS'],
        ),
      );
  }, [riskDataHierarchy]);

  return (
    <SFlex direction="column" minHeight={220}>
      {(loadingRiskGroup || loadingRiskData) && <LinearProgress />}

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
        Adicionar exames ao cargos
      </SButton>
      <SFlex direction="column" gap={10}>
        {riskDataMemo.map((data) => {
          if (!data.riskData.some((r) => r.exams && r.exams.length))
            return null;

          return (
            <SFlex
              gap={0}
              sx={{ cursor: 'pointer' }}
              direction="column"
              key={data.riskFactor.id}
            >
              <SFlex>
                <SText fontSize={14}>
                  <SText
                    fontSize={10}
                    component="span"
                    sx={{
                      backgroundColor: `risk.${data.riskFactor?.type.toLowerCase()}`,
                      color: 'common.white',
                      display: 'inline-block',
                      width: '40px',
                      borderRadius: '4px',
                      mr: 2,
                    }}
                  >
                    <SFlex center>
                      {data.riskFactor?.type === RiskEnum.OUTROS
                        ? 'Padrão'
                        : data.riskFactor?.type || ''}
                    </SFlex>
                  </SText>
                  {data.riskFactor?.type === RiskEnum.OUTROS
                    ? 'Geral'
                    : data.riskFactor?.name || ''}
                </SText>
              </SFlex>

              {data?.riskData.map((riskData) => {
                if (!riskData?.exams?.length) return null;

                return (
                  <SFlex direction="column" key={riskData.id} gap={0}>
                    <Box mt={0} mb={2} component="ul">
                      {riskData?.exams?.map((exam) => {
                        const periodic = getExamPeriodic(exam?.examsRiskData);
                        return (
                          <Box component="li" key={exam.id}>
                            <SFlex direction="column" gap={0}>
                              <SText fontSize={14}>{exam.name}</SText>

                              <SFlex gap={6} mt={-2}>
                                <SText
                                  color="text.secondary"
                                  component="span"
                                  fontSize={10}
                                >
                                  Validade:{' '}
                                  {exam?.examsRiskData.validityInMonths
                                    ? exam?.examsRiskData.validityInMonths +
                                      ' meses'
                                    : '-'}
                                </SText>
                                <SText
                                  color="text.secondary"
                                  component="span"
                                  fontSize={10}
                                >
                                  sexo: {exam?.examsRiskData?.isMale && 'M'}
                                  {exam?.examsRiskData?.isMale &&
                                    exam?.examsRiskData?.isFemale &&
                                    ' / '}
                                  {exam?.examsRiskData?.isFemale && 'F'}
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
                                  Faixa etária:{' '}
                                  {getExamAge(exam?.examsRiskData)}
                                </SText>
                              </SFlex>
                            </SFlex>
                          </Box>
                        );
                      })}
                    </Box>
                    <SText lineHeight="1.4rem" fontSize={11} mt={0}>
                      <b>Origem:</b>{' '}
                      <SText
                        component="span"
                        sx={{
                          borderRadius: '4px',
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
                          onOpenRiskTool(riskData, data.riskFactor)
                        }
                      >
                        {riskData.origin ||
                          `${selectedNode?.label || selectedNode?.name} (${
                            originRiskMap?.[(selectedNode?.type || '') as any]
                              ?.name
                          })` ||
                          ''}
                      </SText>
                    </SText>
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
