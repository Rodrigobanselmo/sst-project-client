import { FC } from 'react';

import { Box, BoxProps, LinearProgress } from '@mui/material';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ExamList } from 'components/organisms/main/Tree/OrgTree/components/ModalEditCard/components/ExamList/ExamList';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';

import { SExamIcon } from 'assets/icons/SExamIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { useQueryExamsHierarchy } from 'core/services/hooks/queries/useQueryExamsHierarchy/useQueryExamsHierarchy';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

export const ExamsRiskTableList: FC<
  { children?: any } & BoxProps & {
      companyFlowSticky?: boolean;
      companyFlowBelowTabs?: boolean;
    }
> = ({ companyFlowSticky = false, companyFlowBelowTabs = false, ...props }) => {
  const { data: exams, isLoading: loadingExams } = useQueryExamsHierarchy(1, {
    skipAllExams: true,
  });
  const { onOpenRiskToolSelected } = useOpenRiskTool();
  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;

  const sectionTitle = (
    <STableTitle
      subtitle={
        <>
          Aqui você pode observar todos os exames vinculados diretamente a um
          cargo, grupo homogênio, atividate, etc
        </>
      }
      icon={SExamIcon}
    >
      Exames vinculados
    </STableTitle>
  );

  const examList = !loadingRiskGroup && !loadingExams && (
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
  );

  return (
    <Box {...props} mt={companyFlowSticky ? 8 : 0}>
      {(loadingExams || loadingRiskGroup) && <LinearProgress />}
      {companyFlowSticky ? (
        <>
          <CompanyFlowStickySubheader belowModuleTabs={companyFlowBelowTabs}>
            {sectionTitle}
          </CompanyFlowStickySubheader>
          {examList}
        </>
      ) : (
        <>
          {sectionTitle}
          {examList}
        </>
      )}
    </Box>
  );
};
