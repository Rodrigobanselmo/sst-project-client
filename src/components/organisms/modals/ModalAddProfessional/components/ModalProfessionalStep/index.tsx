/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { professionalsOptionsList } from 'core/constants/maps/professionals.map';
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
}: IUseEditProfessional) => {
  const ufs = useMemo(() => {
    return getStates().map((state) => state.code);
  }, []);

  return (
    <SFlex direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
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

      <SFlex mt={5} flexWrap="wrap" gap={5}>
        <Box flex={5}>
          <InputForm
            defaultValue={professionalData.name}
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
            defaultValue={professionalData.cpf}
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

      <RadioFormText
        ball
        type="radio"
        label="Profissão*"
        control={control}
        defaultValue={String(professionalData.type)}
        onChange={(e) => {
          const type = (e as any).target.value as ProfessionalTypeEnum;

          if (type === ProfessionalTypeEnum.ENGINEER)
            setValue('councilType', 'CREA');
          else if (type === ProfessionalTypeEnum.NURSE)
            setValue('councilType', 'COREN');
          else if (type === ProfessionalTypeEnum.DOCTOR)
            setValue('councilType', 'CRM');
          else setValue('councilType', '');

          setProfessionalData((old) => ({
            ...old,
            type,
          }));
        }}
        options={professionalsOptionsList.map((professionalType) => ({
          content: professionalType.name,
          value: professionalType.value,
        }))}
        name="type"
        columns={3}
        mt={5}
      />

      <SText color="text.label" mt={5} fontSize={14}>
        Conselho
      </SText>
      <SFlex mt={5} flexWrap="wrap" gap={5}>
        <Box flex={5}>
          <InputForm
            defaultValue={professionalData.councilType}
            sx={{ minWidth: [100] }}
            label="Conselho"
            labelPosition="center"
            control={control}
            placeholder={'Exemplo: CREA, CRM'}
            name="councilType"
            size="small"
          />
        </Box>
        <Box flex={1}>
          <AutocompleteForm
            name="councilUF"
            control={control}
            placeholder={'estado...'}
            defaultValue={professionalData.councilUF}
            label="UF"
            sx={{ minWidth: [100] }}
            options={ufs}
            onChange={(e: typeof ufs[0]) =>
              setProfessionalData((old) => ({
                ...old,
                councilUF: e,
              }))
            }
          />
        </Box>
        <Box flex={1}>
          <InputForm
            defaultValue={professionalData.councilId}
            label="Identificação"
            labelPosition="center"
            sx={{ minWidth: [300, 400] }}
            control={control}
            placeholder={'identificação...'}
            name="councilId"
            size="small"
          />
        </Box>
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
