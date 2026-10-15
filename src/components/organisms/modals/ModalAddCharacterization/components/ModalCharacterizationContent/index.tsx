/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';

import { Box, CircularProgress, Icon, Skeleton, styled } from '@mui/material';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useMutateAiRiskInventorySummary } from '@v2/services/security/characterization/characterization/ai-risk-inventory-summary/hooks/useMutateAiRiskInventorySummary';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SHelp } from 'components/atoms/SHelp';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { CharacterizationContentEditor } from 'components/organisms/characterization-content-editor/CharacterizationContentEditor';
import { ModalAddHierarchyRisk } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAddHierarchyRisk';
import { ModalParametersContentBasic } from 'components/organisms/modals/ModalAddCharacterization/components/ModalParametersBasic';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import {
  CharacterizationTypeEnum,
  getIsEnvironment,
} from 'project/enum/characterization-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';

import {
  CHARACTERIZATION_TYPE_HELP_TEXT,
  characterizationMap,
} from 'core/constants/maps/characterization.map';

import { CharacterizationAiAssistModal } from '../CharacterizationAiAssistModal/CharacterizationAiAssistModal';
import { IUseEditCharacterization } from '../../hooks/useEditCharacterization';

const ASSISTENTE_IA_HELP_TEXT =
  'Use o assistente para gerar rascunho de descrição, processos e considerações antes da Análise IA de riscos.';

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
  initialWizardStep?: number;
  initialAiAction?: 'assist' | 'inventory-summary';
}

