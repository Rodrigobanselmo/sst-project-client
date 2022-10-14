/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Icon, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { STagSelect } from 'components/molecules/STagSelect';
import { ModalAddHierarchyRisk } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAddHierarchyRisk';
import { ModalParametersContentBasic } from 'components/organisms/modals/ModalAddCharacterization/components/ModalParametersBasic';
import { TypeInputModal } from 'components/organisms/modals/ModalSingleInput';
import { ParagraphSelect } from 'components/organisms/tagSelects/ParagraphSelect';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { ParagraphEnum } from 'project/enum/paragraph.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import { SCopyIcon } from 'assets/icons/SCopyIcon';
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

export const ModalCharacterizationContent = (
  props: IUseEditCharacterization,
) => {
  const {
    control,
    data: characterizationData,
    handleAddPhoto,
    setData: setCharacterizationData,
    handlePhotoRemove,
    loadingDelete,
    onAddArray,
    onDeleteArray,
    filterQuery: characterizationsQuery,
    handlePhotoName,
    onAddProfile,
    manyProfiles,
    profiles,
    principalProfile,
    onChangeProfile,
    notPrincipalProfile,
    photos,
    setValue,
    onRemove,
    onEditArray,
    onEditArrayContent,
    handleCopy,
  } = props;

  const isEnvironment =
    characterizationData.characterizationType === 'environment';

  const environments = [
    {
      content: characterizationMap[CharacterizationTypeEnum.GENERAL].name,
      value: CharacterizationTypeEnum.GENERAL,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.GENERAL].description,
    },
    {
      content:
        characterizationMap[CharacterizationTypeEnum.ADMINISTRATIVE].name,
      value: CharacterizationTypeEnum.ADMINISTRATIVE,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.ADMINISTRATIVE]
          .description,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.OPERATION].name,
      value: CharacterizationTypeEnum.OPERATION,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.OPERATION].description,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.SUPPORT].name,
      value: CharacterizationTypeEnum.SUPPORT,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.SUPPORT].description,
    },
  ];

  const characterization = [
    {
      content: characterizationMap[CharacterizationTypeEnum.WORKSTATION].name,
      value: characterizationMap[CharacterizationTypeEnum.WORKSTATION].value,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.WORKSTATION].description,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.ACTIVITIES].name,
      value: CharacterizationTypeEnum.ACTIVITIES,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.ACTIVITIES].description,
    },

    {
      content: characterizationMap[CharacterizationTypeEnum.EQUIPMENT].name,
      value: CharacterizationTypeEnum.EQUIPMENT,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.EQUIPMENT].description,
    },
  ];

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
        placeholder={'nome do ambiente / atividade...'}
        name="name"
        size="small"
        firstLetterCapitalize
        {...(manyProfiles &&
          notPrincipalProfile && { value: principalProfile.name })}
      />
      <RadioFormText
        type="radio"
        control={control}
        onChange={(e) => {
          if (
            notPrincipalProfile ||
            !(e as any).target.value ||
            (e as any).target.value == characterizationData.characterizationType
          )
            return;
          setCharacterizationData((old) => ({
            ...old,
            characterizationType: (e as any).target.value,
            type: '' as any,
          }));

          setValue('type', '');
        }}
        defaultValue={characterizationData.characterizationType}
        options={[
          {
            content: 'Ambiente',
            value: 'environment',
          },
          {
            content: 'Atividade / Posto de trabalho',
            value: 'characterization',
          },
        ]}
        name="characterizationType"
        columns={2}
        width="101%"
        {...(manyProfiles &&
          notPrincipalProfile && {
            disabled: true,
          })}
      />
      {!!characterizationData.characterizationType && (
        <>
          <SFlex mb={10} align="center" overflow="auto">
            <STagButton
              tooltipTitle={
                'Permite adicionar para um mesmo ambiente / atividade riscos especificos para cada cargo. (ex: um perfil com risco de ruído e probabilidade 5 e outro com risco de ruído e probabilidade 3)'
              }
              text={'Perfil Principal'}
              large
              active={!!manyProfiles && !notPrincipalProfile}
              minWidth={80}
              onClick={() => onChangeProfile(principalProfile.id)}
              bg={
                !!manyProfiles && !notPrincipalProfile ? 'gray.500' : undefined
              }
            />
            {profiles?.map((profile) => {
              return (
                <STagButton
                  key={profile.id}
                  text={`${profile.name}`}
                  large
                  onClick={() => onChangeProfile(profile.id)}
                  minWidth={80}
                  active={
                    !!manyProfiles && profile.id == characterizationData.id
                  }
                  bg={
                    !!manyProfiles && profile.id == characterizationData.id
                      ? 'gray.500'
                      : undefined
                  }
                />
              );
            })}
            {manyProfiles &&
              notPrincipalProfile &&
              !characterizationData.id && (
                <STagButton
                  active={true}
                  text={`${'Novo'} Perfil`}
                  large
                  minWidth={80}
                  bg={'gray.500'}
                />
              )}
            <STagButton
              tooltipTitle={'Adicionar perfil'}
              large
              icon={SAddIcon}
              onClick={() => onAddProfile()}
            />
            <SIconButton
              sx={{ ml: 'auto' }}
              tooltip={'remover perfil'}
              onClick={() => onRemove()}
            >
              <Icon sx={{ fontSize: 20 }} component={SDeleteIcon} />
            </SIconButton>
          </SFlex>
        </>
      )}
      {manyProfiles && (
        <InputForm
          autoFocus
          defaultValue={
            characterizationData.profileName ||
            (!notPrincipalProfile && 'Principal') ||
            ''
          }
          label="Nome do Perfil"
          labelPosition="center"
          control={control}
          sx={{ width: ['100%'] }}
          placeholder={'nome do perfil...'}
          name="profileName"
          size="small"
          firstLetterCapitalize
          startAdornment={
            characterizationData.name?.slice(0, 30) +
            (characterizationData.name?.length > 30 ? '...' : '') +
            ' ('
          }
          endAdornment={')'}
        />
      )}
      {/* <InputForm
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
      /> */}

      <SDisplaySimpleArray
        values={characterizationData.paragraphs.map((paragraph) => ({
          type: paragraph.split('{type}=')[1],
          name: paragraph.split('{type}=')[0],
        }))}
        type={TypeInputModal.TEXT_AREA}
        valueField="name"
        onAdd={(value) => onAddArray(value, 'paragraphs')}
        onDelete={(value) => onDeleteArray(value, 'paragraphs')}
        onEdit={(v, values) =>
          onEditArrayContent(values, 'paragraphs', ParagraphEnum.PARAGRAPH)
        }
        label={'Descrição'}
        buttonLabel={'Adicionar Parágrafo de Descrição'}
        placeholder="descreva..."
        modalLabel="Adicionar Descrição"
        onRenderStartElement={(value) => (
          <ParagraphSelect
            handleSelectMenu={(option) => {
              onEditArray((value as any).name, option.value, 'paragraphs');
            }}
            selected={
              (typeof value !== 'string' &&
                'type' in value &&
                (value as any).type) ||
              ParagraphEnum.PARAGRAPH
            }
            sx={{
              boxShadow: 'none',
              borderRightColor: 'grey.300',
              borderRadius: '4px 5px 5px 4px',
            }}
            paragraphOptions={[
              ParagraphEnum.PARAGRAPH,
              ParagraphEnum.BULLET_0,
              ParagraphEnum.BULLET_1,
              ParagraphEnum.BULLET_2,
            ]}
          />
        )}
      />

      {(!!characterizationData.characterizationType ||
        !!characterizationData.type) && (
        <>
          <RadioFormText
            type="radio"
            control={control}
            onChange={(e) => {
              if (
                notPrincipalProfile ||
                !(e as any).target.value ||
                (e as any).target.value == characterizationData.type
              )
                return;
              setCharacterizationData((old) => ({
                ...old,
                type: (e as any).target.value,
              }));
            }}
            defaultValue={String(characterizationData.type)}
            options={isEnvironment ? environments : characterization}
            name="type"
            columns={isEnvironment ? 4 : 3}
            width="101%"
            {...(manyProfiles && notPrincipalProfile && { disabled: true })}
          />
          <SDisplaySimpleArray
            values={characterizationData.activities.map((activity) => ({
              type: activity.split('{type}=')[1],
              name: activity.split('{type}=')[0],
            }))}
            valueField="name"
            type={TypeInputModal.TEXT_AREA}
            onEdit={(v, values) =>
              onEditArrayContent(values, 'activities', ParagraphEnum.BULLET_0)
            }
            onAdd={(value) => onAddArray(value, 'activities')}
            onDelete={(value) => onDeleteArray(value, 'activities')}
            label={'Atividades ou tarefas realizadas'}
            buttonLabel={'Adicionar Atividade'}
            placeholder="descreva a atividade..."
            modalLabel="Adicionar Atividade"
            onRenderStartElement={(value) => (
              <ParagraphSelect
                handleSelectMenu={(option) => {
                  onEditArray((value as any).name, option.value, 'activities');
                }}
                selected={
                  (typeof value !== 'string' &&
                    'type' in value &&
                    (value as any).type) ||
                  ParagraphEnum.BULLET_0
                }
                sx={{
                  boxShadow: 'none',
                  borderRightColor: 'grey.300',
                  borderRadius: '4px 5px 5px 4px',
                }}
                paragraphOptions={[
                  ParagraphEnum.PARAGRAPH,
                  ParagraphEnum.BULLET_0,
                  ParagraphEnum.BULLET_1,
                  ParagraphEnum.BULLET_2,
                ]}
              />
            )}
            {...(isEnvironment
              ? ({
                  label: 'Processos de Trabalho',
                  buttonLabel: 'Adicionar Processo de Trabalho',
                  placeholder: 'descreva o processos...',
                  modalLabel: 'Adicionar Processo de Trabalho',
                } as any)
              : {})}
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
          <ModalParametersContentBasic
            control={control}
            data={characterizationData}
          />
          <ModalAddHierarchyRisk {...props} />
          <SText color="text.label" fontSize={14}>
            Fotos
          </SText>
          <SButton
            onClick={handleAddPhoto}
            color="success"
            disabled={manyProfiles && notPrincipalProfile}
            sx={{
              height: 28,
              maxWidth: 'fit-content',
              m: 0,
              ml: 1,
            }}
          >
            <SAddIcon />
            {manyProfiles && notPrincipalProfile
              ? 'Adicionar no Perfil Principal'
              : 'Adicionar foto'}
          </SButton>{' '}
          <SFlex
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
          >
            {photos?.map((photo, index) => (
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
                    disabled={manyProfiles && notPrincipalProfile}
                  >
                    <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
                  </SIconButton>
                  <SIconButton
                    sx={{ maxWidth: 10, maxHeight: 10, mr: 2 }}
                    onClick={() => handlePhotoName(index)}
                    loading={loadingDelete}
                    circularProps={{ size: 10 }}
                    disabled={manyProfiles && notPrincipalProfile}
                    tooltip="Editar"
                  >
                    <Icon component={SEditIcon} sx={{ fontSize: 14 }} />
                  </SIconButton>
                </div>
              </SFlex>
            ))}
          </SFlex>
          <SDisplaySimpleArray
            values={characterizationData.considerations.map(
              (consideration) => ({
                type: consideration.split('{type}=')[1],
                name: consideration.split('{type}=')[0],
              }),
            )}
            type={TypeInputModal.TEXT_AREA}
            valueField="name"
            onEdit={(v, values) =>
              onEditArrayContent(
                values,
                'considerations',
                ParagraphEnum.BULLET_0,
              )
            }
            onAdd={(value) => onAddArray(value, 'considerations')}
            onDelete={(value) => onDeleteArray(value, 'considerations')}
            label={'Considerações'}
            buttonLabel={'Adicionar Consideração'}
            placeholder="descreva sua consideração..."
            modalLabel={'Adicionar Consideração'}
            onRenderStartElement={(value) => (
              <ParagraphSelect
                handleSelectMenu={(option) => {
                  onEditArray(
                    (value as any).name,
                    option.value,
                    'considerations',
                  );
                }}
                selected={
                  (typeof value !== 'string' &&
                    'type' in value &&
                    (value as any).type) ||
                  ParagraphEnum.BULLET_0
                }
                sx={{
                  boxShadow: 'none',
                  borderRightColor: 'grey.300',
                  borderRadius: '4px 5px 5px 4px',
                }}
                paragraphOptions={[
                  ParagraphEnum.PARAGRAPH,
                  ParagraphEnum.BULLET_0,
                  ParagraphEnum.BULLET_1,
                  ParagraphEnum.BULLET_2,
                ]}
              />
            )}
          />
        </>
      )}
      {!characterizationData.id && (
        <STagButton
          icon={SCopyIcon}
          text={'Copiar caracterização'}
          onClick={() => handleCopy()}
          maxWidth={200}
        />
      )}
    </SFlex>
  );
};
