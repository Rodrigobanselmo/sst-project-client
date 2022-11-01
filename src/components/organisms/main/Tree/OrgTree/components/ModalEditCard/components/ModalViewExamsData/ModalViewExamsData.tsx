import React, { useState } from 'react';

import { Box, Icon, LinearProgress } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { SSwitch } from 'components/atoms/SSwitch';
import STooltip from 'components/atoms/STooltip';
import {
  getExamAge,
  getExamPeriodic,
} from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { RiskEnum } from 'project/enum/risk.enums';

import SAddIcon from 'assets/icons/SAddIcon';
import SStarIcon from 'assets/icons/SStarIcon';

import { useQueryExamsHierarchy } from 'core/services/hooks/queries/useQueryExamsHierarchy/useQueryExamsHierarchy';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

import SFlex from '../../../../../../../../atoms/SFlex';
import SText from '../../../../../../../../atoms/SText';
import { ITreeSelectedItem } from '../../../../interfaces';
import { useModalCardActions } from '../../hooks/useModalCardActions';
import { ExamList } from '../ExamList/ExamList';

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

      <SFlex justify="space-between" mb={10}>
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
          <Icon
            sx={{ fontSize: 20, mr: 4, color: 'success.dark' }}
            component={SAddIcon}
          />
          Adicionar exames ao cargo
        </SButton>
        <SSwitch
          onChange={() => {
            setShowRiskExam(!showRiskExam);
          }}
          label="Mostrar origem"
          checked={showRiskExam}
          sx={{ mr: 4 }}
          color="text.light"
        />
      </SFlex>
      <ExamList
        exams={exams}
        showRiskExam={showRiskExam}
        hierarchyId={hierarchyId}
        onHandleOrigin={(origin) => {
          onOpenRiskTool(origin.homogeneousGroup, origin.risk);
        }}
      />
    </SFlex>
  );
};
