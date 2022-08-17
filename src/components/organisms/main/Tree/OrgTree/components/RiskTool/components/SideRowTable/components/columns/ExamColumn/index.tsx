import React, { FC } from 'react';

import { Box } from '@mui/material';
import { red, green } from '@mui/material/colors';
import { STagButton } from 'components/atoms/STagButton';
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
  const onAddExamsStandard = () => {
    handleSelect({ standardExams: !data?.standardExams }, {} as any);
  };

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
      {data && (
        <STagButton
          onClick={onAddExamsStandard}
          textProps={{
            sx: {
              color: !data?.standardExams ? 'error.main' : 'success.dark',
            },
          }}
          text={data?.standardExams ? 'Padrão Ativo' : 'Padrão Inativo'}
          mt={4}
          sx={{
            borderColor: !data?.standardExams ? 'error.main' : 'success.dark',
            color: !data?.standardExams ? 'error.main' : 'success.dark',
            backgroundColor: !data?.standardExams ? red[50] : green[50],
          }}
        />
      )}
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
