/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { DocumentsHistoryTable } from 'components/organisms/tables/DocumentsHistoryTable/DocumentsHistoryTable';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SDocumentIcon } from 'assets/icons/SDocumentIcon';
import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { documentTypeList } from 'core/constants/maps/document-type.map';
import { dateToDate } from 'core/utils/date/date-format';

import { ModalAddDocumentYear } from '../ModalAddDocumentYear/ModalAddDocumentYear';
import { useAddDocument } from './hooks/useAddDocument';

export const ModalAddDocument = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    documentData,
    setDocumentData,
    control,
    handleSubmit,
    isEdit,
    modalName,
    setValue,
    handleDelete,
    onAddDocumentFile,
    onDownloadFile,
    downloadIsLoading,
    document,
  } = useAddDocument();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setDocumentData({ ...documentData }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        center
        p={8}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Documento'}
          secondIcon={documentData?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />

        <InputForm
          autoFocus
          defaultValue={documentData.name}
          label={'Nome para identificação'}
          labelPosition="center"
          setValue={setValue}
          control={control}
          sx={{ minWidth: ['100%', 700], mb: 5 }}
          placeholder={'nome...'}
          name="name"
          size="small"
        />

        <SelectForm
          unmountOnChangeDefault
          setValue={setValue}
          defaultValue={String(documentData.type || '') || ''}
          label="Tipo de Documento"
          control={control}
          placeholder="selecione..."
          name="type"
          labelPosition="top"
          onChange={(e) => {
            if (e.target.value)
              setDocumentData({
                ...documentData,
                type: (e as any).target.value,
              });
          }}
          size="small"
          options={documentTypeList}
          boxProps={{ flex: 1, mb: 8 }}
        />

        {!isEdit && (
          <SFlex flexWrap="wrap" mb={5} gap={5}>
            <Box flex={1}>
              <DatePickerForm
                unmountOnChangeDefault
                label="Data de início"
                control={control}
                defaultValue={dateToDate(documentData.startDate)}
                name="startDate"
                onChange={(date) => {
                  setDocumentData({
                    ...documentData,
                    startDate: date instanceof Date ? date : undefined,
                  });
                }}
              />
            </Box>
            <Box flex={1}>
              <DatePickerForm
                unmountOnChangeDefault
                label="Data de vencimento"
                control={control}
                defaultValue={dateToDate(documentData.endDate)}
                name="endDate"
                onChange={(date) => {
                  setDocumentData({
                    ...documentData,
                    endDate: date instanceof Date ? date : undefined,
                  });
                }}
              />
            </Box>
          </SFlex>
        )}
        <InputForm
          defaultValue={documentData.description}
          label={'Descrição'}
          multiline
          setValue={setValue}
          minRows={3}
          maxRows={5}
          control={control}
          placeholder={'descrição...'}
          name="description"
          size="small"
        />

        {documentData.file && (
          <Box mt={5}>
            <InputForm
              defaultValue={documentData.file.name}
              label={'Arquivo'}
              disabled
              setValue={setValue}
              control={control}
              placeholder={'descrição...'}
              name="fileName"
              size="small"
            />
          </Box>
        )}
        <SFlex>
          {!isEdit && documentData.fileUrl && (
            <STagButton
              onClick={onAddDocumentFile}
              width={150}
              mt={5}
              icon={SDocumentIcon}
              text={'Baixar Arquivo'}
              active
            />
          )}
          {!isEdit && (
            <STagButton
              onClick={onAddDocumentFile}
              width={150}
              mt={5}
              icon={SUploadIcon}
              text={
                documentData.file || documentData.fileUrl
                  ? 'Ediar Arquivo'
                  : 'Adcionar Arquivo'
              }
            />
          )}
        </SFlex>

        {isEdit && (
          <Box mt={5}>
            <DocumentsHistoryTable
              hideTitle
              documents={[document, ...(document.oldDocuments || [])]}
            />
          </Box>
        )}

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};

export const StackModalAddDocuments = () => {
  return (
    <>
      <ModalAddDocumentYear />
      <ModalAddDocument />
    </>
  );
};
