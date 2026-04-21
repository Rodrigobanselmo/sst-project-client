/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

import { Box, Icon } from '@mui/material';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { ModalCharacterizationContent } from 'components/organisms/modals/ModalAddCharacterization/components/ModalCharacterizationContent';
import {
  initialCharacterizationState,
  useEditCharacterization,
} from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { useRouter } from 'next/router';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { IdsEnum } from 'core/enums/ids.enums';

const CharacterizationEditPageContent = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const workspaceId = router.query.workspaceId as string;
  const characterizationId = router.query.characterizationId as string;

  const isNew = !characterizationId || characterizationId === 'new';

  const initialData = useMemo<Partial<typeof initialCharacterizationState>>(
    () => ({
      id: isNew ? '' : characterizationId,
      companyId,
      workspaceId,
    }),
    [characterizationId, companyId, workspaceId, isNew],
  );

  const onBack = () => {
    router.push(`/dashboard/empresas/${companyId}/${workspaceId}/todos`);
  };

  const props = useEditCharacterization(undefined, {
    initialData,
    onCloseOverride: onBack,
  });

  const {
    onSubmit,
    handleSubmit,
    onCloseUnsaved,
    data: characterizationData,
    loading,
    isEdit,
    onRemove,
    saveRef,
    isLoading,
  } = props;

  return (
    <>
      <SHeader title={'Caracterização'} />
      <Box
        sx={{
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
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
            maxHeight: { xs: 'none', md: 'calc(100dvh - 100px)' },
            overflow: 'hidden',
            py: { xs: 6, sm: 8, md: 5 },
            pb: { xs: 6, md: 2 },
          }}
        >
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
              title={isEdit ? 'Editar Caracterização' : 'Nova Caracterização'}
            />
            <SFlex
              align="center"
              gap={3}
              flexWrap="wrap"
              justifyContent="flex-end"
            >
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
              {characterizationData?.id && (
                <SIconButton onClick={onRemove} tooltip="Remover">
                  <Icon component={SDeleteIcon} sx={{ fontSize: 20 }} />
                </SIconButton>
              )}
            </SFlex>
          </SFlex>

          <Box
            sx={{
              flex: 1,
              minHeight: { xs: 0, md: 'min(360px, calc(100dvh - 220px))' },
              maxHeight: { xs: 'none', md: 'calc(100dvh - 220px)' },
              overflowY: 'auto',
              overflowX: 'hidden',
              pr: 0.5,
            }}
          >
            <ModalCharacterizationContent {...props} />
          </Box>
        </SContainer>
      </Box>
    </>
  );
};

export const CharacterizationEditPage = () => {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <>
        <SHeader title={'Caracterização'} />
        <SContainer />
      </>
    );
  }

  return <CharacterizationEditPageContent />;
};
