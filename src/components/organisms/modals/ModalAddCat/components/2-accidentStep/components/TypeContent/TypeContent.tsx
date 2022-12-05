/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { DateTimeForm } from 'components/molecules/form/date-time/DateTimeForm';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { CidInputSelect } from 'components/organisms/inputSelect/CidSelect/CidSelect';
import { Esocial13BodySelect } from 'components/organisms/inputSelect/Esocial13BodySelect/Esocial13BodySelect';
import { Esocial14And15AcidSelect } from 'components/organisms/inputSelect/Esocial14And15AcidSelect/Esocial14And15AcidSelect';
import { Esocial15AcidSelect } from 'components/organisms/inputSelect/Esocial15AcidSelect/Esocial15AcidSelect';
import { Esocial20LogradSelect } from 'components/organisms/inputSelect/Esocial20LogradSelect/Esocial20LogradSelect';
import { EsocialCatSelect } from 'components/organisms/inputSelect/EsocialCatSelect/EsocialCatSelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';

import {
  iniciatCATList,
  lateralidadeList,
  tpAcidList,
  tpCatList,
} from 'core/interfaces/api/ICat';
import { dateToDate } from 'core/utils/date/date-format';

import { EmployeeContent } from '../../../1-employeeStep/components/EmployeeContent/EmployeeContent';
import { IUseAccidentData } from '../../hooks/useAccidentData';

