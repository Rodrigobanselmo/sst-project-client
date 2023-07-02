import React, { FC } from 'react';

import { Box } from '@mui/material';
import { red, green } from '@mui/material/colors';
import { STagButton } from 'components/atoms/STagButton';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';

import { IExam } from 'core/interfaces/api/IExam';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EpiColumnProps } from './types';
import SFlex from 'components/atoms/SFlex';

export const ExamColumn: FC<{ children?: any } & EpiColumnProps> = ({
  handleSelect,
  data,
  handleRemove,
  handleEdit,
  risk,
  hideStandard,
}) => {
  const onAddExamsStandard = () => {
    handleSelect({ standardExams: !data?.standardExams }, {} as any);
  };

  const examRisk = data?.riskFactor?.examToRisk;
  const isExamToRiskInside = !!examRisk?.length;

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

      {data?.exams?.map((exam) => {
        if (exam.examsRiskData?.isStandard) return null;

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

      {!hideStandard && !!data && isExamToRiskInside && (
        <Box
          sx={{
            border: '1px solid',
            backgroundColor: 'gray.100',
            borderColor: 'gray.300',
            px: 3,
            py: 3,
            borderRadius: 1,
          }}
          mt={4}
        >
          {data?.exams?.map((exam) => {
            if (!exam.examsRiskData?.isStandard) return null;

            return (
              <SelectedTableItem
                key={exam.id + 'standard'}
                name={exam.name}
                tooltip={exam.name}
              />
            );
          })}
          <STagButton
            onClick={onAddExamsStandard}
            textProps={{
              sx: {
                color: !data?.standardExams
                  ? data?.standardExams === undefined
                    ? undefined
                    : 'error.main'
                  : 'success.dark',
              },
            }}
            text={
              data?.standardExams
                ? 'Padrão Ativo'
                : data?.standardExams === undefined
                ? 'Nenhum'
                : 'Padrão Inativo'
            }
            mt={4}
            sx={{
              borderColor: !data?.standardExams
                ? data?.standardExams === undefined
                  ? undefined
                  : 'error.main'
                : 'success.dark',
              color: !data?.standardExams
                ? data?.standardExams === undefined
                  ? undefined
                  : 'error.main'
                : 'success.dark',
              backgroundColor: !data?.standardExams
                ? data?.standardExams === undefined
                  ? undefined
                  : red[50]
                : green[50],
            }}
          />
        </Box>
      )}
    </Box>
  );
};
