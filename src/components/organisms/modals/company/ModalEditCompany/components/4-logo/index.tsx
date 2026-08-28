import React from 'react';

import { Box, styled } from '@mui/material';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { ColorHexInputForm } from './ColorHexInputForm';
import { useCompanyEdit } from './hooks/useCompanyThirdEdit';

const StyledImage = styled('img')`
  height: 150px;
  max-width: 300px;
  border: 2px solid ${({ theme }) => theme.palette.divider};
  background-color: transparent;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 0.5;
  }
`;

export const FourthModalCompanyStep = (props: IUseAddCompany) => {
  const {
    control,
    onSubmit,
    loading,
    onCloseUnsaved,
    handleAddPhoto,
    handleAddCustomLogo,
    handleAddLightLogo,
    handleAddDarkLogo,
    handleRemovePhoto,
    handleRemoveCustomLogo,
    handleRemoveLightLogo,
    handleRemoveDarkLogo,
    previousStep,
    setValue,
  } = useCompanyEdit(props);
  const { companyData, setCompanyData, isEdit } = props;

  const buttons = [
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      text: isEdit ? 'Salvar' : 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText color="text.label" fontSize={14} mb={-2}>
            Logo da empresa
          </SText>
          <SFlex align="center" gap={4}>
            <StyledImage
              alt={companyData.name}
              src={companyData.logoUrl || '/images/placeholder-image.png'}
              onClick={handleAddPhoto}
            />
            {companyData.logoUrl && (
              <SIconButton
                tooltip="Remover logo"
                onClick={handleRemovePhoto}
                size="small"
              >
                <SDeleteIcon />
              </SIconButton>
            )}
          </SFlex>
          <InputForm
            setValue={setValue}
            defaultValue={companyData.operationTime}
            label="Horário de Trabalho"
            control={control}
            labelPosition="center"
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'horário de funcionamento da empresa...'}
            name="operationTime"
            helperText="Exemplo: De Segunda-Feira a Sexta-Feira: Das 08:00 às 12:00 e das 13:00 às 17:48"
            size="small"
          />

          <InputForm
            setValue={setValue}
            multiline
            defaultValue={companyData.description}
            minRows={2}
            maxRows={4}
            labelPosition="center"
            label="Observação"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'observação opcional sobre a empresa...'}
            name="description"
            size="small"
          />

          <SText color="text.label" fontSize={16} fontWeight="500" mt={4}>
            Identidade Visual
          </SText>

          <Box ml={7}>
            <SSwitch
              onChange={() => {
                setCompanyData((oldData) => ({
                  ...oldData,
                  metadata: {
                    ...oldData.metadata,
                    visualIdentityEnabled:
                      !oldData.metadata?.visualIdentityEnabled,
                  },
                }));
              }}
              checked={!!companyData.metadata?.visualIdentityEnabled}
              label="Ativado"
              sx={{ mr: 4 }}
              color="text.light"
            />
          </Box>

          <RadioFormText
            type="radio"
            setValue={setValue}
            control={control}
            label="Tema da interface"
            defaultValue={
              companyData.metadata?.interfaceTheme === 'dark' ? 'dark' : 'light'
            }
            onChange={(e) =>
              setCompanyData((oldData) => ({
                ...oldData,
                metadata: {
                  ...oldData.metadata,
                  interfaceTheme: (e as any).target.value,
                },
              }))
            }
            options={[
              { content: 'Claro', value: 'light' },
              { content: 'Escuro', value: 'dark' },
            ]}
            name="metadata.interfaceTheme"
            columns={2}
            sx={{ maxWidth: 600 }}
          />

          <InputForm
            setValue={setValue}
            defaultValue={companyData.metadata?.shortName}
            label="Nome Encurtado"
            control={control}
            labelPosition="center"
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'Nome curto da empresa para personalização...'}
            name="metadata.shortName"
            helperText="Nome curto que será usado para personalizar a interface do sistema"
            size="small"
          />

          <ColorHexInputForm
            setValue={setValue}
            defaultValue={companyData.metadata?.primaryColor}
            label="Cor Principal"
            control={control}
            name="metadata.primaryColor"
            helperText="Cor principal que será usada na identidade visual do sistema"
          />

          <SText color="text.label" fontSize={14} mb={-2} mt={4}>
            Logo padrão da interface
          </SText>
          <SFlex align="center" gap={4}>
            <StyledImage
              alt="Logo padrão da interface"
              src={
                companyData.metadata?.customLogoUrl ||
                '/images/placeholder-image.png'
              }
              onClick={handleAddCustomLogo}
            />
            {companyData.metadata?.customLogoUrl && (
              <SIconButton
                tooltip="Remover logo padrão"
                onClick={handleRemoveCustomLogo}
                size="small"
              >
                <SDeleteIcon />
              </SIconButton>
            )}
          </SFlex>
          <SText color="text.light" fontSize={12} mt={-2}>
            Fallback quando o modo Claro ou Escuro não tiver logo própria.
            PNG com transparência.
          </SText>

          <SText color="text.label" fontSize={14} mb={-2} mt={4}>
            Logo para modo Claro
          </SText>
          <SFlex align="center" gap={4}>
            <StyledImage
              alt="Logo modo claro"
              src={
                companyData.metadata?.logoLightUrl ||
                '/images/placeholder-image.png'
              }
              onClick={handleAddLightLogo}
            />
            {companyData.metadata?.logoLightUrl && (
              <SIconButton
                tooltip="Remover logo do modo claro"
                onClick={handleRemoveLightLogo}
                size="small"
              >
                <SDeleteIcon />
              </SIconButton>
            )}
          </SFlex>

          <SText color="text.label" fontSize={14} mb={-2} mt={4}>
            Logo para modo Escuro
          </SText>
          <SFlex align="center" gap={4}>
            <StyledImage
              alt="Logo modo escuro"
              src={
                companyData.metadata?.logoDarkUrl ||
                '/images/placeholder-image.png'
              }
              onClick={handleAddDarkLogo}
            />
            {companyData.metadata?.logoDarkUrl && (
              <SIconButton
                tooltip="Remover logo do modo escuro"
                onClick={handleRemoveDarkLogo}
                size="small"
              >
                <SDeleteIcon />
              </SIconButton>
            )}
          </SFlex>

          <ColorHexInputForm
            setValue={setValue}
            defaultValue={
              companyData.metadata?.sidebarBackgroundColor || '#1A202C'
            }
            label="Cor de Fundo da Sidebar"
            control={control}
            name="metadata.sidebarBackgroundColor"
            helperText="Cor de fundo da sidebar"
          />
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
