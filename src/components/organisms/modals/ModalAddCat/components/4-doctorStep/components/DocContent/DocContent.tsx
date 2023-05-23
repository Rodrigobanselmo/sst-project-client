/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { DateTimeForm } from 'components/molecules/form/date-time/DateTimeForm';
import { InputForm } from 'components/molecules/form/input';
import { CidInputSelect } from 'components/organisms/inputSelect/CidSelect/CidSelect';
import { Esocial17InjurySelect } from 'components/organisms/inputSelect/Esocial17InjurySelect/Esocial17InjurySelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import dayjs from 'dayjs';

import { dateToDate } from 'core/utils/date/date-format';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseDoctorData } from '../../hooks/useDoctorData';

export const DocContent = (props: IUseDoctorData) => {
  const { control, setCatData, catData, setValue } = props;
  return (
    <SFlex flexDirection="column" flexWrap="wrap" gap={5}>
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box>
          <DatePickerForm
            unmountOnChangeDefault
            placeholderText={'__/__/__'}
            control={control}
            defaultValue={dateToDate(catData.dtAtendimento)}
            name="dtAtendimento"
            labelPosition="top"
            calendarProps={{
              filterDate: (date) =>
                dayjs(date).add(1, 'd').isAfter(catData.dtAcid),
            }}
            sx={{ maxWidth: 240 }}
            label="Data atendimento*"
            onChange={(date) => {
              setCatData({
                ...catData,
                dtAtendimento: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>
        <Box mr={50}>
          <DateTimeForm
            name="hrAtendimento"
            unmountOnChangeDefault
            control={control}
            onChange={(e) => setCatData({ ...catData, hrAtendimento: e })}
            setValue={(v) => setValue('hrAtendimento', String(v))}
            defaultValue={catData.hrAtendimento || ''}
            label="Hora*"
            get15TimeArray={[6, 0, 22, 0]}
          />
        </Box>

        <Box minWidth={300}>
          <InputForm
            defaultValue={String(catData.durTrat || '') || ''}
            setValue={setValue}
            name="durTrat"
            label="Duração estimada do tratamento*"
            labelPosition="top"
            control={control}
            endAdornment="dias"
            placeholder="em dias"
            size="small"
            mask={intMask.apply}
          />
        </Box>
      </SFlex>

      <SFlex flexWrap="wrap" mb={5} gap={5} align="end">
        <Box>
          <SCheckBox
            label="Indicativo de internação?"
            checked={catData.isIndInternacao}
            onChange={(e) => {
              setCatData({
                ...catData,
                isIndInternacao: e.target?.checked,
              });
            }}
          />
        </Box>
        <Box>
          <SCheckBox
            label="Deverá afastar durante o tratamento?"
            checked={catData.isIndAfast}
            onChange={(e) => {
              setCatData({
                ...catData,
                isIndAfast: e.target?.checked,
              });
            }}
          />
        </Box>
      </SFlex>

      <Box mb={5}>
        <ProfessionalInputSelect
          query={{ byCouncil: true, companyId: catData.companyId }}
          onChange={(prof) => {
            setCatData((d) => ({ ...d, doc: prof, docId: prof?.id }));
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'selecione o médico...',
            name: 'doc',
          }}
          simpleAdd
          unmountOnChangeDefault
          defaultValue={catData?.doc}
          name="doc"
          docOnly
          label="Médico*"
          control={control}
        />
      </Box>

      <Box mb={5}>
        <CidInputSelect
          onChange={(cid) => {
            setCatData((d) => ({ ...d, cid: cid, codCID: cid?.cid }));
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'selecione o CID...',
          }}
          defaultValue={catData.cid}
          name="cid"
          label="CID*"
          control={control}
        />
      </Box>

      <Box mb={5}>
        <Esocial17InjurySelect
          onChange={(prof) => {
            setCatData((d) => ({ ...d, esocialLesao: prof }));
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'selecione...',
          }}
          unmountOnChangeDefault
          defaultValue={catData?.esocialLesao}
          name="esocialLesao"
          label="Natureza da lesão*"
          control={control}
        />
      </Box>

      <InputForm
        defaultValue={catData?.dscCompLesao}
        name="dscCompLesao"
        label="Descrição complementar da lesão (opcional)"
        control={control}
        setValue={setValue}
        placeholder={'descrição...'}
        size="small"
        minRows={2}
        maxRows={4}
        multiline
      />
      <InputForm
        defaultValue={catData?.diagProvavel}
        name="diagProvavel"
        label="Diagnóstico provável (opcional)"
        setValue={setValue}
        control={control}
        placeholder={'descreva...'}
        size="small"
        minRows={2}
        maxRows={4}
        multiline
      />
      <InputForm
        defaultValue={catData?.observacao}
        name="observacao"
        label="Observação (opcional)"
        control={control}
        setValue={setValue}
        placeholder={'observação...'}
        size="small"
        minRows={3}
        maxRows={4}
        multiline
      />
    </SFlex>
  );
};