export const ModalCharacterizationContent = (
  props: IModalCharacterizationContentProps,
) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [assistModalOpen, setAssistModalOpen] = useState(false);
  const didAutoAiActionRef = useRef(false);

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

  // Fase 2B: atalho da tabela reutiliza os fluxos existentes (sem IA nova).
  useEffect(() => {
    if (didAutoAiActionRef.current) return;
    if (!props.initialAiAction) return;
    if (!characterizationData.type || !characterizationData.id) return;

    if (props.initialAiAction === 'assist') {
      didAutoAiActionRef.current = true;
      setAssistModalOpen(true);
      return;
    }

    if (props.initialAiAction === 'inventory-summary') {
      if (!canGenerateSummary) return;
      didAutoAiActionRef.current = true;
      void handleGenerateRiskInventorySummary();
    }
    // handleGenerateRiskInventorySummary is recreated each render; gate by ids/flags.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.initialAiAction,
    characterizationData.type,
    characterizationData.id,
    canGenerateSummary,
  ]);

  // Ordem e valores internos preservados (antes: RadioFormText em botões).
  const typeOptions = [
    {
      content: characterizationMap[CharacterizationTypeEnum.GENERAL].name,
      value: CharacterizationTypeEnum.GENERAL,
    },
    {
      content:
        characterizationMap[CharacterizationTypeEnum.ADMINISTRATIVE].name,
      value: CharacterizationTypeEnum.ADMINISTRATIVE,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.OPERATION].name,
      value: CharacterizationTypeEnum.OPERATION,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.SUPPORT].name,
      value: CharacterizationTypeEnum.SUPPORT,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.WORKSTATION].name,
      value: CharacterizationTypeEnum.WORKSTATION,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.ACTIVITIES].name,
      value: CharacterizationTypeEnum.ACTIVITIES,
    },
    {
      content: characterizationMap[CharacterizationTypeEnum.EQUIPMENT].name,
      value: CharacterizationTypeEnum.EQUIPMENT,
    },
  ];

  const handleTypeChange = (e: { target?: { value?: unknown } }) => {
    if (
      notPrincipalProfile ||
      !e?.target?.value ||
      e.target.value == characterizationData.type
    )
      return;
    setCharacterizationData((old) => ({
      ...old,
      type: e.target!.value as CharacterizationTypeEnum,
    }));
  };

  // Tooltip estático: orientação geral + as 7 classificações (characterizationMap).
  // A rolagem fica no Paper do Tooltip (componentsProps) para manter o hover interativo.
  const typeHelpTooltip = (
    <Box sx={{ textAlign: 'left' }}>
      <Box component="p" sx={{ m: 0, mb: 1.5, fontSize: 13, lineHeight: 1.45 }}>
        {CHARACTERIZATION_TYPE_HELP_TEXT}
      </Box>
      {typeOptions.map((option) => {
        const entry = characterizationMap[option.value];
        return (
          <Box key={option.value} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
            <Box
              component="strong"
              sx={{ display: 'block', mb: 0.5, fontSize: 13 }}
            >
              {entry.name}
            </Box>
            <Box
              component="span"
              sx={{ display: 'block', fontSize: 12, lineHeight: 1.4 }}
            >
              {entry.description}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  const nameDisplayValue =
    manyProfiles && notPrincipalProfile
      ? principalProfile.name
      : characterizationData.name;

  const fieldLabelSx = {
    '& .MuiInputLabel-root': {
      color: 'text.primary',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: 'primary.main',
    },
    '& .MuiInputLabel-root.Mui-error': {
      color: 'error.main',
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: 'text.disabled',
    },
  } as const;

  const { embedded, initialWizardStep, initialAiAction: _initialAiAction, ...hierarchyRiskProps } =
    props;

  return (
    <ModalAddHierarchyRisk
      {...hierarchyRiskProps}
      embedded={embedded}
      initialWizardStep={initialWizardStep}
    >
      <SFlex
        gap={8}
        direction="column"
        mt={embedded ? 0 : 8}
        sx={{ overflow: 'visible', pt: 1 }}
      >
        {/*
          Labels flutuantes (labelPosition=center) sobem ~16–20px acima do campo.
          O wizard ancestral usa overflowY:auto — sem pt suficiente, o topo do
          InputLabel é recortado. Nome cresce (~4fr); Tipo compacto (~1fr).
        */}
        <SFlex
          gap={8}
          flexWrap="wrap"
          mb={10}
          sx={{
            width: '100%',
            pt: 3,
            overflow: 'visible',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '4 1 0%' },
              minWidth: { xs: '100%', md: 240 },
              overflow: 'visible',
            }}
          >
            {showNameInput ? (
              <STooltip
                withWrapper
                boxProps={{ sx: { overflow: 'visible', width: '100%' } }}
                title={
                  nameDisplayValue && String(nameDisplayValue).length > 24
                    ? String(nameDisplayValue)
                    : undefined
                }
              >
                <InputForm
                  autoFocus
                  defaultValue={characterizationData.name}
                  label="Nome"
                  labelPosition="center"
                  control={control}
                  setValue={setValue}
                  placeholder={'nome do elemento caracterizado...'}
                  name="name"
                  size="small"
                  firstLetterCapitalize
                  inputProps={{
                    title:
                      nameDisplayValue && String(nameDisplayValue).length > 24
                        ? String(nameDisplayValue)
                        : undefined,
                  }}
                  sx={{
                    width: '100%',
                    ...fieldLabelSx,
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      WebkitTextFillColor: 'unset',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    },
                  }}
                  {...(manyProfiles &&
                    notPrincipalProfile && { value: principalProfile.name })}
                />
              </STooltip>
            ) : (
              <Skeleton variant="rounded" height={40} sx={{ width: '100%' }} />
            )}
          </Box>

          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '1 1 0%' },
              minWidth: { xs: '100%', md: 200 },
              maxWidth: { xs: '100%', md: 240 },
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              overflow: 'visible',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, overflow: 'visible' }}>
              <SelectForm
                setValue={setValue}
                control={control}
                onChange={handleTypeChange}
                defaultValue={
                  characterizationData.type
                    ? String(characterizationData.type)
                    : ''
                }
                options={typeOptions}
                name="type"
                size="small"
                label="Tipo de elemento"
                labelPosition="center"
                placeholder="Escolha o tipo de elemento..."
                formControlProps={{
                  sx: {
                    overflow: 'visible',
                    ...fieldLabelSx,
                  },
                }}
                inputLabelProps={{
                  sx: {
                    color: 'text.primary',
                    '&.Mui-focused': { color: 'primary.main' },
                    '&.Mui-error': { color: 'error.main' },
                    '&.Mui-disabled': { color: 'text.disabled' },
                  },
                }}
                dropDownProps={{
                  sx: {
                    backgroundColor: 'background.paper',
                    mt: '1px',
                    maxWidth: 'min(480px, 90vw)',
                    '& .MuiMenuItem-root': {
                      whiteSpace: 'normal',
                      py: 1,
                    },
                  },
                }}
                sx={{
                  '& .MuiSelect-select': {
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
                {...(manyProfiles && notPrincipalProfile && { disabled: true })}
              />
            </Box>
            <SHelp
              tooltip={typeHelpTooltip}
              sx={{ flexShrink: 0, pt: 0.5 }}
              tooltipProps={{
                placement: 'bottom-start',
                disableInteractive: false,
                leaveDelay: 400,
                enterNextDelay: 0,
                PopperProps: {
                  modifiers: [
                    { name: 'flip', enabled: true },
                    {
                      name: 'preventOverflow',
                      options: { padding: 8, boundary: 'viewport' },
                    },
                    {
                      name: 'offset',
                      options: { offset: [0, 4] },
                    },
                  ],
                },
                componentsProps: {
                  tooltip: {
                    sx: {
                      maxWidth: 440,
                      // ~640px, sem ultrapassar a viewport (rollo interno se necessário).
                      maxHeight: 'min(640px, calc(100vh - 48px))',
                      overflowY: 'auto',
                      overscrollBehavior: 'contain',
                      p: 1.5,
                      scrollbarWidth: 'thin',
                      '&::-webkit-scrollbar': { width: 8 },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255,255,255,0.35)',
                        borderRadius: 4,
                      },
                    },
                  },
                },
              }}
            />
          </Box>

          <SFlex
            align="center"
            overflow="auto"
            gap={0}
            sx={{
              flex: '0 1 auto',
              minWidth: 0,
              maxWidth: { xs: '100%', md: 'none' },
              pt: 1.5,
            }}
          >
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
              bg={
                !!manyProfiles && !notPrincipalProfile ? 'gray.500' : undefined
              }
            />
            {profiles?.map((profile) => {
              return (
                <STagButton
                  key={profile.id}
                  text={`${profile.profileName}`}
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
            {!hideCharacterizationDelete && (
              <SIconButton
                tooltip={'remover perfil'}
                onClick={() => onRemove()}
              >
                <Icon sx={{ fontSize: 20 }} component={SDeleteIcon} />
              </SIconButton>
            )}
          </SFlex>

          <Box sx={{ flex: '0 0 auto', pt: 1.5 }}>
            {characterizationData.type ? (
              <STooltip withWrapper title={ASSISTENTE_IA_HELP_TEXT}>
                <SButton
                  color="primary"
                  variant="outlined"
                  onClick={() => setAssistModalOpen(true)}
                  sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  Assistente IA da Caracterização
                </SButton>
              </STooltip>
            ) : null}
          </Box>
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
            <CharacterizationContentEditor
              label="Descrição"
              placeholder="Descreva..."
              value={characterizationData.paragraphs ?? []}
              onChange={(paragraphs) =>
                setCharacterizationData((current) => ({
                  ...current,
                  paragraphs,
                }))
              }
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
            <CharacterizationContentEditor
              label={
                isEnvironment
                  ? 'Processos de Trabalho'
                  : 'Atividades ou tarefas realizadas'
              }
              placeholder={
                isEnvironment
                  ? 'Descreva o processo...'
                  : 'Descreva a atividade...'
              }
              value={characterizationData.activities ?? []}
              onChange={(activities) =>
                setCharacterizationData((current) => ({
                  ...current,
                  activities,
                }))
              }
            />
            <Box sx={{ mt: 2 }}>
              <ModalParametersContentBasic
                setValue={setValue}
                control={control}
                data={characterizationData}
              />
            </Box>
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
            <CharacterizationContentEditor
              label="Considerações"
              placeholder="Descreva sua consideração..."
              value={characterizationData.considerations ?? []}
              onChange={(considerations) =>
                setCharacterizationData((current) => ({
                  ...current,
                  considerations,
                }))
              }
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
