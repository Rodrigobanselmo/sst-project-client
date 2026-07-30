/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
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
  onAddArray,
  onDeleteArray,
  onEditArray,
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
            setValue={setValue}
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
            setValue={setValue}
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
              setValue={setValue}
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
              setValue={setValue}
              size="small"
            />
          </Box>
        </SFlex>
      )}

      <RadioForm
        name="type"
        label="Profissão*"
        setValue={setValue}
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

      <SDisplaySimpleArray
        mt={5}
        values={professionalData.formation || []}
        onAdd={(value) => onAddArray(value, 'formation')}
        onDelete={(value) => onDeleteArray(value, 'formation')}
        onEdit={(_, values) => onEditArray(_, values, 'formation')}
        label="Formações e títulos profissionais"
        buttonLabel="Adicionar formação"
        placeholder="ex.: Engenheiro de Segurança do Trabalho"
        modalLabel="Adicionar formação ou título"
      />

      <Box mt={5}>
        <SText color="text.label" mb={2} fontSize={14}>
          Conselhos profissionais
        </SText>
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
      </Box>

      <SDisplaySimpleArray
        mt={5}
        values={professionalData.certifications || []}
        onAdd={(value) => onAddArray(value, 'certifications')}
        onDelete={(value) => onDeleteArray(value, 'certifications')}
        onEdit={(_, values) => onEditArray(_, values, 'certifications')}
        label="Credenciais complementares"
        buttonLabel="Adicionar credencial"
        placeholder="ex.: ABHO — Membro nº 1113"
        modalLabel="Adicionar credencial complementar"
      />

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
