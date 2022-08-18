import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import dayjs from 'dayjs';
import { SexTypeEnum } from 'project/enum/risk.enums copy';

import { dateToDate } from 'core/utils/date/date-format';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { IUseEditEmployee } from '../../hooks/useEditEmployee';
import { usePersonalData } from './hooks/usePersonalData';

export const DataModalCompanyStep = (props: IUseEditEmployee) => {
  const { control, onSubmit, data, loading, onCloseUnsaved, isEdit, setData } =
    usePersonalData(props);

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SText color="text.label" fontSize={14} mb={5}>
          Identificação
        </SText>
        <SFlex flexWrap="wrap" gap={5}>
          <Box flex={5}>
            <InputForm
              autoFocus
              defaultValue={data.name}
              label="Nome"
              required
              labelPosition="center"
              control={control}
              placeholder={'nome completo do empregado...'}
              name="name"
              size="small"
            />
          </Box>
          <Box flex={3}>
            <InputForm
              defaultValue={data.socialName}
              label="Nome social"
              labelPosition="center"
              control={control}
              placeholder={'nome social do empregado...'}
              name="socialName"
              size="small"
            />
          </Box>
        </SFlex>
        <SFlex flexWrap="wrap" gap={5} mt={5} alignItems="end">
          <Box flex={5}>
            <InputForm
              defaultValue={data.cpf}
              label="CPF"
              required
              labelPosition="center"
              control={control}
              placeholder={'000.000.000-00'}
              name="cpf"
              mask={cpfMask.apply}
              size="small"
            />
          </Box>
          <Box flex={3}>
            <RadioForm
              control={control}
              defaultValue={data.sex}
              required
              name="type"
              row
              options={[
                { label: 'Feminino', value: SexTypeEnum.F },
                { label: 'Masculino', value: SexTypeEnum.M },
              ]}
            />
          </Box>
        </SFlex>
        <SFlex flexWrap="wrap" gap={5} mt={6}>
          <Box>
            <DatePickerForm
              label="Data de Nascimento"
              control={control}
              defaultValue={dateToDate(data.birthday)}
              name="birthday"
              onChange={(date) => {
                setData({
                  ...data,
                  birthday: date instanceof Date ? date : undefined,
                });
              }}
            />
          </Box>
          <Box>
            <InputForm
              sx={{ width: 80 }}
              defaultValue={data.nickname}
              label="Idade"
              labelPosition="center"
              control={control}
              placeholder={'idade'}
              value={data.birthday ? dayjs().diff(data.birthday, 'years') : ''}
              name="age"
              size="small"
            />
          </Box>
          <Box flex={3}>
            <InputForm
              defaultValue={data.nickname}
              label="Apelido"
              labelPosition="center"
              control={control}
              placeholder={'nome social do empregado...'}
              name="socialName"
              size="small"
            />
          </Box>
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
