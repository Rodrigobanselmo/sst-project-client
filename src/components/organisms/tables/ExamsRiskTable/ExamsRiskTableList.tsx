import { FC } from 'react';

import { Box, BoxProps, LinearProgress } from '@mui/material';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ExamList } from 'components/organisms/main/Tree/OrgTree/components/ModalEditCard/components/ExamList/ExamList';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';

import { SExamIcon } from 'assets/icons/SExamIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { useQueryExamsHierarchy } from 'core/services/hooks/queries/useQueryExamsHierarchy/useQueryExamsHierarchy';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

export const ExamsRiskTableList: FC<BoxProps> = ({ ...props }) => {
  const { data: exams, isLoading: loadingExams } = useQueryExamsHierarchy(1);
  const { onOpenRiskToolSelected } = useOpenRiskTool();
  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;
  return (
    <Box {...props}>
      {(loadingExams || loadingRiskGroup) && <LinearProgress />}
      <>
        <STableTitle
          subtitle={
            <>
              Aqui você pode observar todos os exames vinculados diretamente a
              um cargo, grupo homogênio, atividate, etc
            </>
          }
          icon={SExamIcon}
        >
          Exames vinculados
        </STableTitle>
      </>
      {!loadingRiskGroup && !loadingExams && (
        <ExamList
          bgCard="grey.50"
          exams={exams}
          showRiskExam={true}
          onHandleOrigin={(origin) => {
            onOpenRiskToolSelected({
              riskFactor: origin.risk,
              homogeneousGroup: origin.homogeneousGroup,
              riskGroupId: riskGroupId,
            });
          }}
        />
      )}
    </Box>
  );
};
