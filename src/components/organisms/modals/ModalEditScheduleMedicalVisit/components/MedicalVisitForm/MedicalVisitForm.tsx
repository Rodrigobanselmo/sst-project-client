/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import { CompanyInputSelect } from 'components/organisms/inputSelect/CompanySelect/CompanyInputSelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { dateToDate } from 'core/utils/date/date-format';

import {
  IUseModalEditScheduleMedicalVisit,
  initialModalEditScheduleMedicalVisitState,
} from '../../hooks/useModalEditScheduleMedicalVisit';

export const MedicalVisitForm: FC<
  { children?: any } & IUseModalEditScheduleMedicalVisit
> = ({ setData, data, control, isEdit, tableRef, setValue }) => {
  return (
    <SFlex direction={'column'} gap={5}>
      <SFlex flexWrap="wrap" gap={5} mt={8}>
        <CompanyInputSelect
          onChange={(company) => {
            company &&
              setData?.((data) => ({
                ...data,
                company,
                companyId: company?.id,
              }));
            tableRef.current?.reset();
          }}
          inputProps={{
            placeholder: 'Empresa',
            labelPosition: 'top',
            sx: { maxWidth: 400, width: ['400px', '400px'] },
            superSmall: true,
          }}
          disableClearable
          defaultValue={data?.company}
          withDefaultCompany
          unmountOnChangeDefault
          name={'company'}
          label="Empresa"
          size="small"
          control={control}
          disabled={!!isEdit}
        />

        <SFlex align={'flex-end'} justifyContent={'flex-end'} mb={-3}>
          <StatusSelect
            selected={data.status}
            options={statusOptionsConstantExam}
            statusOptions={[
              StatusEnum.PROCESSING,
              StatusEnum.DONE,
              StatusEnum.CANCELED,
            ]}
            handleSelectMenu={(option: any) => {
              if (option?.value) setData({ ...data, status: option.value });
            }}
          />
        </SFlex>
      </SFlex>
      <SFlex flexWrap="wrap" gap={5} mt={8}>
        <Box>
          <Box maxWidth={200}>
            <DatePickerForm
              setValue={setValue}
              label="Data da visita"
              control={control}
              defaultValue={dateToDate(data.doneClinicDate)}
              placeholderText="__/__/__"
              name="doneClinicDate"
              labelPosition="top"
              inputProps={{
                superSmall: true,
              }}
              superSmall={true}
              unmountOnChangeDefault
              onChange={(date) => {
                setData({
                  ...data,
                  doneClinicDate: date instanceof Date ? date : undefined,
                });
              }}
            />
          </Box>
        </Box>
        <Box flex={2} maxWidth={400}>
          <ClinicInputSelect
            onChange={(clinic) => {
              setData({
                ...data,
                clinic,
              });
            }}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione a clínica...',
              superSmall: true,
            }}
            unmountOnChangeDefault
            defaultValue={data.clinic}
            name="clinic"
            label="Clínica"
            control={control}
            query={{}}
          />
        </Box>
        <Box flex={2} maxWidth={400}>
          <ProfessionalInputSelect
            disabled={!data.clinic?.id}
            addProfessionalInitProps={{ companyId: data.clinic?.id }}
            onChange={(prof) => {
              setData({
                ...data,
                doc: prof,
              });
            }}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione o médico...',
              superSmall: true,
            }}
            query={{ byCouncil: true, companyId: data.clinic?.id }}
            unmountOnChangeDefault
            defaultValue={data.doc}
            name="doc"
            label="Médico"
            control={control}
          />
        </Box>
      </SFlex>
      <SFlex flexWrap="wrap" gap={5} mt={8}>
        <Box>
          <Box maxWidth={200}>
            <DatePickerForm
              setValue={setValue}
              label="Data complementares"
              control={control}
              defaultValue={dateToDate(data.doneLabDate)}
              placeholderText="__/__/__"
              name="doneLabDate"
              labelPosition="top"
              inputProps={{
                superSmall: true,
              }}
              superSmall={true}
              unmountOnChangeDefault
              onChange={(date) => {
                setData({
                  ...data,
                  doneLabDate: date instanceof Date ? date : undefined,
                });
              }}
            />
          </Box>
        </Box>
        <Box flex={2} maxWidth={400}>
          <ClinicInputSelect
            onChange={(lab) => {
              setData({
                ...data,
                lab,
              });
            }}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione o laborátorio...',
              superSmall: true,
            }}
            unmountOnChangeDefault
            defaultValue={data.lab}
            name="lab"
            label="Laborátorio"
            control={control}
            query={{}}
          />
        </Box>
      </SFlex>

      <SFlex gap={8} mt={10} align="flex-start"></SFlex>
    </SFlex>
  );
};
