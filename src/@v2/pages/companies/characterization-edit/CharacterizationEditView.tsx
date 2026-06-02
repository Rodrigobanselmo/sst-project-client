/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

import { Box } from '@mui/material';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { ModalCharacterizationContent } from 'components/organisms/modals/ModalAddCharacterization/components/ModalCharacterizationContent';
import {
  initialCharacterizationState,
  useEditCharacterization,
} from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';

import { IdsEnum } from 'core/enums/ids.enums';
import {
  CHARACTERIZATION_INLINE_EDITOR_HEIGHT,
} from 'pages/dashboard/empresas/[companyId]/novo/[stage]/constants/characterization-inline-layout.constants';

export type CharacterizationEditViewProps = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  onBack: () => void;
  /** Sem `SHeader` global; integrado à aba de Caracterização. */
  embedded?: boolean;
};

export const CharacterizationEditView = ({
  companyId,
  workspaceId,
  characterizationId,
  onBack,
  embedded = false,
}: CharacterizationEditViewProps) => {
  const isNew = !characterizationId || characterizationId === 'new';

  const initialData = useMemo<Partial<typeof initialCharacterizationState>>(
    () => ({
      id: isNew ? '' : characterizationId,
      companyId,
      workspaceId,
    }),
    [characterizationId, companyId, workspaceId, isNew],
  );

  const props = useEditCharacterization(undefined, {
    initialData,
    onCloseOverride: onBack,
    companyId,
    workspaceId,
  });

  const {
    onSubmit,
    handleSubmit,
    onCloseUnsaved,
    data: characterizationData,
    loading,
    isEdit,
    saveRef,
    isLoading,
  } = props;

  const title = isNew ? 'Nova Caracterização' : 'Editar Caracterização';

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

  const headerRow = embedded ? (
    <SFlex
      align="center"
      justify="space-between"
      mb={4}
      gap={3}
      flexWrap="wrap"
      sx={{ flexShrink: 0 }}
    >
      <SPageHeader mb={0} title={title} onBack={onCloseUnsaved} />
      {actionButtons}
    </SFlex>
  ) : (
    <SFlex
      align="center"
      justify="space-between"
      mb={4}
      gap={3}
      flexWrap="wrap"
      sx={{ flexShrink: 0 }}
    >
      <SPageHeader mb={0} title={title} />
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
          flex: 1,
          minHeight: 0,
          maxHeight: embedded
            ? 'none'
            : { xs: 'none', md: 'calc(100dvh - 100px)' },
          overflow: embedded ? 'visible' : 'hidden',
          py: embedded ? 0 : { xs: 6, sm: 8, md: 5 },
          pb: embedded ? 0 : { xs: 6, md: 2 },
          px: embedded ? 0 : undefined,
        }}
      >
        {headerRow}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: embedded ? 'hidden' : 'auto',
            overflowX: 'hidden',
            pr: 0.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ModalCharacterizationContent
            {...props}
            hideCharacterizationDelete
            embedded={embedded}
          />
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
          height: { xs: 'auto', md: CHARACTERIZATION_INLINE_EDITOR_HEIGHT },
          maxHeight: { md: CHARACTERIZATION_INLINE_EDITOR_HEIGHT },
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
