import React from 'react';

import { styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import dynamic from 'next/dynamic';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyEdit } from './hooks/useCompanyThirdEdit';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

const StyledImage = styled('img')`
  height: 150px;
  max-width: 300px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
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
  const { onSubmit, loading, onCloseUnsaved, handleAddPhoto, previousStep } =
    useCompanyEdit(props);
  const { companyData, isEdit, setCompanyData } = props;

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
            Logomarca da clínica
          </SText>
          <StyledImage
            alt={companyData.name}
            src={companyData.logoUrl || '/placeholder-image.png'}
            onClick={handleAddPhoto}
          />
          <DraftEditor
            size="xs"
            label="informações adicionais"
            placeholder="descrição..."
            defaultValue={companyData.obs}
            onChange={(value) => {
              setCompanyData({
                ...companyData,
                obs: value,
              });
            }}
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
