/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { TypeInputModal } from 'components/organisms/modals/ModalSingleInput';
import dayjs from 'dayjs';

import { dateMonthMask } from 'core/utils/masks/date.mask';

import { IUseAddCompany } from '../../hooks/useHandleActions';
import { useStep } from './hooks/useStep';

export const ProfessionalModalStep = (props: IUseAddCompany) => {
  const { onSubmit, control, onPrevStep, loading, onAddArray, onDeleteArray } =
    useStep(props);

  const { data } = props;
  const buttons = [
    {
      text: 'Voltar',
    },
    {
      text: 'Confirmar Dados',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex width={['100%', 600]} gap={8} direction="column" mt={8}>
          <SText color="text.label" fontSize={14} mb={-2}>
            Vigência do documento
          </SText>
          <Box
            mt={5}
            sx={{
              gap: 10,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <InputForm
              defaultValue={data?.validityStart || dayjs().format('MM/YYYY')}
              label="Início da vigência do PGR"
              control={control}
              placeholder={'00/0000'}
              name="validityStart"
              size="small"
              smallPlaceholder
              mask={dateMonthMask.apply}
            />
            <InputForm
              defaultValue={
                data?.validityEnd || data.complementarySystems.length > 0
                  ? dayjs().add(3, 'years').format('MM/YYYY')
                  : dayjs().add(2, 'years').format('MM/YYYY')
              }
              label="Expiração do PGR"
              control={control}
              placeholder={'00/0000'}
              name="validityEnd"
              size="small"
              smallPlaceholder
              mask={dateMonthMask.apply}
            />
          </Box>
          <SDisplaySimpleArray
            values={data.users || []}
            valueField="name"
            onAdd={(_, user) => user && onAddArray(user, 'users')}
            onDelete={(_, user) => user && onDeleteArray(user, 'users')}
            label={'Profissionais responsaveis pela elaboração do PGR'}
            buttonLabel={'Adicionar Profissional'}
            modalLabel={'Adicionar Profissional'}
            type={TypeInputModal.PROFESSIONAL}
          />
        </SFlex>
      </AnimatedStep>
      <SModalButtons loading={loading} onClose={onPrevStep} buttons={buttons} />
    </div>
  );
};
