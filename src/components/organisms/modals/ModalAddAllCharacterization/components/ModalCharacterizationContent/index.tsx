/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Icon, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { STagSelect } from 'components/molecules/STagSelect';
import { IUseEditCharacterization } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { ModalAddHierarchyRisk } from 'components/organisms/modals/ModalAddEnvironment/components/ModalAddHierarchyRisk';
import { ModalParametersContentBasic } from 'components/organisms/modals/ModalAddEnvironment/components/ModalParametersBasic';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { characterizationMap } from 'core/constants/maps/characterization.map';

import { IUseEditAllChar } from '../../hooks/useEditAllChar';

const StyledImage = styled('img')`
  width: 100px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

export const ModalCharacterizationContent = (props: IUseEditAllChar) => {
  const {
    control,
    data: data,
    handleAddPhoto,
    setData: setData,
    handlePhotoRemove,
    loadingDelete,
    onAddArray,
    onDeleteArray,
    filterQuery,
    handlePhotoName,
  } = props;

  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <InputForm
        autoFocus
        defaultValue={data.name}
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
        defaultValue={data.description}
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
          setData((old: any) => ({
            ...old,
            type: (e as any).target.value,
          }))
        }
        defaultValue={String(data.type)}
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
      <SDisplaySimpleArray
        values={data.activities || []}
        onAdd={(value) => onAddArray(value, 'activities')}
        onDelete={(value) => onDeleteArray(value, 'activities')}
        label={'Processos de Trabalho'}
        buttonLabel={'Adicionar Processo de Trabalho'}
        placeholder="descreva o processos..."
        modalLabel={'Adicionar Processo de Trabalho'}
      />
      <SFlex justify="end">
        <STagSelect
          options={filterQuery.map((_, index) => ({
            name: `posição ${index + 1}`,
            value: index + 1,
          }))}
          tooltipTitle={
            'escolha a posição que o ambiente deve aparecer no documento'
          }
          text={`Posição ${!data?.order ? '' : data?.order}`}
          large
          maxWidth={120}
          mb={10}
          handleSelectMenu={(option) =>
            setData((old: any) => ({
              ...old,
              order: option.value,
            }))
          }
          icon={SOrderIcon}
        />
      </SFlex>
      <ModalParametersContentBasic control={control} data={data} />
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
      </SButton>{' '}
      <SFlex sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {data.photos.map((photo, index) => (
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
        values={data.considerations || []}
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
