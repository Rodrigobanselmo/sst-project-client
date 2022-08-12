/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import SLinkIcon from 'assets/icons/SLinkIcon';
import SMailIcon from 'assets/icons/SMailIcon';

import {
  professionalsHealthOptionsList,
  professionalsOptionsList,
} from 'core/constants/maps/professionals.map';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseEditProfessional } from '../../hooks/useEditProfessionals';

export const ModalProfessionalStep = ({
  professionalData,
  control,
  setProfessionalData,
  setValue,
  companies,
  isManyCompanies,
  onGetProfessional,
}: IUseEditProfessional) => {
  const ufs = useMemo(() => {
    return getStates().map((state) => state.code);
  }, []);

  const handleDebounceChange = useDebouncedCallback(() => {
    onGetProfessional({});
  }, 800);

  return (
    <SFlex direction="column" mt={8}>
      <SText color="text.label" mb={5} fontSize={14}>
        Dados Pessoais
      </SText>
      <SFlex flexWrap="wrap" gap={5}>
        <Box flex={5}>
          <InputForm
            autoFocus
            defaultValue={professionalData.name}
            sx={{ minWidth: [300, 500] }}
            label="Nome*"
            labelPosition="center"
            control={control}
            placeholder={'nome completo do profissional...'}
            name="name"
            size="small"
          />
        </Box>
        <Box flex={1}>
          <InputForm
            defaultValue={professionalData.cpf}
            label="CPF"
            onChange={(e) => {
              onGetProfessional({ cpf: e.target.value });
            }}
            sx={{ minWidth: 200 }}
            labelPosition="center"
            control={control}
            placeholder={'000.000.000-00'}
            name="cpf"
            mask={cpfMask.apply}
            size="small"
          />
        </Box>
      </SFlex>

      <SFlex mt={5} flexWrap="wrap" gap={5} mb={5}>
        <Box flex={5}>
          <InputForm
            defaultValue={professionalData.email}
            sx={{ minWidth: [300, 500] }}
            label="Email"
            labelPosition="center"
            control={control}
            placeholder={'email...'}
            name="email"
            size="small"
          />
        </Box>
        <Box flex={1}>
          <InputForm
            defaultValue={professionalData.phone}
            label="Telefone"
            sx={{ minWidth: 200 }}
            labelPosition="center"
            control={control}
            placeholder={'(00) 00000-0000'}
            name="phone"
            mask={phoneMask.apply}
            size="small"
          />
        </Box>
      </SFlex>

      <RadioForm
        name="type"
        label="Profissão*"
        control={control}
        defaultValue={String(professionalData.type)}
        row
        onChange={(e) => {
          const type = (e as any).target.value as ProfessionalTypeEnum;

          if (type === ProfessionalTypeEnum.ENGINEER)
            setValue('councilType', 'CREA');
          else if (type === ProfessionalTypeEnum.NURSE)
            setValue('councilType', 'COREN');
          else if (type === ProfessionalTypeEnum.DOCTOR)
            setValue('councilType', 'CRM');
          // else if (type === ProfessionalTypeEnum.SPEECH_THERAPIST)
          //   setValue('councilType', 'CFF');
          else setValue('councilType', '');

          setProfessionalData((old) => ({
            ...old,
            type,
          }));
        }}
        options={(professionalData.isClinic
          ? professionalsHealthOptionsList
          : professionalsOptionsList
        ).map((professionalType) => ({
          label: professionalType.name,
          value: professionalType.value,
        }))}
      />

      <SText color="text.label" mt={5} fontSize={14}>
        Conselho
      </SText>
      <SFlex mt={3} flexWrap="wrap" gap={5}>
        <Box flex={5}>
          <AutocompleteForm
            name="councilType"
            control={control}
            freeSolo
            getOptionLabel={(option) => String(option)}
            inputProps={{
              labelPosition: 'center',
              placeholder: 'Exemplo: CREA, CRM',
              name: 'councilType',
            }}
            onChange={() => handleDebounceChange()}
            setValue={(v) => setValue('councilType', v)}
            defaultValue={professionalData.councilType || ''}
            sx={{ minWidth: [100] }}
            label=""
            options={['CRM', 'CREA', 'COREM']}
          />
        </Box>
        <Box flex={1}>
          <AutocompleteForm
            name="councilUF"
            control={control}
            placeholder={'estado...'}
            defaultValue={professionalData.councilUF}
            label="UF"
            inputProps={{
              labelPosition: 'center',
            }}
            sx={{ minWidth: [100] }}
            options={ufs}
            value={professionalData.councilUF}
            onChange={(e: typeof ufs[0]) => {
              onGetProfessional({});
              setProfessionalData((old) => ({
                ...old,
                councilUF: e,
              }));
            }}
          />
        </Box>
        <Box flex={1}>
          <InputForm
            defaultValue={professionalData.councilId}
            label="Identificação"
            labelPosition="center"
            sx={{ minWidth: [300, 400] }}
            control={control}
            onChange={() => handleDebounceChange()}
            placeholder={'identificação...'}
            name="councilId"
            size="small"
          />
        </Box>
      </SFlex>

      <SText color="text.label" mt={5} fontSize={14}>
        Acesso ao Sistema
      </SText>
      <SFlex>
        <SButton
          sx={{ backgroundColor: 'gray.600' }}
          color="secondary"
          size="small"
        >
          <Icon sx={{ color: 'common.white', mr: 5 }} component={SMailIcon} />
          Enviar convite por email
        </SButton>
        <SButton
          color="secondary"
          size="small"
          sx={{ backgroundColor: 'gray.600' }}
        >
          <Icon sx={{ color: 'common.white', mr: 5 }} component={SLinkIcon} />
          Gerar link de convite
        </SButton>
      </SFlex>
      {!professionalData.id && isManyCompanies && (
        <>
          <RadioForm
            sx={{ mt: 8 }}
            label="Selecione a empresa do profissional*"
            control={control}
            defaultValue={String(professionalData.companyId)}
            name="companyId"
            options={companies.map((company) => ({
              label: company.name,
              value: company.id,
            }))}
          />
        </>
      )}
      {!!professionalData.id && (
        <StatusSelect
          sx={{ maxWidth: '90px', mt: 10 }}
          selected={professionalData.status}
          statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
          handleSelectMenu={(option) =>
            setProfessionalData((old) => ({
              ...old,
              status: option.value,
            }))
          }
        />
      )}
    </SFlex>
  );
};
