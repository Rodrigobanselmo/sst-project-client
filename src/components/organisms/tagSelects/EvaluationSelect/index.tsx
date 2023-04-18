import React, { FC } from 'react';

import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import { STagSelect } from 'components/molecules/STagSelect';
import {
  employeeExamEvaluationTypeList,
  employeeExamEvaluationTypeMap,
} from 'project/enum/employee-exam-history-evaluation.enum';

import SCancelIcon from 'assets/icons/SCancelIcon';

import { IStatusSelectProps } from './types';

export const EvaluationSelect: FC<IStatusSelectProps> = ({
  selected,
  ...props
}) => {
  return (
    <STagSelect
      options={employeeExamEvaluationTypeList.map((type) => ({
        name: type.content,
        value: type.value,
      }))}
      tooltipTitle={selected && employeeExamEvaluationTypeMap[selected].content}
      text={
        selected
          ? employeeExamEvaluationTypeMap[selected].content
          : 'Sem avaliação'
      }
      large
      icon={selected ? employeeExamEvaluationTypeMap[selected].icon : null}
      iconMenu={() => <></>}
      iconProps={{
        sx: {
          color: selected
            ? employeeExamEvaluationTypeMap[selected].color
            : 'error.main',
          fontSize: '15px',
        },
      }}
      {...props}
    />
  );
};