export const TypeContent = (props: IUseAccidentData) => {
  const {
    control,
    setCatData,
    catData,
    setValue,
    isDeath,
    hrsWorked,
    isShowOrigin,
    isEdit,
  } = props;
  return (
    <SFlex flexDirection="column" flexWrap="wrap" gap={5}>
      {isEdit && <EmployeeContent {...props} />}

      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box width={320} mt={5}>
          <SelectForm
            setValue={setValue}
            unmountOnChangeDefault
            defaultValue={catData?.tpCat || ''}
            control={control}
            sx={{ maxWidth: ['100%', 300] }}
            placeholder="selecione o tipo de CAT..."
            name="tpCat"
            label="Tipo Cat*"
            labelPosition="top"
            onChange={(e) => {
              if (e.target.value) {
                setCatData({
                  ...catData,
                  tpCat: e.target.value as number,
                });
              }
            }}
            size="small"
            options={tpCatList}
          />
        </Box>

        <Box width={340} mt={5}>
          <SelectForm
            unmountOnChangeDefault
            defaultValue={catData?.iniciatCAT || ''}
            setValue={setValue}
            control={control}
            sx={{ maxWidth: ['100%', 400] }}
            placeholder="selecione iniciativa..."
            name="iniciatCAT"
            label="Iniciativa*"
            labelPosition="top"
            onChange={(e) => {
              if (e.target.value) {
                setCatData({
                  ...catData,
                  iniciatCAT: e.target.value as number,
                });
              }
            }}
            size="small"
            options={iniciatCATList}
          />
        </Box>
      </SFlex>

      {/* receipt */}
      {isShowOrigin && (
        <SFlex flexWrap="wrap" mb={5} gap={5}>
          {isDeath && (
            <Box>
              <DatePickerForm
                unmountOnChangeDefault
                placeholderText={'__/__/__'}
                control={control}
                defaultValue={dateToDate(catData.dtObito)}
                name="dtObito"
                labelPosition="top"
                sx={{ maxWidth: 240 }}
                label="Data óbito*"
                onChange={(date) => {
                  setCatData({
                    ...catData,
                    dtObito: date instanceof Date ? date : undefined,
                  });
                }}
              />
            </Box>
          )}
          <Box flex={1} minWidth={450}>
            <EsocialCatSelect
              onChange={(data) => {
                setCatData((d) => ({
                  ...d,
                  catOrigin: data,
                  catOriginId: data?.id,
                }));
              }}
              query={{
                employeeId: catData.employeeId,
                onlyCompany: true,
                withReceipt: true,
              }}
              inputProps={{
                labelPosition: 'top',
                placeholder: 'selecione...',
              }}
              unmountOnChangeDefault
              defaultValue={catData?.catOrigin}
              name="catOrigin"
              label="Cat de Origem (última CAT referente ao mesmo acidente/doença)"
              control={control}
            />
          </Box>
        </SFlex>
      )}

      {/* DATE */}
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box>
          <DatePickerForm
            unmountOnChangeDefault
            placeholderText={'__/__/__'}
            control={control}
            defaultValue={dateToDate(catData.dtAcid)}
            name="dtAcid"
            labelPosition="top"
            sx={{ maxWidth: 240 }}
            label="Data Acidente*"
            onChange={(date) => {
              setCatData({
                ...catData,
                dtAcid: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>
        <Box mr={50}>
          <DateTimeForm
            name="hrAcid"
            unmountOnChangeDefault
            control={control}
            onChange={(e) => setCatData({ ...catData, hrAcid: e })}
            setValue={(v) => setValue('hrAcid', v)}
            defaultValue={catData.hrAcid || ''}
            label="Hora*"
            get15TimeArray={[6, 0, 22, 0]}
          />
        </Box>

        {hrsWorked && (
          <Box>
            <DateTimeForm
              name="hrsTrabAntesAcid"
              unmountOnChangeDefault
              control={control}
              onChange={(e) => setCatData({ ...catData, hrsTrabAntesAcid: e })}
              setValue={(v) => setValue('hrsTrabAntesAcid', v)}
              defaultValue={catData.hrsTrabAntesAcid || ''}
              label="Após qts horas de trabalho:*"
              get15TimeArray={[0, 0, 23, 0]}
              sx={{ minWidth: 100 }}
              boxProps={{
                minWidth: 220,
              }}
            />
          </Box>
        )}
      </SFlex>
      <SFlex flexWrap="wrap" mb={5} gap={5} align="end">
        <Box mr={30}>
          <DatePickerForm
            unmountOnChangeDefault
            placeholderText={'__/__/__'}
            control={control}
            defaultValue={dateToDate(catData.ultDiaTrab)}
            name="ultDiaTrab"
            labelPosition="top"
            sx={{ maxWidth: 240 }}
            label="Ult. dia trabalho*"
            onChange={(date) => {
              setCatData({
                ...catData,
                ultDiaTrab: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>
      </SFlex>

      {/* ACI */}
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box width={['100%', 220]}>
          <SelectForm
            unmountOnChangeDefault
            setValue={setValue}
            defaultValue={catData?.tpAcid || ''}
            control={control}
            placeholder="selecione..."
            name="tpAcid"
            label="Tipo Acidente*"
            labelPosition="top"
            onChange={(e) => {
              if (e.target.value) {
                setCatData({
                  ...catData,
                  tpAcid: e.target.value as number,
                });
              }
            }}
            size="small"
            options={tpAcidList}
          />
        </Box>

        <Box flex={1}>
          <Esocial15AcidSelect
            onChange={(data) => {
              setCatData((d) => ({
                ...d,
                esocialSitGeradora: data,
                codSitGeradora: data?.code,
              }));
            }}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione motivo...',
            }}
            unmountOnChangeDefault
            defaultValue={catData?.esocialSitGeradora}
            name="esocialSitGeradora"
            label="Situação geradora*"
            control={control}
          />
        </Box>
      </SFlex>

      {/* ACI Ag */}
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box flex={1}>
          <Esocial14And15AcidSelect
            onChange={(data) => {
              setCatData((d) => ({
                ...d,
                esocialAgntCausador: data,
                codAgntCausador: data?.code,
              }));
            }}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione...',
            }}
            unmountOnChangeDefault
            defaultValue={catData?.esocialAgntCausador}
            name="esocialAgntCausador"
            label="Agente causador*"
            control={control}
          />
        </Box>
      </SFlex>

      <SFlex flexWrap="wrap" mb={0} gap={5} align="end">
        <Box>
          <SCheckBox
            label="Houve reg. policial?"
            checked={Boolean(catData.isIndComunPolicia)}
            onChange={(e) => {
              setCatData({
                ...catData,
                isIndComunPolicia: e.target?.checked,
              });
            }}
          />
        </Box>
        <Box>
          <SCheckBox
            label="Houve afastamento?"
            checked={Boolean(catData.houveAfast)}
            onChange={(e) => {
              setCatData({
                ...catData,
                houveAfast: e.target?.checked,
              });
            }}
          />
        </Box>
      </SFlex>

      {/* BODY */}
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box flex={1} mt={5}>
          <Esocial13BodySelect
            onChange={(data) => {
              setCatData((d) => ({
                ...d,
                codParteAtingEsocial13: data,
                codParteAtingEsocial: data?.code,
              }));
            }}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione...',
            }}
            unmountOnChangeDefault
            defaultValue={catData?.codParteAtingEsocial13}
            name="codParteAtingEsocial13"
            label="Parte do corpo*"
            control={control}
          />
        </Box>

        <Box flex={1} mt={5}>
          <SelectForm
            unmountOnChangeDefault
            defaultValue={String(catData?.lateralidade || '') || ''}
            setValue={setValue}
            control={control}
            sx={{ maxWidth: ['100%', 260] }}
            placeholder="selecione iniciativa..."
            name="lateralidade"
            label="Lateralidade*"
            labelPosition="top"
            onChange={(e) => {
              setCatData({
                ...catData,
                lateralidade: Number(e.target.value),
              });
            }}
            size="small"
            options={lateralidadeList}
          />
        </Box>
      </SFlex>

      <InputForm
        defaultValue={catData?.obsCAT}
        label="Observação CAT"
        setValue={setValue}
        control={control}
        placeholder={'observações...'}
        name="obsCAT"
        size="small"
        minRows={3}
        maxRows={6}
        multiline
      />

      {/* <Box maxWidth={800}>
        <Esocial20LogradSelect
          onChange={(data) => {
            setCatData((d) => ({
              ...d,
              esocialLograd: data,
              tpLograd: data?.code,
            }));
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'selecione tipo de logradouro...',
          }}
          unmountOnChangeDefault
          defaultValue={catData?.esocialLograd}
          name="esocialLograd"
          label="Tipo Logradouro"
          control={control}
        />
      </Box> */}

      <Box maxWidth={800}></Box>
    </SFlex>
  );
};
