/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, CircularProgress, Icon, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { STagSelect } from 'components/molecules/STagSelect';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { environmentMap } from 'core/constants/maps/environment.map';
import { floatMask } from 'core/utils/masks/float.mask';

import { ModalAddHierarchyRisk } from '../../../ModalAddCharacterization/components/ModalAddHierarchyRisk';
import { ModalParametersContentBasic } from '../../../ModalAddCharacterization/components/ModalParametersBasic';
import { IUseEditEnvironment } from '../../hooks/useEditEnvironment';

const StyledImage = styled('img')`
  width: 100px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

export const ModalEnvironmentContent = (props: IUseEditEnvironment) => {
  const {
    control,
    data: environmentData,
    handleAddPhoto,
    setData: setEnvironmentData,
    handlePhotoRemove,
    handlePhotoName,
    loadingDelete,
    onAddArray,
    onDeleteArray,
    filterQuey: environmentsQuery,
  } = props;

  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <InputForm
        autoFocus
        defaultValue={environmentData.name}
        label="Nome"
        labelPosition="center"
        control={control}
        sx={{ width: ['100%'] }}
        placeholder={'nome do ambiente de trabalho...'}
        name="name"
        size="small"
        firstLetterCapitalize
      />
      <InputForm
        defaultValue={environmentData.description}
        multiline
        minRows={2}
        maxRows={4}
        label="Descrição"
        labelPosition="center"
        control={control}
        sx={{ width: ['100%'] }}
        placeholder={'descrição...'}
        name="description"
        size="small"
        firstLetterCapitalize
      />
      <RadioFormText
        type="radio"
        control={control}
        onChange={(e) =>
          setEnvironmentData((old) => ({
            ...old,
            type: (e as any).target.value,
          }))
        }
        defaultValue={String(environmentData.type)}
        options={[
          {
            content: environmentMap[EnvironmentTypeEnum.GENERAL].name,
            value: EnvironmentTypeEnum.GENERAL,
            tooltip: environmentMap[EnvironmentTypeEnum.GENERAL].description,
          },
          {
            content: environmentMap[EnvironmentTypeEnum.ADMINISTRATIVE].name,
            value: EnvironmentTypeEnum.ADMINISTRATIVE,
            tooltip:
              environmentMap[EnvironmentTypeEnum.ADMINISTRATIVE].description,
          },
          {
            content: environmentMap[EnvironmentTypeEnum.OPERATION].name,
            value: EnvironmentTypeEnum.OPERATION,
            tooltip: environmentMap[EnvironmentTypeEnum.OPERATION].description,
          },
          {
            content: environmentMap[EnvironmentTypeEnum.SUPPORT].name,
            value: EnvironmentTypeEnum.SUPPORT,
            tooltip: environmentMap[EnvironmentTypeEnum.SUPPORT].description,
          },
        ]}
        name="type"
        columns={4}
        width="101%"
      />
      <SDisplaySimpleArray
        values={environmentData.activities || []}
        onAdd={(value) => onAddArray(value, 'activities')}
        onDelete={(value) => onDeleteArray(value, 'activities')}
        label={'Processos de Trabalho'}
        buttonLabel={'Adicionar Processo de Trabalho'}
        placeholder="descreva o processos..."
        modalLabel={'Adicionar Processo de Trabalho'}
      />
      <SFlex justify="end">
        <STagSelect
          options={environmentsQuery.map((_, index) => ({
            name: `posição ${index + 1}`,
            value: index + 1,
          }))}
          tooltipTitle={
            'escolha a posição que o ambiente deve aparecer no documento'
          }
          text={`Posição ${
            !environmentData?.order ? '' : environmentData?.order
          }`}
          large
          maxWidth={120}
          mb={10}
          handleSelectMenu={(option) =>
            setEnvironmentData((old) => ({
              ...old,
              order: option.value,
            }))
          }
          icon={SOrderIcon}
        />
      </SFlex>
      <ModalParametersContentBasic control={control} data={environmentData} />

      <ModalAddHierarchyRisk {...props} />

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
      </SButton>
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
            <StyledImage alt={photo.name} src={photo.photoUrl} />
            <div>
              <SText noBreak>{photo.name}</SText>
              <SIconButton
                sx={{ maxWidth: 10, maxHeight: 10, mr: 2 }}
                onClick={() => handlePhotoRemove(index)}
                loading={loadingDelete}
                circularProps={{ size: 10 }}
                tooltip="Remover"
              >
                <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
              </SIconButton>
              <SIconButton
                sx={{ maxWidth: 10, maxHeight: 10, mr: 2 }}
                onClick={() => handlePhotoName(index)}
                loading={loadingDelete}
                circularProps={{ size: 10 }}
                tooltip="Editar"
              >
                <Icon component={SEditIcon} sx={{ fontSize: 14 }} />
              </SIconButton>
            </div>
          </SFlex>
        ))}
      </SFlex>
      <SDisplaySimpleArray
        values={environmentData.considerations || []}
        onAdd={(value) => onAddArray(value)}
        onDelete={(value) => onDeleteArray(value)}
        label={'Considerações'}
        buttonLabel={'Adicionar Consideração'}
        placeholder="descreva sua consideração..."
        modalLabel={'Adicionar Consideração'}
      />
    </SFlex>
  );
};
