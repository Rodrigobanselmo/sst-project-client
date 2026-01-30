import React from 'react';
import { useDropzone } from 'react-dropzone';

import { Box, styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { FormProvider } from 'react-hook-form';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCoverEdit } from './hooks/useCoverEdit';

const DropzoneContainer = styled(Box)`
  position: relative;
  display: inline-block;
`;

const StyledImage = styled('img')<{ isDragActive?: boolean }>`
  height: 200px;
  max-width: 400px;
  border: 2px ${({ isDragActive }) => (isDragActive ? 'dashed' : 'solid')}
    ${({ isDragActive, theme }) =>
      isDragActive ? theme.palette.primary.main : theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  object-fit: contain;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    border-color: ${({ theme }) => theme.palette.grey[400]};
  }
  &:active {
    opacity: 0.5;
  }
`;

const DragOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  z-index: 1;
  pointer-events: none;
`;

const SectionTitle = styled(SText)`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-top: 16px;
  margin-bottom: 8px;
`;

export const CoverModalCompanyStep = (props: IUseAddCompany) => {
  const {
    form,
    onSubmit,
    loading,
    onCloseUnsaved,
    previousStep,
    handleAddBackgroundImage,
    handleFileDrop,
    backgroundImagePath,
    handlePreview,
    isPreviewLoading,
  } = useCoverEdit(props);

  const { control, setValue } = form;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'image/heic': ['.heic'],
    },
    maxFiles: 1,
    noClick: true,
  });

  const buttons = [
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      variant: 'outlined',
      text: 'Preview',
      onClick: handlePreview,
      loading: isPreviewLoading,
    },
    {
      text: 'Salvar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <FormProvider {...form}>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText color="text.label" fontSize={14} mb={-2}>
            Imagem de Fundo da Capa
          </SText>
          <DropzoneContainer {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive && (
              <DragOverlay>
                <SText color="primary.main" fontWeight={600}>
                  Solte a imagem aqui
                </SText>
              </DragOverlay>
            )}
            <StyledImage
              alt="Capa do documento"
              src={backgroundImagePath || '/images/placeholder-image.png'}
              onClick={handleAddBackgroundImage}
              isDragActive={isDragActive}
            />
          </DropzoneContainer>
          <SText color="text.secondary" fontSize={12}>
            Clique na imagem ou arraste e solte para fazer upload de uma nova
            capa
          </SText>

          <SectionTitle>Posição do Logo</SectionTitle>
          <SFlex gap={8} flexWrap="wrap">
            <InputForm
              setValue={setValue}
              label="X"
              control={control}
              name="logoX"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Y"
              control={control}
              name="logoY"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Largura Máx"
              control={control}
              name="maxLogoWidth"
              type="number"
              size="small"
              sx={{ width: 120 }}
            />
            <InputForm
              setValue={setValue}
              label="Altura Máx"
              control={control}
              name="maxLogoHeight"
              type="number"
              size="small"
              sx={{ width: 120 }}
            />
          </SFlex>

          <SectionTitle>Posição do Título</SectionTitle>
          <SFlex gap={8} flexWrap="wrap">
            <InputForm
              setValue={setValue}
              label="X"
              control={control}
              name="titleX"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Y"
              control={control}
              name="titleY"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Box X"
              control={control}
              name="titleBoxX"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Box Y"
              control={control}
              name="titleBoxY"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Tamanho"
              control={control}
              name="titleSize"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Cor"
              control={control}
              name="titleColor"
              size="small"
              sx={{ width: 120 }}
            />
          </SFlex>

          <SectionTitle>Posição da Versão</SectionTitle>
          <SFlex gap={8} flexWrap="wrap">
            <InputForm
              setValue={setValue}
              label="X"
              control={control}
              name="versionX"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Y"
              control={control}
              name="versionY"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Box X"
              control={control}
              name="versionBoxX"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Box Y"
              control={control}
              name="versionBoxY"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Tamanho"
              control={control}
              name="versionSize"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Cor"
              control={control}
              name="versionColor"
              size="small"
              sx={{ width: 120 }}
            />
          </SFlex>

          <SectionTitle>Posição da Empresa</SectionTitle>
          <SFlex gap={8} flexWrap="wrap">
            <InputForm
              setValue={setValue}
              label="X"
              control={control}
              name="companyX"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Y"
              control={control}
              name="companyY"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Box X"
              control={control}
              name="companyBoxX"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Box Y"
              control={control}
              name="companyBoxY"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Tamanho"
              control={control}
              name="companySize"
              type="number"
              size="small"
              sx={{ width: 100 }}
            />
            <InputForm
              setValue={setValue}
              label="Cor"
              control={control}
              name="companyColor"
              size="small"
              sx={{ width: 120 }}
            />
          </SFlex>
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </FormProvider>
  );
};
