import React, { FC } from 'react';

import { Box } from '@mui/material';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';

import { IExam } from 'core/interfaces/api/IExam';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EpiColumnProps } from './types';

export const ExamColumn: FC<EpiColumnProps> = ({
  handleSelect,
  data,
  handleRemove,
  handleEdit,
  risk,
}) => {
  return (
    <Box>
      <ExamSelect
        asyncLoad
        disabled={!risk?.id}
        text={'adicionar'}
        tooltipTitle=""
        multiple={false}
        handleSelect={(options: IExam) => {
          if (options.id)
            handleSelect(
              {
                exams: [{ ...options?.examsRiskData, examId: options.id }],
              },
              options,
            );
        }}
      />
      {data &&
        data.exams?.map((exam) => {
          return (
            <SelectedTableItem
              key={exam.id}
              // isExpired={isExpired}
              handleEdit={() => handleEdit(exam)}
              name={`${exam.name}`}
              tooltip={`${exam.name}`}
              handleRemove={() => {
                handleRemove({
                  exams: [exam.examsRiskData || exam],
                });
              }}
            />
          );
        })}
    </Box>
  );
};
