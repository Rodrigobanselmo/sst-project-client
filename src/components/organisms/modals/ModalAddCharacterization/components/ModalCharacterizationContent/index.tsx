/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';

import { CircularProgress, Icon, Skeleton, styled } from '@mui/material';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useMutateAiRiskInventorySummary } from '@v2/services/security/characterization/characterization/ai-risk-inventory-summary/hooks/useMutateAiRiskInventorySummary';
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
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import {
  CharacterizationTypeEnum,
  getIsEnvironment,
} from 'project/enum/characterization-type.enum';
import { ParagraphEnum } from 'project/enum/paragraph.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import {
  CHARACTERIZATION_TYPE_HELP_TEXT,
  characterizationMap,
} from 'core/constants/maps/characterization.map';

import { CharacterizationAiAssistModal } from '../CharacterizationAiAssistModal/CharacterizationAiAssistModal';
import { IUseEditCharacterization } from '../../hooks/useEditCharacterization';

const RISK_INVENTORY_SUMMARY_MAX_LENGTH = 1000;

const StyledImage = styled('img')`
  width: 100px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

interface IModalCharacterizationContentProps extends IUseEditCharacterization {
  hideCharacterizationDelete?: boolean;
  embedded?: boolean;
}

export const ModalCharacterizationContent = (
  props: IModalCharacterizationContentProps,
) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [assistModalOpen, setAssistModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNameInput(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const {
    control,
    watch,
    data: characterizationData,
    handleAddPhoto,
    setData: setCharacterizationData,
    handlePhotoRemove,
    loadingDelete,
    onAddArray,
    onDeleteArray,
    filterQuery: characterizationsQuery,
    handleEditPhoto,
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
    isEdit,
    hasUnsavedChanges,
    hideCharacterizationDelete = false,
    registerAiAssistAppliedTrace,
  } = props;

  const isEnvironment = getIsEnvironment(characterizationData.type);
  const riskInventorySummaryValue = watch?.('riskInventorySummary') ?? '';
  const riskInventorySummaryLength = String(riskInventorySummaryValue || '')
    .length;
  const { showConfirmation } = useConfirmationModal();
  const generateSummaryMutation = useMutateAiRiskInventorySummary();
  const generateRequestIdRef = useRef(0);
  const mountedCharacterizationIdRef = useRef(characterizationData.id);

  useEffect(() => {
    mountedCharacterizationIdRef.current = characterizationData.id;
  }, [characterizationData.id]);

  const canGenerateSummary =
    Boolean(characterizationData.id) &&
    Boolean(characterizationData.companyId) &&
    Boolean(characterizationData.workspaceId) &&
    !hasUnsavedChanges &&
    !generateSummaryMutation.isPending;

  const handleGenerateRiskInventorySummary = async () => {
    if (!canGenerateSummary) return;

    const currentSummary = String(
      watch?.('riskInventorySummary') ||
        characterizationData.riskInventorySummary ||
        '',
    ).trim();

    if (currentSummary) {
      const confirmed = await showConfirmation({
        title: 'Substituir resumo',
        message:
          'Já existe um resumo preenchido. Deseja substituí-lo por uma nova sugestão gerada com IA?',
        confirmText: 'Substituir',
        cancelText: 'Cancelar',
        variant: 'warning',
      });
      if (!confirmed) return;
    }

    const requestId = ++generateRequestIdRef.current;
    const characterizationId = characterizationData.id;

    try {
      const result = await generateSummaryMutation.mutateAsync({
        companyId: characterizationData.companyId,
        workspaceId: characterizationData.workspaceId,
        characterizationId,
      });

      if (
        requestId !== generateRequestIdRef.current ||
        mountedCharacterizationIdRef.current !== characterizationId
      ) {
        return;
      }

      const nextSummary = String(result.riskInventorySummary || '').trim();
      if (!nextSummary) return;

      setValue('riskInventorySummary', nextSummary, { shouldDirty: true });
      setCharacterizationData((old) => ({
        ...old,
        riskInventorySummary: nextSummary,
      }));
    } catch {
      // feedback de erro já tratado pelo hook da mutation
    }
  };

  const typeOptions = [
    {
      content: characterizationMap[CharacterizationTypeEnum.GENERAL].name,
      value: CharacterizationTypeEnum.GENERAL,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.GENERAL].description,
      gridSize: { xs: 3 },
    },
    {
      content:
        characterizationMap[CharacterizationTypeEnum.ADMINISTRATIVE].name,
      value: CharacterizationTypeEnum.ADMINISTRATIVE,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.ADMINISTRATIVE]
          .description,
      gridSize: { xs: 3, sm: 1 },
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.OPERATION].name,
      value: CharacterizationTypeEnum.OPERATION,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.OPERATION].description,
      gridSize: { xs: 3, sm: 1 },
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.SUPPORT].name,
      value: CharacterizationTypeEnum.SUPPORT,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.SUPPORT].description,
      gridSize: { xs: 3, sm: 1 },
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.WORKSTATION].name,
      value: CharacterizationTypeEnum.WORKSTATION,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.WORKSTATION].description,
      gridSize: { xs: 3, sm: 1 },
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.ACTIVITIES].name,
      value: CharacterizationTypeEnum.ACTIVITIES,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.ACTIVITIES].description,
      gridSize: { xs: 3, sm: 1 },
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.EQUIPMENT].name,
      value: CharacterizationTypeEnum.EQUIPMENT,
      tooltip:
        characterizationMap[CharacterizationTypeEnum.EQUIPMENT].description,
      gridSize: { xs: 3, sm: 1 },
    },
  ];

  const { embedded, ...hierarchyRiskProps } = props;

  return (
    <ModalAddHierarchyRisk {...hierarchyRiskProps} embedded={embedded}>
      <SFlex gap={8} direction="column" mt={embedded ? 0 : 8}>
        {showNameInput ? (
          <InputForm
            autoFocus
            defaultValue={characterizationData.name}
            label="Nome"
            labelPosition="center"
            control={control}
            setValue={setValue}
            sx={{ width: ['100%'] }}
            placeholder={'nome do elemento caracterizado...'}
            name="name"
            size="small"
            firstLetterCapitalize
            {...(manyProfiles &&
              notPrincipalProfile && { value: principalProfile.name })}
          />
        ) : (
          <Skeleton variant="rounded" height={40} sx={{ width: '100%' }} />
        )}
        <SText fontSize={13} color="text.secondary" mb={1}>
          {CHARACTERIZATION_TYPE_HELP_TEXT}
        </SText>
        <RadioFormText
          type="radio"
          setValue={setValue}
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
          options={typeOptions}
          name="type"
          columns={3}
          width="101%"
          {...(manyProfiles && notPrincipalProfile && { disabled: true })}
        />
        <SFlex mb={10} align="center" overflow="auto">
          <STagButton
            tooltipTitle={
              'Permite adicionar para um mesmo ambiente / atividade riscos especificos para cada cargo. (ex: um perfil com risco de ruído e probabilidade 5 e outro com risco de ruído e probabilidade 3)'
            }
            text={'Perfil Principal'}
            large
            active={!!manyProfiles && !notPrincipalProfile}
            minWidth={80}
            onClick={() =>
              principalProfile?.id && onChangeProfile(principalProfile.id)
            }
            bg={!!manyProfiles && !notPrincipalProfile ? 'gray.500' : undefined}
          />
          {profiles?.map((profile) => {
            return (
              <STagButton
                key={profile.id}
                text={`${profile.profileName}`}
                large
                onClick={() => onChangeProfile(profile.id)}
                minWidth={80}
                active={!!manyProfiles && profile.id == characterizationData.id}
                bg={
                  !!manyProfiles && profile.id == characterizationData.id
                    ? 'gray.500'
                    : undefined
                }
              />
            );
          })}
          {manyProfiles && notPrincipalProfile && !characterizationData.id && (
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
          {!hideCharacterizationDelete && (
            <SIconButton
              sx={{ ml: 'auto' }}
              tooltip={'remover perfil'}
              onClick={() => onRemove()}
            >
              <Icon sx={{ fontSize: 20 }} component={SDeleteIcon} />
            </SIconButton>
          )}
        </SFlex>
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
            setValue={setValue}
            firstLetterCapitalize
            startAdornment={
              characterizationData.name?.slice(0, 30) +
              (characterizationData.name?.length > 30 ? '...' : '') +
              ' ('
            }
            endAdornment={')'}
          />
        )}

        {characterizationData.type && (
          <>
            <SFlex mb={4} align="center" justify="space-between" flexWrap="wrap" gap={2}>
              <SText fontSize={14} color="text.light">
                Use o assistente para gerar rascunho de descrição, processos e considerações antes da Análise IA de riscos.
              </SText>
              <SButton
                color="primary"
                variant="outlined"
                onClick={() => setAssistModalOpen(true)}
              >
                Assistente IA da Caracterização
              </SButton>
            </SFlex>

            <SDisplaySimpleArray
              values={(characterizationData.paragraphs ?? []).map((paragraph) => ({
                type: paragraph.split('{type}=')[1],
                name: paragraph.split('{type}=')[0],
              }))}
              type={TypeInputModal.TEXT_AREA}
              valueField="name"
              onAdd={(value, _, index) =>
                onAddArray(value, 'paragraphs', index)
              }
              onDelete={(value, _, index) =>
                onDeleteArray(value, 'paragraphs', index)
              }
              onEdit={(v, values) =>
                onEditArrayContent(
                  values,
                  'paragraphs',
                  ParagraphEnum.PARAGRAPH,
                )
              }
              label={'Descrição'}
              buttonLabel={'Adicionar Parágrafo de Descrição'}
              placeholder="descreva..."
              modalLabel="Adicionar Descrição"
              onRenderStartElement={(value, index) => (
                <ParagraphSelect
                  handleSelectMenu={(option) => {
                    onEditArray(
                      (value as any).name,
                      option.value,
                      'paragraphs',
                      index,
                    );
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
            <SFlex direction="column" gap={2} mt={2}>
              <SFlex
                align="center"
                justify="space-between"
                flexWrap="wrap"
                gap={2}
              >
                <SText fontSize={14} fontWeight={600}>
                  Resumo para o inventário de riscos
                </SText>
                <SButton
                  color="primary"
                  variant="outlined"
                  disabled={!canGenerateSummary}
                  onClick={handleGenerateRiskInventorySummary}
                  startIcon={
                    generateSummaryMutation.isPending ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : undefined
                  }
                >
                  {generateSummaryMutation.isPending
                    ? 'Gerando resumo...'
                    : 'Gerar resumo com IA'}
                </SButton>
              </SFlex>
              <InputForm
                multiline
                minRows={3}
                maxRows={6}
                defaultValue={characterizationData.riskInventorySummary || ''}
                label=""
                control={control}
                setValue={setValue}
                sx={{ width: '100%' }}
                placeholder="Texto objetivo sobre o elemento, finalidade e contexto operacional..."
                name="riskInventorySummary"
                size="small"
                inputProps={{ maxLength: RISK_INVENTORY_SUMMARY_MAX_LENGTH }}
                onChange={(e) => {
                  setCharacterizationData((old) => ({
                    ...old,
                    riskInventorySummary: e.target.value,
                  }));
                }}
              />
              <SText fontSize={12} color="text.secondary">
                Texto objetivo utilizado para contextualizar este elemento no
                Inventário de Riscos. A descrição técnica completa continuará
                sendo utilizada no corpo da caracterização. Orientação: 400 a
                600 caracteres.
              </SText>
              {hasUnsavedChanges && (
                <SText fontSize={12} color="warning.main">
                  Salve as alterações da caracterização antes de gerar o resumo
                  com IA.
                </SText>
              )}
              {!characterizationData.id && (
                <SText fontSize={12} color="warning.main">
                  Salve a caracterização antes de gerar o resumo com IA.
                </SText>
              )}
              <SText fontSize={12} color="text.light" textAlign="right">
                {riskInventorySummaryLength}/{RISK_INVENTORY_SUMMARY_MAX_LENGTH}
              </SText>
            </SFlex>
            <SDisplaySimpleArray
              values={(characterizationData.activities ?? []).map((activity) => ({
                type: activity.split('{type}=')[1],
                name: activity.split('{type}=')[0],
              }))}
              valueField="name"
              type={TypeInputModal.TEXT_AREA}
              onEdit={(v, values) =>
                onEditArrayContent(values, 'activities', ParagraphEnum.BULLET_0)
              }
              onAdd={(value, _, index) =>
                onAddArray(value, 'activities', index)
              }
              onDelete={(value, _, index) =>
                onDeleteArray(value, 'activities', index)
              }
              label={'Atividades ou tarefas realizadas'}
              buttonLabel={'Adicionar Atividade'}
              placeholder="descreva a atividade..."
              modalLabel="Adicionar Atividade"
              onRenderStartElement={(value, index) => (
                <ParagraphSelect
                  handleSelectMenu={(option) => {
                    onEditArray(
                      (value as any).name,
                      option.value,
                      'activities',
                      index,
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
                  !characterizationData?.order
                    ? ''
                    : characterizationData?.order
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
              setValue={setValue}
              control={control}
              data={characterizationData}
            />
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
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
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
                  <StyledImage
                    alt={photo.name}
                    src={
                      photo.photoUrl +
                      (photo.photoUrl.startsWith('data:image')
                        ? ''
                        : `?timestamp=${photo.updated_at}`)
                    }
                  />
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
                      onClick={() => handleEditPhoto(index)}
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
              values={(characterizationData.considerations ?? []).map(
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
              onAdd={(value, _, index) =>
                onAddArray(value, 'considerations', index)
              }
              onDelete={(value, _, index) =>
                onDeleteArray(value, 'considerations', index)
              }
              label={'Considerações'}
              buttonLabel={'Adicionar Consideração'}
              placeholder="descreva sua consideração..."
              modalLabel={'Adicionar Consideração'}
              onRenderStartElement={(value, index) => (
                <ParagraphSelect
                  handleSelectMenu={(option) => {
                    onEditArray(
                      (value as any).name,
                      option.value,
                      'considerations',
                      index,
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

        {isEdit && (
          <SFlex gap={8} mt={10} align="flex-start">
            <StatusSelect
              selected={characterizationData.status}
              statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
              handleSelectMenu={(option: any) => {
                if (option?.value)
                  setCharacterizationData({
                    ...characterizationData,
                    status: option.value,
                  });
              }}
            />
          </SFlex>
        )}
      </SFlex>

      <CharacterizationAiAssistModal
        open={assistModalOpen}
        onClose={() => setAssistModalOpen(false)}
        data={characterizationData}
        onEditArrayContent={onEditArrayContent}
        setData={setCharacterizationData}
        registerAiAssistAppliedTrace={registerAiAssistAppliedTrace}
      />
    </ModalAddHierarchyRisk>
  );
};
