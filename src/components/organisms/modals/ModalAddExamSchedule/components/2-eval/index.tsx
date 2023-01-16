import React from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ExamInputSelect } from 'components/organisms/inputSelect/ExamSelect/ExamSelect';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { IdsEnum } from 'core/enums/ids.enums';

import { IUseEditEmployee } from '../../hooks/useEditExamEmployee';
import { useExamsStep } from './hooks/useEvalStep';

export const EvalStep = (props: IUseEditEmployee) => {
  const {
    control,
    onSubmit,
    data,
    loading,
    onCloseUnsaved,
    isEdit,
    setData,
    previousStep,
    evalExam,
  } = useExamsStep(props);

  const buttons = [
    {},
    {
      text: 'Voltar',
      arrowBack: true,
      variant: 'outlined',
      onClick: () => previousStep(),
    },
    {
      text: 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box mt={2}>
          <SText color="text.label" fontSize={16}>
            Selecionar Avaliação Médica
          </SText>
          <Divider sx={{ mb: 5, mt: 3 }} />
          <ExamInputSelect
            onChange={(avaliationExam) => {
              setData({
                ...data,
                avaliationExam,
                examsData: !avaliationExam
                  ? []
                  : [
                      {
                        name: avaliationExam.name,
                        id: avaliationExam.id,
                        isSelected: true,
                        isAvaliation: true,
                        validityInMonths: 0,
                      },
                    ],
              });
            }}
            query={{ isAvaliation: true }}
            clearOnBlur={false}
            clearOnEscape={false}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione o exame...',
              autoFocus: true,
            }}
            defaultValue={data?.avaliationExam || (evalExam as any)}
            name="avaliationExam"
            label=""
            control={control}
          />
        </Box>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SFlex>
  );
};
