import React from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { UnmountBox } from 'components/molecules/form/unmount-box';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { CboSelect } from 'components/organisms/inputSelect/CboSelect/CboSelect';
import { CompanyInputSelect } from 'components/organisms/inputSelect/CompanySelect/CompanyInputSelect';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import dayjs from 'dayjs';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { IdsEnum } from 'core/enums/ids.enums';
import { dateToDate } from 'core/utils/date/date-format';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { IUseEditEmployee } from '../../hooks/useEditEmployee';
import { usePersonalData } from './hooks/usePersonalData';

export const DataModalCompanyStep = (props: IUseEditEmployee) => {
  const {
    control,
    onSubmit,
    data,
    loading,
    onCloseUnsaved,
    isEdit,
    setData,
    setValue,
  } = usePersonalData(props);

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
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box>
          <Box mb={10}>
            <CompanyInputSelect
              onChange={(company) => {
                company &&
                  setData?.({ ...data, company, companyId: company?.id });
              }}
              inputProps={{
                placeholder: 'Empresa',
                labelPosition: 'top',
                sx: { maxWidth: 400 },
              }}
              disableClearable
              defaultValue={data?.company}
              withDefaultCompany
              unmountOnChangeDefault
              name={'company'}
              label="Empresa"
              control={control}
            />
          </Box>
          <SText color="text.label" fontSize={14} mb={8}>
            Funcionário
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
                setValue={setValue}
              />
            </Box>
            <Box flex={3}>
              <InputForm
                defaultValue={data.socialName}
                label="Nome social"
                labelPosition="center"
                setValue={setValue}
                control={control}
                placeholder={'nome social do empregado...'}
                name="socialName"
                size="small"
              />
            </Box>
          </SFlex>

          {/* CPF */}
          <SFlex flexWrap="wrap" gap={5} mt={8} alignItems="end">
            <Box flex={5}>
              <InputForm
                defaultValue={cpfMask.mask(data.cpf)}
                label="CPF"
                required
                labelPosition="center"
                control={control}
                placeholder={'000.000.000-00'}
                name="cpf"
                mask={cpfMask.apply}
                size="small"
                setValue={setValue}
              />
            </Box>
            <Box flex={5}>
              <InputForm
                defaultValue={data.rg}
                label="RG"
                required
                labelPosition="center"
                control={control}
                placeholder={'00000000-0'}
                name="rg"
                size="small"
                setValue={setValue}
              />
            </Box>
            <Box flex={3}>
              <RadioForm
                control={control}
                defaultValue={data.sex}
                required
                unmountOnChangeDefault
                name="sex"
                row
                options={[
                  { label: 'Feminino', value: SexTypeEnum.F },
                  { label: 'Masculino', value: SexTypeEnum.M },
                ]}
              />
            </Box>
          </SFlex>

          <SFlex flexWrap="wrap" gap={5} mt={6} mb={8}>
            <Box>
              <DatePickerForm
                label="Data de Nascimento"
                placeholderText={'__/__/__'}
                calendarProps={{
                  open: false,
                  excludeDateIntervals: [
                    {
                      start: dayjs().add(-12, 'y').toDate(),
                      end: dayjs().add(100, 'y').toDate(),
                    },
                  ],
                }}
                unmountOnChangeDefault
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
                label="Idade"
                labelPosition="center"
                control={control}
                placeholder={'idade'}
                value={
                  data.birthday ? dayjs().diff(data.birthday, 'years') : ''
                }
                name="age"
                size="small"
                disabled
                setValue={setValue}
              />
            </Box>
            <Box flex={3}>
              <InputForm
                defaultValue={data.nickname}
                label="Apelido"
                labelPosition="center"
                control={control}
                placeholder={'nome social do empregado...'}
                name="nickname"
                setValue={setValue}
                size="small"
              />
            </Box>
          </SFlex>
          <SFlex mr={-6} mt={-3} justify="end">
            <SSwitch
              onChange={() => {
                setData({
                  ...data,
                  isComorbidity: !data.isComorbidity,
                });
              }}
              checked={data.isComorbidity}
              label="Possui comorbidade"
              sx={{ mr: 4 }}
              color="text.light"
            />
          </SFlex>

          <SText color="text.label" fontSize={14} mb={5} mt={5}>
            Contato
          </SText>
          <SFlex flexWrap="wrap" gap={5} mb={6}>
            <Box flex={5}>
              <InputForm
                defaultValue={data.email}
                label="Email"
                labelPosition="center"
                setValue={setValue}
                control={control}
                placeholder={'email do funcionário...'}
                name="email"
                size="small"
              />
            </Box>
            <Box flex={3}>
              <InputForm
                defaultValue={data.phone}
                label="Telefone"
                labelPosition="center"
                control={control}
                setValue={setValue}
                placeholder={'telefone do funcionário...'}
                name="phone"
                size="small"
              />
            </Box>
          </SFlex>

          <SFlex flexWrap="wrap" gap={5} mb={6}>
            <Box mt={10}>
              <InputForm
                sx={{ width: 300 }}
                defaultValue={data.esocialCode}
                setValue={setValue}
                label="Matrícula eSocial"
                labelPosition="top"
                control={control}
                placeholder={'código de matrícula...'}
                name="esocialCode"
                size="small"
              />
            </Box>
            <Box mt={10} width={400}>
              <CboSelect
                onChange={(data) => {
                  setData((d) => ({
                    ...d,
                    cbo: data?.code,
                  }));
                }}
                inputProps={{
                  labelPosition: 'top',
                  placeholder: 'selecione...',
                }}
                unmountOnChangeDefault
                defaultValue={{ code: data?.cbo, desc: '' } as any}
                name="cbo"
                label="CBO"
                control={control}
              />
            </Box>
          </SFlex>
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
