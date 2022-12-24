import React, { useMemo, useState } from 'react';

import { Box, Icon, LinearProgress } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagRisk } from 'components/atoms/STagRisk';
import STooltip from 'components/atoms/STooltip';
import { SCheckRiskDocInfo } from 'components/molecules/SCheckRiskDocInfo';
import {
  getExamAge,
  getExamPeriodic,
} from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { getRiskDoc } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { useSnackbar } from 'notistack';
import { RiskOrderEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

import SAddIcon from 'assets/icons/SAddIcon';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskDocInfo, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutUpsertRiskDocInfo } from 'core/services/hooks/mutations/checklist/risk/useMutUpsertRiskDocInfo';
import { useQueryRiskDataByHierarchy } from 'core/services/hooks/queries/useQueryRiskDataByHierarchy';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { dateToString } from 'core/utils/date/date-format';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import SFlex from '../../../../../../../../atoms/SFlex';
import SText from '../../../../../../../../atoms/SText';
import { ITreeSelectedItem } from '../../../../interfaces';
import { useModalCardActions } from '../../hooks/useModalCardActions';

interface IModalRiskDataViewProps {
  selectedNode: ITreeSelectedItem | null;
}

const isRiskDataInactive = (riskData: IRiskData) => {
  const isHomoInactive =
    riskData.homogeneousGroup?.status == StatusEnum.INACTIVE;

  const isInactive = riskData.endDate || isHomoInactive;

  return { isInactive, isHomoInactive };
};

