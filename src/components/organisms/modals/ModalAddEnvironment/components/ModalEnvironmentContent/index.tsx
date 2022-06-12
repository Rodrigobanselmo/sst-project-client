/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Icon, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { IUseEditEnvironment } from '../../hooks/useEditEnvironment';

const StyledImage = styled('img')`
  width: 100px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

export const ModalEnvironmentContent = ({
  control,
  environmentData,
  handleAddPhoto,
  handlePhotoRemove,
}: IUseEditEnvironment) => {
  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <InputForm
        autoFocus
        defaultValue={environmentData.name}
        minRows={2}
        maxRows={4}
        label="Nome"
        labelPosition="center"
        control={control}
        sx={{ minWidth: ['100%', 600] }}
        placeholder={'nome do ambiente de trabalho...'}
        name="name"
        size="small"
      />
      <InputForm
        defaultValue={environmentData.description}
        multiline
        minRows={2}
        maxRows={4}
        label="Descrição"
        labelPosition="center"
        control={control}
        sx={{ minWidth: ['100%', 600] }}
        placeholder={'descrição...'}
        name="description"
        size="small"
      />
      <SText color="text.label" fontSize={14}>
        Fotos
      </SText>
      <SButton
        onClick={handleAddPhoto}
        color="success"
        sx={{
          height: 28,
          maxWidth: 'fit-content',
          m: 0,
          ml: 1,
        }}
      >
        <SAddIcon />
        Adicionar foto
      </SButton>{' '}
      <SFlex sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {environmentData.photos.map((photo, index) => (
          <SFlex
            key={photo.name + '-' + index}
            sx={{
              display: 'grid',
              gridTemplateColumns: ' 100px 150px',
              gap: 5,
            }}
          >
            <StyledImage alt={photo.name} src={photo.src} />
            <div>
              <SText noBreak>{photo.name}</SText>
              <SIconButton
                sx={{ maxWidth: 10, maxHeight: 10 }}
                onClick={() => handlePhotoRemove(index)}
              >
                <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
              </SIconButton>
            </div>
          </SFlex>
        ))}
      </SFlex>
    </SFlex>
  );
};
