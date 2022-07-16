/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { CircularProgress, Icon, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { STagSelect } from 'components/molecules/STagSelect';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { characterizationMap } from 'core/constants/maps/characterization.map';

import { IUseEditCharacterization } from '../../hooks/useEditCharacterization';

const StyledImage = styled('img')`
  width: 100px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

export const ModalCharacterizationContent = ({
  control,
  characterizationData,
  handleAddPhoto,
  setCharacterizationData,
  handlePhotoRemove,
  loadingDelete,
  onAddHierarchy,
  onAddArray,
  onDeleteArray,
  hierarchies,
  characterizationQuery,
  onAddRisk,
  characterizationLoading,
  characterizationsQuery,
  handlePhotoName,
}: IUseEditCharacterization) => {
  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <InputForm
        autoFocus
        defaultValue={characterizationData.name}
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
        defaultValue={characterizationData.description}
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
          setCharacterizationData((old) => ({
            ...old,
            type: (e as any).target.value,
          }))
        }
        defaultValue={String(characterizationData.type)}
        options={[
          {
            content:
              characterizationMap[CharacterizationTypeEnum.WORKSTATION].name,
            value:
              characterizationMap[CharacterizationTypeEnum.WORKSTATION].value,
            tooltip:
              characterizationMap[CharacterizationTypeEnum.WORKSTATION]
                .description,
          },
          {
            content:
              characterizationMap[CharacterizationTypeEnum.ACTIVITIES].name,
            value: CharacterizationTypeEnum.ACTIVITIES,
            tooltip:
              characterizationMap[CharacterizationTypeEnum.ACTIVITIES]
                .description,
          },

          {
            content:
              characterizationMap[CharacterizationTypeEnum.EQUIPMENT].name,
            value: CharacterizationTypeEnum.EQUIPMENT,
            tooltip:
              characterizationMap[CharacterizationTypeEnum.EQUIPMENT]
                .description,
          },
        ]}
        name="type"
        columns={3}
        width="101%"
      />
      <SFlex justify="end">
        <STagSelect
          options={characterizationsQuery.map((_, index) => ({
            name: `posição ${index + 1}`,
            value: index + 1,
          }))}
          tooltipTitle={
            'escolha a posição que o ambiente deve aparecer no documento'
          }
          text={`Posição ${
            !characterizationData?.order ? '' : characterizationData?.order
          }`}
          large
          maxWidth={120}
          mb={10}
          handleSelectMenu={(option) =>
            setCharacterizationData((old) => ({
              ...old,
              order: option.value,
            }))
          }
          icon={SOrderIcon}
        />
      </SFlex>
      <SText color="text.label" fontSize={14}>
        Vincular cargos
      </SText>
      {!characterizationLoading && !!hierarchies.length && (
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
      {characterizationLoading && (
        <CircularProgress color="primary" size={18} />
      )}
      <STagButton
        large
        icon={SAddIcon}
        text="Adicionar cargos, setores ..."
        iconProps={{ sx: { fontSize: 17 } }}
        onClick={() => onAddHierarchy()}
        disabled={characterizationLoading}
      />
      <SText color="text.label" fontSize={14}>
        Vincular Fatores de Risco / Perigos ao ambiente
      </SText>
      {!characterizationLoading &&
        !!characterizationQuery.riskData &&
        !!characterizationQuery.riskData.length && (
          <SFlex gap={8} mt={0} flexWrap="wrap">
            {characterizationQuery.riskData.map((riskData) => {
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
      {characterizationLoading && (
        <CircularProgress color="primary" size={18} />
      )}
      <STagButton
        large
        icon={SAddIcon}
        text="Adicionar Fatores de risco e/ou Perigos ..."
        iconProps={{ sx: { fontSize: 17 } }}
        onClick={() => onAddRisk()}
        disabled={characterizationLoading}
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
        {characterizationData.photos.map((photo, index) => (
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
        values={characterizationData.considerations || []}
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
