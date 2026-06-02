/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalAutomateSubOffice } from '../ModalAutomateSubOffice';
import { ModalSelectHierarchy } from '../ModalSelectHierarchy';
import { GhoFormContent } from './components/GhoFormContent';
import { GhoEditorProvider, useGhoEditor } from './context/GhoEditorContext';

export { GhoEditorProvider, useGhoEditor, useGhoEditorOptional } from './context/GhoEditorContext';
export { GhoPageEditor } from './components/GhoPageEditor';
export { GhoGseTabContent } from './components/GhoGseTabContent';

/** Modal tradicional (organograma, grupos-homogênios, risk tool, etc.). */
export const ModalAddGhoView = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    ghoData,
    setGhoData,
    control,
    handleSubmit,
    onRemove,
    onAddHierarchy,
    hierarchies,
    ghoQuery,
    setValue,
    loadingQuery,
  } = useGhoEditor();

  const modalProps = registerModal(ModalEnum.GHO_ADD);

  if (!modalProps.open || ghoData.layout === 'page') return null;

  const formContentProps = {
    layout: ghoData.layout,
    ghoData,
    ghoQuery,
    setGhoData,
    control,
    setValue,
    handleSubmit,
    onSubmit,
    onCloseUnsaved,
    onRemove,
    onAddHierarchy,
    hierarchies: hierarchies as any,
    loadingQuery,
    loading,
  };

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
      {...modalProps}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
        sx={{ width: 1000, maxWidth: '95vw' }}
      >
        <SModalHeader
          tag={ghoData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={ghoData.id ? 'Editar GSE' : 'Grupo similar de exposição'}
          secondIcon={ghoData?.id ? SDeleteIcon : undefined}
          secondIconClick={onRemove}
        />

        <GhoFormContent {...formContentProps} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};

/** Compat: monta provider + view (páginas que usam só `<ModalAddGho />`). */
export const ModalAddGho = () => (
  <GhoEditorProvider>
    <ModalAddGhoView />
  </GhoEditorProvider>
);

type StackModalAddGhoProps = {
  /** Evita duplicar `ModalSelectHierarchy` quando a página já o monta (ex.: `/novo/sst`). */
  includeHierarchySelect?: boolean;
  /** Provider já existe no ancestral (ex.: bloco SST em `/novo/sst`). */
  embedInParentProvider?: boolean;
};

export const StackModalAddGho = ({
  includeHierarchySelect = true,
  embedInParentProvider = false,
}: StackModalAddGhoProps = {}) => {
  const stack = (
    <>
      <ModalAddGhoView />
      {includeHierarchySelect && <ModalSelectHierarchy />}
      <ModalAutomateSubOffice />
    </>
  );

  if (embedInParentProvider) return stack;

  return <GhoEditorProvider>{stack}</GhoEditorProvider>;
};
