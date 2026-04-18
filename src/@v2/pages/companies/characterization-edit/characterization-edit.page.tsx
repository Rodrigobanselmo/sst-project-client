/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

import { Box, Icon } from '@mui/material';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
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

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'outlined',
      id: IdsEnum.ADD_RISK_CHARACTERIZATION_ID,
      type: 'submit',
      style: { display: 'none' },
      onClick: () => (saveRef.current = 'risk'),
    },
    {
      text: 'Salvar Perfil',
      variant: 'outlined',
      id: IdsEnum.ADD_PROFILE_CHARACTERIZATION_ID,
      type: 'submit',
      style: { display: 'none' },
      onClick: () => null,
    },
    {
      text: 'Salvar',
      variant: 'outlined',
      id: IdsEnum.ADD_CHARACTERIZATION_ID,
      type: 'submit',
      onClick: () => (saveRef.current = true),
    },
    {
      text: characterizationData.id ? 'Salvar e Sair' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => (saveRef.current = false),
    },
  ] as IModalButton[];

  return (
    <>
      <SHeader title={'Caracterização'} />
      <Box
        sx={{
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
        }}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SContainer>
          <SFlex align="center" justify="space-between" mb={8}>
            <SPageHeader
              mb={0}
              title={isEdit ? 'Editar Caracterização' : 'Nova Caracterização'}
            />
            <SFlex align="center" gap={4}>
              <SButton
                text={characterizationData.id ? 'Salvar' : 'Criar'}
                variant="contained"
                color="primary"
                loading={loading}
                onClick={() => (saveRef.current = true)}
                buttonProps={{ type: 'submit' }}
              />
              {characterizationData?.id && (
                <SIconButton onClick={onRemove} tooltip="Remover">
                  <Icon component={SDeleteIcon} sx={{ fontSize: 20 }} />
                </SIconButton>
              )}
            </SFlex>
          </SFlex>

          <ModalCharacterizationContent {...props} />

          <SModalButtons
            loading={loading}
            onClose={onCloseUnsaved}
            buttons={buttons}
          />
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
