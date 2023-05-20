/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';

import { EditRecMedSelects } from './components/EditRecMedSelects';
import { useAddRecMed } from './hooks/useAddRecMed';

export const ModalAddRecMed = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    recMedData,
    setRecMedData,
    control,
    handleSubmit,
    onRemove,
  } = useAddRecMed();

  const buttons = [
    {},
    {
      text: recMedData.edit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setRecMedData({ ...recMedData, hasSubmit: true }),
    },
  ] as IModalButton[];

  const hasRec = ['rec', ''].includes(recMedData.onlyInput);
  const hasMed = !(recMedData.onlyInput == 'rec');

  return (
    <SModal
      {...registerModal(ModalEnum.ENG_MED_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={recMedData.edit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Recomendação e medida de controle'}
          secondIcon={recMedData?.edit ? SDeleteIcon : undefined}
          secondIconClick={onRemove}
        />
        <SFlex gap={8} direction="column" mt={8}>
          {hasRec && (
            <Box position="relative">
              <InputForm
                autoFocus
                multiline
                fullWidth
                defaultValue={recMedData.recName}
                placeholder={'descrição da recomendação...'}
                name="recName"
                label="Recomendação"
                minRows={3}
                maxRows={3}
                control={control}
                sx={{
                  minWidth: ['100%', 600],
                  '& .MuiOutlinedInput-root': { pb: 30 },
                }}
                size="small"
                firstLetterCapitalize
              />
              <RadioFormText
                type="radio"
                control={control}
                defaultValue={String(recMedData.recType)}
                options={[
                  {
                    content: 'Administrativa',
                    value: RecTypeEnum.ADM,
                    tooltip:
                      'Procedimentos de Trabalho e Controles Administrativos',
                  },
                  {
                    content: 'Engenharia',
                    value: RecTypeEnum.ENG,
                    tooltip: 'Medidas de Controle de Engenharia/Coletivas',
                  },
                  {
                    content: 'EPI',
                    value: RecTypeEnum.EPI,
                    tooltip: 'Equipamentos de Proteção Individual',
                  },
                ]}
                name="recType"
                pr={8}
                pl={11}
                columns={3}
                zIndex={2}
                position="absolute"
                top={115}
                width="100%"
              />
            </Box>
          )}
          {hasMed && (
            <Box position="relative">
              <InputForm
                multiline
                autoFocus={!hasRec}
                fullWidth
                defaultValue={recMedData.medName}
                minRows={3}
                maxRows={3}
                label={'Medida de controle'}
                control={control}
                sx={{
                  minWidth: ['100%', 600],
                  '& .MuiOutlinedInput-root': { pb: 30 },
                }}
                placeholder={'descrição da medida de controle...'}
                name="medName"
                size="small"
                firstLetterCapitalize
              />
              <RadioFormText
                type="radio"
                control={control}
                defaultValue={String(recMedData.medType)}
                options={[
                  {
                    content: 'Outras Medidas',
                    value: MedTypeEnum.ADM,
                  },
                  {
                    content: 'EPC / ENG',
                    value: MedTypeEnum.ENG,
                  },
                ]}
                name="medType"
                pr={8}
                pl={11}
                columns={2}
                zIndex={2}
                position="absolute"
                top={115}
                width="100%"
              />
            </Box>
          )}
        </SFlex>
        <EditRecMedSelects
          recMedData={recMedData}
          setRecMedData={setRecMedData}
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
