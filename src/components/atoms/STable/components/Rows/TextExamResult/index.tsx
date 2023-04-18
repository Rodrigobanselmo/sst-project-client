import { FC } from 'react';

import SText from 'components/atoms/SText';

import SFlex from 'components/atoms/SFlex';
import { EvaluationSelect } from 'components/organisms/tagSelects/EvaluationSelect';
import { employeeExamConclusionTypeMap } from 'project/enum/employee-exam-history-conclusion.enum';
import { TextHierarchyRowProps } from './types';

export const TextExamResult: FC<TextHierarchyRowProps> = ({
  historyExam,
  onChangeEvaluation,
  employeeId,
  onlyClinic,
  ...props
}) => {
  if (!historyExam.exam || !employeeId) return <div />;

  return (
    <SFlex {...props} key={historyExam.exam.id}>
      {historyExam.exam?.isAttendance ? (
        <EvaluationSelect
          selected={historyExam.evaluationType}
          large={false}
          sx={{
            minWidth: '120px',
            maxWidth: '120px',
          }}
          handleSelectMenu={(option, e) => {
            e.stopPropagation();
            onChangeEvaluation?.({
              id: historyExam.id,
              employeeId,
              evaluationType: option.value,
            });
          }}
        />
      ) : onlyClinic ? (
        <SText
          fontSize={12}
          lineNumber={1}
          textAlign="center"
          width={'100%'}
          sx={{ opacity: 1 }}
          mt={1}
        >
          {employeeExamConclusionTypeMap[historyExam.conclusion]?.content ||
            'SEM RESULTADO'}
        </SText>
      ) : null}
    </SFlex>
  );
};
