/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, CircularProgress, Icon, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { STagSelect } from 'components/molecules/STagSelect';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { environmentMap } from 'core/constants/maps/environment.map';
import { floatMask } from 'core/utils/masks/float.mask';

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
  setEnvironmentData,
  handlePhotoRemove,
  handlePhotoName,
  loadingDelete,
  onAddHierarchy,
  onAddArray,
  onDeleteArray,
  onAddRisk,
  environmentQuery,
  hierarchies,
  environmentLoading,
  environmentsQuery,
}: IUseEditEnvironment) => {
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
      <RadioForm
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
      <SText color="text.label" fontSize={14}>
        Parâmetros ambientais
      </SText>
      <SFlex gap={8} flexWrap="wrap">
        <Box flex={5}>
          <InputForm
            defaultValue={environmentData.temperature}
            label="Temperatura"
            sx={{ minWidth: [200] }}
            control={control}
            placeholder={'temperatura'}
            name="temperature"
            labelPosition="center"
            size="small"
            endAdornment="ºC"
            mask={floatMask.apply({ decimal: 2, negative: true })}
          />
        </Box>
        <Box flex={5}>
          <InputForm
            defaultValue={environmentData.noiseValue}
            label="Ruído"
            sx={{ minWidth: [200] }}
            control={control}
            placeholder={'ruído'}
            name="noiseValue"
            labelPosition="center"
            size="small"
            endAdornment="db (A)"
            mask={floatMask.apply({ decimal: 2 })}
          />
        </Box>
        <Box flex={5}>
          <InputForm
            defaultValue={environmentData.moisturePercentage}
            label="Humidade"
            sx={{ minWidth: [200] }}
            labelPosition="center"
            control={control}
            placeholder={'humidade do ar'}
            name="moisturePercentage"
            size="small"
            endAdornment="%"
            mask={floatMask.apply({ decimal: 2 })}
          />
        </Box>
        <Box flex={5}>
          <InputForm
            defaultValue={environmentData.luminosity}
            label="Iluminância"
            sx={{ minWidth: [200] }}
            labelPosition="center"
            control={control}
            placeholder={'iluminância'}
            name="luminosity"
            size="small"
            endAdornment="LUX"
            mask={floatMask.apply()}
          />
        </Box>
      </SFlex>

      <SText color="text.label" fontSize={14}>
        Vincular cargos ao ambiente
      </SText>
      {!environmentLoading && !!hierarchies.length && (
        <SFlex gap={8} mt={0} flexWrap="wrap">
          {hierarchies.map((hierarchy) => {
            const fromTree = hierarchy && 'label' in hierarchy;
            const name = fromTree ? hierarchy.label : hierarchy.name;
            return (
              <SText
                component="span"
                key={hierarchy.id}
                sx={{
                  fontSize: 12,
                  p: 4,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                }}
              >
                {name}
              </SText>
            );
          })}
        </SFlex>
      )}
      {environmentLoading && <CircularProgress color="primary" size={18} />}
      <STagButton
        large
        icon={SAddIcon}
        text="Adicionarcargos, setores ..."
        iconProps={{ sx: { fontSize: 17 } }}
        onClick={() => onAddHierarchy()}
        disabled={environmentLoading}
      />
      <SText color="text.label" fontSize={14}>
        Vincular Fatores de Risco / Perigos ao ambiente
      </SText>
      {!environmentLoading &&
        !!environmentQuery.riskData &&
        !!environmentQuery.riskData.length && (
          <SFlex gap={8} mt={0} flexWrap="wrap">
            {environmentQuery.riskData.map((riskData) => {
              if (!riskData.riskFactor) return null;

              return (
                <SText
                  component="span"
                  key={riskData.id}
                  sx={{
                    fontSize: 12,
                    p: 4,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                  }}
                >
                  {riskData.riskFactor.name}
                </SText>
              );
            })}
          </SFlex>
        )}
      {environmentLoading && <CircularProgress color="primary" size={18} />}
      <STagButton
        large
        icon={SAddIcon}
        text="Adicionar Fatores de risco e/ou Perigos ..."
        iconProps={{ sx: { fontSize: 17 } }}
        onClick={() => onAddRisk()}
        disabled={environmentLoading}
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
