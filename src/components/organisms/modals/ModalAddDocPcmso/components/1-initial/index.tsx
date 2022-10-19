/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import dayjs from 'dayjs';

import { dateToString } from 'core/utils/date/date-format';
import { dateMask } from 'core/utils/masks/date.mask';

import { IUseAddCompany } from '../../hooks/useHandleActions';
import { useFirstStep } from './hooks/useFirstStep';

export const InitialModalStep = (props: IUseAddCompany) => {
  const { onSubmit, control, onCloseUnsaved, loading } = useFirstStep(props);

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
              width: ['100%', 700, 800],
              gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
            }}
          >
            <InputForm
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
          </Box>
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
