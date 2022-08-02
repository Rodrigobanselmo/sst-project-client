/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box } from '@mui/material';
import SAutocompleteSelect from 'components/atoms/SAutocompleteSelect';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SelectForm } from 'components/molecules/form/select';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { SHierarchyIcon } from 'assets/icons/SHierarchyIcon';

import { professionalsOptionsList } from 'core/constants/maps/professionals.map';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseEditProfessional } from '../../hooks/useEditProfessionals';

export const ModalProfessionalStep = ({
  professionalData,
  control,
  setProfessionalData,
  setValue,
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
            placeholder={'nome completo do empregado...'}
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
            autoFocus
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

      <RadioForm
        ball
        type="radio"
        label="Profissão*"
        control={control}
        defaultValue={String(professionalData.type)}
        onChange={(e) => {
          const type = (e as any).target.value as ProfessionalTypeEnum;

          if (type === ProfessionalTypeEnum.ENGINEER)
            setValue('councilType', 'CREA');
          if (type === ProfessionalTypeEnum.DOCTOR)
            setValue('councilType', 'CRM');
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
            autoFocus
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
          <SAutocompleteSelect
            name="councilUF"
            placeholder={'estado...'}
            label="UF"
            sx={{ minWidth: [100] }}
            options={ufs}
            onChange={(e) =>
              setProfessionalData((old) => ({
                ...old,
                councilUF: (e as any).target.value,
              }))
            }
          />
        </Box>
        <Box flex={1}>
          <InputForm
            autoFocus
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
