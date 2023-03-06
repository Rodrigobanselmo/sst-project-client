/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUsePGRHandleModal } from '../../hooks/usePGRHandleActions';
import { SignatureAndValidation } from './components/SignatureAndValidation';
import { useMainStep } from './hooks/useMainStep';

export const MainModalStep = (props: IUsePGRHandleModal) => {
  const propsStep = useMainStep(props);
  const { onSubmit, control, onCloseUnsaved, loading, setValue } = propsStep;

  const { data, setData } = props;
  const buttons = [
    {},
    {
      text: 'Confirmar Dados',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            setValue={setValue}
            defaultValue={data?.name}
            multiline
            minRows={2}
            maxRows={4}
            label="Descrição"
            control={control}
            placeholder={'descrição...'}
            name="name"
            size="small"
            smallPlaceholder
            firstLetterCapitalize
          />

          <Box
            mt={5}
            sx={{
              gap: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
            }}
          >
            <InputForm
              setValue={setValue}
              defaultValue={data?.elaboratedBy}
              label="Elabora por*"
              control={control}
              placeholder={'nome do elaborador do documento...'}
              name="elaboratedBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
            <InputForm
              setValue={setValue}
              defaultValue={data?.revisionBy}
              label="Revisado por (opcional)"
              control={control}
              placeholder={' nome do resonsável pela revisão do documento...'}
              name="revisionBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
            <InputForm
              setValue={setValue}
              defaultValue={data?.approvedBy}
              label="Aprovado por (opcional)"
              control={control}
              placeholder={'nome de quem aprovou o documento...'}
              name="approvedBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
            <InputForm
              setValue={setValue}
              defaultValue={data?.coordinatorBy}
              label="Coordenador do programa (opcional)"
              control={control}
              placeholder={'pessoa responsavél por operacionalizar o PRG...'}
              name="coordinatorBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
          </Box>

          <SignatureAndValidation {...propsStep} />
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </div>
  );
};
