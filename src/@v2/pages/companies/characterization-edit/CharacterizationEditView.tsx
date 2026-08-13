/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';

import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { ModalCharacterizationContent } from 'components/organisms/modals/ModalAddCharacterization/components/ModalCharacterizationContent';
import {
  initialCharacterizationState,
  useEditCharacterization,
} from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';

import { IdsEnum } from 'core/enums/ids.enums';

import { CharacterizationEditStepErrorBoundary } from './CharacterizationEditStepErrorBoundary';
import {
  canApplyCharacterizationWizardStep,
  clampCharacterizationWizardStep,
} from '../characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-step.util';

export type CharacterizationEditViewProps = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  onBack: () => void;
  /** Sem `SHeader` global; integrado à aba de Caracterização. */
  embedded?: boolean;
  /** Abre wizard em aba específica (`CHARACTERIZATION_WIZARD_STEP`). */
  initialWizardStep?: number;
  /** Fase 2B — abre Assistente IA ou fluxo de Resumo após hidratar. */
  initialAiAction?: 'assist' | 'inventory-summary';
  /** Remonta o editor após falha controlada. */
  onRetry?: () => void;
};

const EditLoadingFallback = ({
  minHeight = 240,
  message = 'Carregando caracterização…',
}: {
  minHeight?: number;
  message?: string;
}) => (
  <SFlex
    align="center"
    justify="center"
    direction="column"
    gap={2}
    sx={{ minHeight, width: '100%', py: 8 }}
  >
    <CircularProgress size={32} />
    <SText color="text.secondary" fontSize={13}>
      {message}
    </SText>
  </SFlex>
);

