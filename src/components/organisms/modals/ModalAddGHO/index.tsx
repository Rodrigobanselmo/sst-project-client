/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { HierarchyHomoTable } from 'components/organisms/tables/HierarchyHomoTable/HierarchyHomoTable';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalAutomateSubOffice } from '../ModalAutomateSubOffice';
import { ModalSelectHierarchy } from '../ModalSelectHierarchy';
import { EditGhoSelects } from './components/EditGhoSelects';
import { useAddGho } from './hooks/useAddGho';

export const ModalAddGho = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loadingQuery,
    loading,
    ghoData,
    setGhoData,
    control,
    handleSubmit,
    onRemove,
    onAddHierarchy,
    hierarchies,
    ghoQuery,
  } = useAddGho();

  const buttons = [
    {},
    {
      text: ghoData.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setGhoData({ ...ghoData }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.GHO_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8} component="form" onSubmit={handleSubmit(onSubmit)}>
        <SModalHeader
          tag={ghoData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Grupo similar de exposição'}
          secondIcon={ghoData?.id ? SDeleteIcon : undefined}
          secondIconClick={onRemove}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={ghoData.name}
            minRows={2}
            maxRows={4}
            label="Nome"
            control={control}
            sx={{ width: ['100%', '100%', '100%', 800] }}
            placeholder={'nome do GSE...'}
            name="name"
            size="small"
          />
          <InputForm
            multiline
            defaultValue={ghoData.description || ghoQuery.description}
            minRows={2}
            maxRows={4}
            label="Descrição"
            control={control}
            sx={{ width: ['100%', '100%', '100%', 800] }}
            placeholder={'descrição do GSE...'}
            name="description"
            size="small"
          />
          <Box mt={10}>
            <HierarchyHomoTable
              onAdd={onAddHierarchy}
              loading={loadingQuery}
              hierarchies={hierarchies as any}
            />
          </Box>
        </SFlex>
        <EditGhoSelects
          ghoQuery={ghoQuery}
          ghoData={ghoData}
          setGhoData={setGhoData}
        />
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};

export const StackModalAddGho = () => {
  return (
    <>
      <ModalAddGho />
      <ModalSelectHierarchy />
      <ModalAutomateSubOffice />
    </>
  );
};
