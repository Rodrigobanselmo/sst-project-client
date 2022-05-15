/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
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
  } = useAddGenerateSource();

  const buttons = [
    {},
    {
      text: generateSourceData.edit ? 'Editar' : 'Criar',
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
      <SModalPaper p={8} component="form" onSubmit={handleSubmit(onSubmit)}>
        <SModalHeader
          tag={generateSourceData.edit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Fonte geradora'}
          secondIcon={generateSourceData?.edit ? SDeleteIcon : undefined}
          secondIconClick={onRemove}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={generateSourceData.name}
            multiline
            minRows={2}
            maxRows={4}
            label="Fonte geradora"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'descrição da fonte geradora...'}
            name="name"
            size="small"
          />

          {!generateSourceData.edit && (
            <>
              <InputForm
                multiline
                minRows={2}
                maxRows={4}
                label="Recomendação"
                control={control}
                sx={{ width: ['100%', 600] }}
                placeholder={'descrição da recomendação...'}
                name="recName"
                size="small"
              />
              <InputForm
                multiline
                minRows={2}
                maxRows={4}
                label="Medida de controle"
                control={control}
                sx={{ width: ['100%', 600] }}
                placeholder={'descrição da medida de controle...'}
                name="medName"
                size="small"
              />
              <RadioForm
                type="radio"
                control={control}
                options={[
                  {
                    content: 'Medidas administrativas',
                    value: MedTypeEnum.ADM,
                  },
                  { content: 'Medidas de engenharia', value: MedTypeEnum.ENG },
                ]}
                name="medType"
                mt={-5}
                columns={2}
              />
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
