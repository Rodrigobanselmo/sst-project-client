/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';

import { ModalEnum } from 'core/enums/modal.enums';

import { useGhoEditor } from '../context/GhoEditorContext';
import { GhoFormContent } from './GhoFormContent';

/** Edição/criação de GSE inline na área principal (sem overlay full screen). */
export const GhoPageEditor = () => {
  const ghoProps = useGhoEditor();
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
  } = ghoProps;

  const isOpen = registerModal(ModalEnum.GHO_ADD).open;
  if (!isOpen || ghoData.layout !== 'page') return null;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <GhoFormContent
        layout="page"
        ghoData={ghoData}
        ghoQuery={ghoQuery}
        setGhoData={setGhoData}
        control={control}
        setValue={setValue}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        onCloseUnsaved={onCloseUnsaved}
        onRemove={onRemove}
        onAddHierarchy={onAddHierarchy}
        hierarchies={hierarchies as any}
        loadingQuery={loadingQuery}
        loading={loading}
      />
    </Box>
  );
};