export const CharacterizationEditView = ({
  companyId,
  workspaceId,
  characterizationId,
  onBack,
  embedded = false,
  initialWizardStep,
  initialAiAction,
  onRetry,
}: CharacterizationEditViewProps) => {
  const isNew = !characterizationId || characterizationId === 'new';
  const hasMinimumContext = !!companyId && !!workspaceId && !!characterizationId;
  const requestedStep = clampCharacterizationWizardStep(initialWizardStep);
  const [localRetryKey, setLocalRetryKey] = useState(0);

  const initialData = useMemo<Partial<typeof initialCharacterizationState>>(
    () => ({
      id: isNew ? '' : characterizationId,
      companyId,
      workspaceId,
    }),
    [characterizationId, companyId, workspaceId, isNew, localRetryKey],
  );

  const props = useEditCharacterization(undefined, {
    initialData: hasMinimumContext ? initialData : undefined,
    onCloseOverride: onBack,
    companyId: hasMinimumContext ? companyId : undefined,
    workspaceId: hasMinimumContext ? workspaceId : undefined,
  });

  const {
    onSubmit,
    handleSubmit,
    onCloseUnsaved,
    data: characterizationData,
    loading,
    saveRef,
    isLoading,
    isDetailLoading,
    isDetailError,
  } = props;

  const hasHydratedType = !!characterizationData?.type;
  const isEditEntity = !isNew && !!characterizationData?.id;

  const stepGate = canApplyCharacterizationWizardStep({
    requestedStep,
    hasType: hasHydratedType,
    isEdit: isEditEntity,
    isDetailLoading: !isNew && !!isDetailLoading,
    isDetailError: !isNew && !!isDetailError,
  });

  const shouldWaitDetail =
    hasMinimumContext &&
    !isNew &&
    !isDetailError &&
    (!hasHydratedType || !stepGate.ok);

  const shouldShowError =
    !hasMinimumContext || (!isNew && isDetailError && !hasHydratedType);

  const handleRetry = () => {
    setLocalRetryKey((value) => value + 1);
    onRetry?.();
  };

  const title = isNew ? 'Nova Caracterização' : 'Editar Caracterização';
  /** Nome do elemento — contexto estável em todas as abas (sem fetch extra). */
  const elementName = (characterizationData?.name || '').trim();
  const headerSubtitle = !isNew && elementName ? elementName : undefined;

  if (shouldShowError) {
    const errorContent = (
      <SFlex
        direction="column"
        align="flex-start"
        gap={3}
        sx={{ py: 6, px: 2, width: '100%', minHeight: 280 }}
      >
        <SPageHeader
          mb={0}
          title={title}
          subtitle={headerSubtitle}
          onBack={onBack}
        />
        <Alert severity="error" sx={{ width: '100%' }}>
          Não foi possível carregar os dados da caracterização.
        </Alert>
        <SFlex gap={2} flexWrap="wrap">
          <Button variant="contained" onClick={handleRetry}>
            Tentar novamente
          </Button>
          <Button variant="outlined" onClick={onBack}>
            Voltar para a lista
          </Button>
        </SFlex>
      </SFlex>
    );

    if (embedded) {
      return (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            bgcolor: 'background.paper',
          }}
        >
          {errorContent}
        </Box>
      );
    }

    return (
      <>
        <SHeader title={'Caracterização'} />
        <SContainer>{errorContent}</SContainer>
      </>
    );
  }

  if (shouldWaitDetail) {
    const loadingMessage =
      typeof initialWizardStep === 'number' && initialWizardStep > 0
        ? 'Preparando a etapa solicitada…'
        : 'Carregando caracterização…';
    // Mantém o cabeçalho estável durante a hidratação (evita “piscar” o título).
    const loadingContent = (
      <SFlex
        direction="column"
        sx={{ width: '100%', flex: 1, minHeight: 0, px: embedded ? 0 : 2 }}
      >
        <SPageHeader
          mb={4}
          title={title}
          subtitle={headerSubtitle}
          onBack={onBack}
        />
        <EditLoadingFallback minHeight={220} message={loadingMessage} />
      </SFlex>
    );

    if (embedded) {
      return (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            bgcolor: 'background.paper',
          }}
        >
          {loadingContent}
        </Box>
      );
    }

    return (
      <>
        <SHeader title={'Caracterização'} />
        <SContainer>{loadingContent}</SContainer>
      </>
    );
  }

  const actionButtons = (
    <SFlex align="center" gap={3} flexWrap="wrap" justifyContent="flex-end">
      <SButton
        variant="outlined"
        style={{ minWidth: 100 }}
        id={IdsEnum.CANCEL_BUTTON}
        onClick={onCloseUnsaved}
      >
        Cancelar
      </SButton>
      <SButton
        type="submit"
        variant="outlined"
        id={IdsEnum.ADD_RISK_CHARACTERIZATION_ID}
        style={{ display: 'none' }}
        onClick={() => (saveRef.current = 'risk')}
      >
        Salvar
      </SButton>
      <SButton
        type="submit"
        variant="outlined"
        id={IdsEnum.ADD_PROFILE_CHARACTERIZATION_ID}
        style={{ display: 'none' }}
        onClick={() => null}
      >
        Salvar Perfil
      </SButton>
      <SButton
        variant="outlined"
        type="submit"
        style={{ minWidth: 100 }}
        id={IdsEnum.ADD_CHARACTERIZATION_ID}
        onClick={() => (saveRef.current = true)}
      >
        Salvar
      </SButton>
      <SButton
        variant="contained"
        type="submit"
        style={{ minWidth: 100 }}
        loading={loading}
        onClick={() => (saveRef.current = false)}
      >
        {characterizationData.id ? 'Salvar e Sair' : 'Criar'}
      </SButton>
    </SFlex>
  );

  const headerRow = (
    <SFlex
      align="center"
      justify="space-between"
      mb={4}
      gap={3}
      flexWrap="wrap"
      sx={{ flexShrink: 0 }}
    >
      <SPageHeader
        mb={0}
        title={title}
        subtitle={headerSubtitle}
        onBack={embedded ? onCloseUnsaved : undefined}
      />
      {actionButtons}
    </SFlex>
  );

  const content = (
    <Box
      sx={{
        opacity: isLoading ? 0.6 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        flex: embedded ? 1 : undefined,
        minHeight: embedded ? 0 : undefined,
        width: '100%',
      }}
      component="form"
      onSubmit={(handleSubmit as any)(onSubmit)}
    >
      <SContainer
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: embedded ? 1 : undefined,
          minHeight: embedded ? 0 : undefined,
          maxHeight: embedded
            ? 'none'
            : { xs: 'none', md: 'calc(100vh - 100px)' },
          overflow: embedded ? 'visible' : 'hidden',
          py: embedded ? 0 : { xs: 6, sm: 8, md: 5 },
          pb: embedded ? 0 : { xs: 6, md: 2 },
          px: embedded ? 0 : undefined,
          ...(embedded
            ? {}
            : {
                '@supports (height: 100dvh)': {
                  maxHeight: { md: 'calc(100dvh - 100px)' },
                },
              }),
        }}
      >
        {headerRow}

        <Box
          sx={{
            flex: embedded ? 1 : undefined,
            minHeight: embedded ? 0 : undefined,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 0.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CharacterizationEditStepErrorBoundary
            title="Falha ao abrir o editor da caracterização."
            onBack={onBack}
            onRetry={handleRetry}
          >
            <ModalCharacterizationContent
              key={`char-edit-content-${localRetryKey}-${requestedStep}-${initialAiAction ?? 'none'}`}
              {...props}
              hideCharacterizationDelete
              embedded={embedded}
              initialWizardStep={requestedStep}
              initialAiAction={initialAiAction}
            />
          </CharacterizationEditStepErrorBoundary>
        </Box>
      </SContainer>
    </Box>
  );

  if (embedded) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          bgcolor: 'background.paper',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <>
      <SHeader title={'Caracterização'} />
      {content}
    </>
  );
};
