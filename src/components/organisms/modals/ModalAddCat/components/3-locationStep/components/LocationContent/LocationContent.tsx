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
import { Esocial6CountrySelect } from 'components/organisms/inputSelect/Esocial6CountrySelect/Esocial6CountrySelect';
import { EsocialCatSelect } from 'components/organisms/inputSelect/EsocialCatSelect/EsocialCatSelect';
import { EsocialCitiesSelect } from 'components/organisms/inputSelect/EsocialCitiesSelect/EsocialCitiesSelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';

import {
  iniciatCATList,
  lateralidadeList,
  tpAcidList,
  tpCatList,
  tpInscList,
  tpLocalList,
} from 'core/interfaces/api/ICat';
import { dateToDate } from 'core/utils/date/date-format';
import { cepMask } from 'core/utils/masks/cep.mask';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseLocationData } from '../../hooks/useLocationData';

export const LocationContent = (props: IUseLocationData) => {
  const {
    control,
    setCatData,
    catData,
    setValue,
    onChangeCep,
    cepRequired,
    localEmpty,
    cityUfRequired,
    countryRequired,
    ufs,
    askCompany,
    onChangeCnpj,
    company,
  } = props;

  return (
    <SFlex flexDirection="column" flexWrap="wrap" gap={5}>
      {/* Type Local */}
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box width={['100%', 500]}>
          <SelectForm
            unmountOnChangeDefault
            defaultValue={catData?.tpLocal || ''}
            control={control}
            placeholder="selecione..."
            name="tpLocal"
            label="Tipo de local*"
            labelPosition="top"
            onChange={(e) => {
              if (e.target.value) {
                onChangeCnpj(company.cnpj);

                setCatData({
                  ...catData,
                  tpLocal: e.target.value as number,
                });
              }
            }}
            size="small"
            options={tpLocalList}
          />
        </Box>
      </SFlex>

      {askCompany && (
        <SFlex flexWrap="wrap" mb={5} gap={5}>
          <Box width={['100%', 200]}>
            <SelectForm
              unmountOnChangeDefault
              onChange={(e) => {
                if (e.target.value) {
                  setCatData({
                    ...catData,
                    ideLocalAcidTpInsc: e.target.value as number,
                  });
                }
              }}
              defaultValue={catData?.ideLocalAcidTpInsc || ''}
              control={control}
              placeholder="selecione..."
              name="ideLocalAcidTpInsc"
              setValue={setValue}
              label="Tipo de empresa*"
              labelPosition="top"
              size="small"
              options={tpInscList}
            />
          </Box>
          <Box flex={1}>
            <InputForm
              defaultValue={catData.ideLocalAcidCnpj}
              setValue={setValue}
              label="CNPJ/CAEPF*"
              control={control}
              onChange={({ target: { value } }) =>
                onChangeCnpj(value as string)
              }
              sx={{ maxWidth: 300 }}
              placeholder={''}
              name="ideLocalAcidCnpj"
              size="small"
              id="ideLocalAcidCnpj"
              labelPosition="top"
              mask={cnpjMask.apply}
            />
          </Box>
        </SFlex>
      )}

      {!localEmpty && (
        <>
          <SFlex flexWrap="wrap" mb={5} gap={5}>
            <InputForm
              defaultValue={cepMask.mask(catData?.cep || '') || ''}
              mask={cepMask.apply}
              label={`CEP${cepRequired ? '*' : ''}`}
              labelPosition="center"
              control={control}
              onChange={({ target: { value } }) => onChangeCep(value)}
              placeholder={'00.000-000'}
              name="cep"
              size="small"
            />
          </SFlex>
          <SFlex flexWrap="wrap" mb={0} gap={5}>
            <Box minWidth={200}>
              <Esocial20LogradSelect
                onChange={(data) => {
                  setCatData((d) => ({
                    ...d,
                    esocialLograd: data,
                    tpLograd: data?.code,
                  }));
                }}
                inputProps={{
                  labelPosition: 'center',
                  placeholder: 'selecione...',
                }}
                unmountOnChangeDefault
                defaultValue={catData?.esocialLograd}
                name="esocialLograd"
                label="Tipo Logradouro"
                control={control}
              />
            </Box>
            <Box flex={1}>
              <InputForm
                defaultValue={catData.dscLograd || ''}
                label="Logradouro"
                labelPosition="center"
                control={control}
                name="dscLograd"
                size="small"
              />
            </Box>
          </SFlex>
          <InputForm
            defaultValue={catData?.bairro || ''}
            label="Bairro"
            labelPosition="center"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            name="bairro"
            size="small"
          />
          <SFlex
            sx={{ display: 'grid', gridTemplateColumns: '1fr 150px ' }}
            mt={0}
          >
            <EsocialCitiesSelect
              onChange={(data) => {
                setCatData((d) => ({
                  ...d,
                  city: data,
                }));
              }}
              inputProps={{
                labelPosition: 'center',
                placeholder: 'selecione...',
              }}
              unmountOnChangeDefault
              defaultValue={catData?.city}
              name="city"
              label={`Município${cityUfRequired ? '*' : ''}`}
              control={control}
            />
            <AutocompleteForm
              name="uf"
              inputProps={{
                labelPosition: 'center',
                placeholder: '__',
                name: 'uf',
              }}
              unmountOnChangeDefault
              control={control}
              placeholder={'selecione...'}
              defaultValue={catData.uf || ''}
              setValue={(v) => setValue('uf', v)}
              label={`UF${cityUfRequired ? '*' : ''}`}
              sx={{ minWidth: [100] }}
              options={ufs}
              onChange={(e: (typeof ufs)[0]) =>
                setCatData((old) => ({
                  ...old,
                  uf: e,
                }))
              }
            />
          </SFlex>
          <SFlex sx={{ display: 'grid', gridTemplateColumns: ' 1fr 150px' }}>
            <InputForm
              defaultValue={catData?.complemento || ''}
              label="Complemento"
              labelPosition="center"
              control={control}
              name="complemento"
              size="small"
            />
            <InputForm
              defaultValue={catData?.nrLograd || ''}
              label="Número"
              labelPosition="center"
              control={control}
              name="nrLograd"
              size="small"
              mask={intMask.apply}
            />
          </SFlex>
        </>
      )}

      {countryRequired && (
        <SFlex flexWrap="wrap" gap={5}>
          <Box flex={1}>
            <Esocial6CountrySelect
              onChange={(data) => {
                setCatData((d) => ({
                  ...d,
                  countryCodeEsocial6: data,
                }));
              }}
              inputProps={{
                labelPosition: 'top',
                placeholder: 'selecione o pais...',
              }}
              unmountOnChangeDefault
              defaultValue={catData?.countryCodeEsocial6}
              name="countryCodeEsocial6"
              label="Pais*"
              control={control}
            />
          </Box>
          <Box flex={1}>
            <InputForm
              defaultValue={catData?.codPostal}
              label="Código de Endereçamento Postal*"
              setValue={setValue}
              control={control}
              placeholder={'código postal...'}
              name="codPostal"
              size="small"
            />
          </Box>
        </SFlex>
      )}

      <Box>
        <InputForm
          defaultValue={catData?.dscLocal}
          label="Descrição do local (opcional)"
          setValue={setValue}
          helperText={
            'Especificação do local do acidente (pátio, rampa de acesso, posto de trabalho...)'
          }
          control={control}
          placeholder={'observações...'}
          name="dscLocal"
          size="small"
          minRows={3}
          maxRows={6}
          multiline
        />
      </Box>
    </SFlex>
  );
};
