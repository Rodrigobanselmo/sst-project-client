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
      text: recMedData.edit ? 'Editar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setRecMedData({ ...recMedData, hasSubmit: true }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.REC_MED_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8} component="form" onSubmit={handleSubmit(onSubmit)}>
        <SModalHeader
          tag={recMedData.edit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Recomendação e medida de controle'}
          secondIcon={recMedData?.edit ? SDeleteIcon : undefined}
          secondIconClick={onRemove}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={recMedData.recName}
            multiline
            minRows={2}
            maxRows={4}
            label="Recomendação"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'descrição da recomendação...'}
            name="recName"
            size="small"
          />
          <InputForm
            multiline
            fullWidth
            defaultValue={recMedData.medName}
            minRows={2}
            maxRows={4}
            label="Medida de controle"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'descrição da medida de controle...'}
            name="medName"
            size="small"
          />
          <RadioForm
            type="radio"
            control={control}
            defaultValue={String(recMedData.medType)}
            options={[
              { content: 'Medidas administrativas', value: MedTypeEnum.ADM },
              { content: 'Medidas de engenharia', value: MedTypeEnum.ENG },
            ]}
            name="medType"
            mt={-5}
            columns={2}
          />
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
