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

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';

import { EditGenerateSourceSelects } from './components/EditGenerateSourceSelects';
import { useAddGenerateSource } from './hooks/useAddGenerateSource';

export const ModalAddGenerateSource = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    generateSourceData,
    setGenerateSourceData,
    control,
    handleSubmit,
    onRemove,
    reset,
    showRecMed,
  } = useAddGenerateSource();

  const buttons = [
    {},
    {
      text: generateSourceData.edit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () =>
        setGenerateSourceData({ ...generateSourceData, hasSubmit: true }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.GENERATE_SOURCE_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={generateSourceData.edit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Fonte geradora'}
          secondIcon={generateSourceData?.edit ? SDeleteIcon : undefined}
          secondIconClick={onRemove}
        />
        <SFlex
          sx={{ minWidth: ['100%', 600] }}
          gap={8}
          direction="column"
          mt={8}
        >
          <InputForm
            autoFocus
            defaultValue={generateSourceData.name}
            multiline
            minRows={2}
            maxRows={4}
            label="Fonte geradora"
            control={control}
            placeholder={'descrição da fonte geradora...'}
            name="name"
            size="small"
            firstLetterCapitalize
          />

          {showRecMed && !generateSourceData.edit && (
            <>
              <InputForm
                multiline
                minRows={2}
                maxRows={4}
                label="Recomendação"
                control={control}
                placeholder={'descrição da recomendação...'}
                name="recName"
                size="small"
                firstLetterCapitalize
              />
              <Box position="relative">
                <InputForm
                  multiline
                  minRows={3}
                  maxRows={3}
                  label="Medida de controle"
                  control={control}
                  placeholder={'descrição da medida de controle...'}
                  name="medName"
                  size="small"
                  firstLetterCapitalize
                  sx={{
                    minWidth: ['100%', 600],
                    '& .MuiOutlinedInput-root': { pb: 30 },
                  }}
                />
                <RadioFormText
                  type="radio"
                  reset={reset}
                  control={control}
                  options={[
                    {
                      content: 'Medidas administrativas',
                      value: MedTypeEnum.ADM,
                    },
                    {
                      content: 'Medidas de engenharia (EPC)',
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
            </>
          )}
        </SFlex>
        <EditGenerateSourceSelects
          generateSourceData={generateSourceData}
          setGenerateSourceData={setGenerateSourceData}
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