export const ModalViewRiskData = ({
  selectedNode,
}: IModalRiskDataViewProps) => {
  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;
  const hierarchyId = String(selectedNode?.id)?.split('//')[0];
  const [showRiskExam, setShowRiskExam] = useState(false);
  const companyId = riskGroupData?.[riskGroupData.length - 1]?.companyId;

  const { onOpenOfficeRiskTool, onOpenRiskTool } = useModalCardActions({
    hierarchyId,
    riskGroupId,
    selectedNode,
  });

  const { data: riskDataHierarchy, isLoading: loadingRiskData } =
    useQueryRiskDataByHierarchy(hierarchyId);

  const upsertRiskDocInfo = useMutUpsertRiskDocInfo();
  const { enqueueSnackbar } = useSnackbar();

  const onChangeRiskDocInfo = (docInfo: Partial<IRiskDocInfo>) => {
    if (!docInfo.riskId) return;

    upsertRiskDocInfo.mutateAsync({
      ...docInfo,
      hierarchyId,
      companyId,
      riskId: docInfo.riskId,
    });
  };

  const riskDataMemo = useMemo(() => {
    const risks: Record<
      string,
      { riskData: IRiskData[]; riskFactor: IRiskFactors }
    > = {};

    riskDataHierarchy.forEach((riskData) => {
      if (riskData?.riskFactor?.representAll) return;

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
      )
      .map((risk) => ({
        ...risk,
        isEndDate: risk.riskData.every((rd) => {
          const { isInactive } = isRiskDataInactive(rd);
          return isInactive;
        }),
      }));
  }, [riskDataHierarchy]);

  return (
    <SFlex direction="column" minHeight={220}>
      {(loadingRiskGroup || loadingRiskData) && <LinearProgress />}
      <SFlex justify="space-between" mb={10}>
        <SButton
          size="small"
          sx={{
            backgroundColor: 'grey.100',
            width: 'fit-content',
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
          <Icon
            sx={{ fontSize: 20, mr: 4, color: 'success.dark' }}
            component={SAddIcon}
          />
          Adicionar riscos ao cargo
        </SButton>
        <SSwitch
          onChange={() => {
            setShowRiskExam(!showRiskExam);
          }}
          label="Mostar exames"
          checked={showRiskExam}
          sx={{ mr: 4 }}
          color="text.light"
        />
      </SFlex>
      <SFlex direction="column" gap={5}>
        {riskDataMemo.map((data) => {
          return (
            <SFlex
              gap={0}
              sx={{ cursor: 'pointer' }}
              direction="column"
              key={data.riskFactor.id}
            >
              <SFlex>
                <STagRisk
                  isEndDate={data.isEndDate}
                  riskFactor={data.riskFactor}
                />
              </SFlex>

              <SCheckRiskDocInfo
                onUnmount={upsertRiskDocInfo.isError}
                onSelectCheck={(docInfo) =>
                  onChangeRiskDocInfo({
                    ...docInfo,
                    riskId: data.riskFactor.id,
                  })
                }
                riskDocInfo={getRiskDoc(data?.riskFactor, {
                  companyId,
                  firstHierarchy: true,
                })}
              />

              <>
                {data?.riskData.map((riskData) => {
                  const { isHomoInactive, isInactive } =
                    isRiskDataInactive(riskData);

                  const endText =
                    isInactive && isHomoInactive
                      ? '(INATIVO) '
                      : `(Data fim: ${dateToString(riskData.endDate)}) `;

                  return (
                    <SFlex direction="column" key={riskData.id} gap={0}>
                      {showRiskExam && (
                        <Box mt={0} mb={2} component="ul">
                          {riskData?.exams?.map((exam) => {
                            const periodic = getExamPeriodic(
                              exam?.examsRiskData,
                            );
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
                      )}
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
                            ...(isInactive && {
                              borderColor: 'error.main',
                              color: 'error.main',
                            }),
                          }}
                          fontSize={11}
                          onClick={() => {
                            if (isHomoInactive)
                              return enqueueSnackbar(
                                'Grupo homogênio inativo',
                                {
                                  variant: 'error',
                                  anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'center',
                                  },
                                },
                              );

                            onOpenRiskTool(
                              riskData.homogeneousGroup,
                              data.riskFactor,
                            );
                          }}
                        >
                          {isInactive ? endText : ''}

                          {riskData.origin ||
                            `${selectedNode?.label || selectedNode?.name} (${
                              originRiskMap?.[(selectedNode?.type || '') as any]
                                ?.name
                            })` ||
                            ''}

                          {riskData?.exams && riskData?.exams?.length > 0 && (
                            <STooltip
                              title={riskData.exams
                                .map((e) => e.name)
                                .join(', ')}
                            >
                              <Box display="inline">
                                <SText
                                  component="span"
                                  fontSize={13}
                                  color="info.main"
                                  ml={2}
                                  mb={-2}
                                >
                                  ✓
                                </SText>
                              </Box>
                            </STooltip>
                          )}
                        </SText>
                      </SText>
                    </SFlex>
                  );
                })}
              </>
            </SFlex>
          );
        })}
      </SFlex>
    </SFlex>
  );
};

//?origin as span text in row
// <SText lineHeight="1.4rem" fontSize={11} mt={0}>
//   <b>Origem:</b>{' '}
//   {data?.riskData.map((riskData) => (
//     <SText
//       component="span"
//       key={riskData.id}
//       sx={{
//         borderRadius: '4px',
//         mr: 1,
//         backgroundColor: 'background.box',
//         px: 3,
//         py: '1px',
//         border: '1px solid',
//         borderColor: 'grey.400',
//         '&:hover': {
//           textDecoration: 'underline',
//         },
//       }}
//       fontSize={11}
//       onClick={() => onOpenRiskTool(riskData, data.riskFactor)}
//     >
//       {riskData.origin ||
//         `${selectedNode?.label || selectedNode?.name} (${
//           originRiskMap?.[(selectedNode?.type || '') as any]?.name
//         })` ||
//         ''}

//       {riskData?.exams && riskData?.exams?.length > 0 && (
//         <STooltip
//           title={riskData.exams.map((e) => e.name).join(', ')}
//         >
//           <Box display="inline">
//             <SText
//               component="span"
//               fontSize={13}
//               color="info.main"
//               ml={2}
//               mb={-2}
//             >
//               ✓
//             </SText>
//           </Box>
//         </STooltip>
//       )}
//     </SText>
//   ))}
// </SText>
