/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { CouncilShow } from 'components/organisms/forms/UserForm/CouncilShow/CouncilShow';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import { SLinkIcon } from 'assets/icons/SLinkIcon';

import {
  professionalsDocOptionsList,
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
  handleCopy,
  onGetProfessional,
  link,
  userFound,
  isEdit,
  onAddCouncil,
  onDeleteCouncil,
  getCouncilValue,
  loadingCouncil,
  onEditCouncil,
}: IUseEditProfessional) => {
  const handleDebounceChange = useDebouncedCallback((x: any = {}) => {
    onGetProfessional(x);
  }, 800);

  const optionsList = () => {
    if (professionalData.docOnly) return professionalsDocOptionsList;

    if (professionalData.isClinic) {
      if (
        !professionalData.type ||
        !!professionalsHealthOptionsList.find(
          (med) => med.value === professionalData.type,
        )
      )
        return professionalsHealthOptionsList;
      return professionalsOptionsList;
    }

    return professionalsOptionsList;
  };
  return (
    <SFlex direction="column" mt={8}>
      <SText color="text.label" mb={5} fontSize={14}>
        Dados Pessoais
      </SText>
      <SFlex flexWrap="wrap" gap={5} mb={professionalData.simpleAdd ? 5 : 0}>
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
            disabled={!isEdit && !!userFound}
          />
        </Box>
        <Box flex={1}>
          <InputForm
            defaultValue={professionalData.cpf}
            label="CPF"
            onChange={(e) => {
              onGetProfessional({ cpf: e.target.value || ' ' });
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

      {!professionalData.simpleAdd && (
        <SFlex mt={5} flexWrap="wrap" gap={5} mb={5}>
          <Box flex={5}>
            <InputForm
              defaultValue={professionalData.email}
              sx={{ minWidth: [300, 500] }}
              label="Email"
              onChange={(e) => handleDebounceChange({ email: e.target.value })}
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
      )}

      <RadioForm
        name="type"
        label="Profissão*"
        control={control}
        defaultValue={String(professionalData.type)}
        row
        onChange={(e) => {
          const type = (e as any).target.value as ProfessionalTypeEnum;

          setProfessionalData((old) => ({
            ...old,
            type,
          }));
        }}
        options={optionsList().map((professionalType) => ({
          label: professionalType.name,
          value: professionalType.value,
        }))}
      />

      <CouncilShow
        data={professionalData.councils || []}
        onAdd={(v) => onAddCouncil(v as any)}
        onEdit={(v, index) => onEditCouncil(v as any, index)}
        onDelete={(v) => onDeleteCouncil(v as any)}
        initialValues={{ councilType: getCouncilValue() }}
        control={control}
        setValue={setValue}
        loading={loadingCouncil}
      />

      {/* <SText color="text.label" mt={5} fontSize={14}>
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
              handleDebounceChange();
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
      </SFlex> */}

      {!professionalData.simpleAdd && (
        <>
          <SText color="text.label" mt={5} fontSize={14}>
            Acesso ao Sistema
          </SText>
          {!!professionalData.userId && (
            <STag
              action="add"
              width="200px"
              sx={{
                backgroundColor: 'gray.600',
                color: 'white',
                fontSize: '14px',
                py: 2,
              }}
              text="Profissional já cadastrado"
            />
          )}
          {!professionalData.userId && (
            <>
              <STagButton
                tooltipTitle={'copiar'}
                icon={SLinkIcon}
                onClick={() => handleCopy()}
                sx={{ mr: 10, width: 'fit-content' }}
                bg={'gray.500'}
                active={true}
                text={link}
              />
              <Box ml={7} mt={5}>
                <SSwitch
                  onChange={() => {
                    setProfessionalData({
                      ...professionalData,
                      sendEmail: !professionalData.sendEmail,
                    });
                  }}
                  checked={professionalData.sendEmail}
                  label="Enviar convite por email"
                  sx={{ mr: 4 }}
                  color="text.light"
                />
              </Box>
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
          )}{' '}
        </>
      )}
    </SFlex>
  );
};
