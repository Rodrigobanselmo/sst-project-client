/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SRadioCheckbox from 'components/atoms/SRadioCheckbox';
import { InputForm } from 'components/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { RiskEnum } from 'project/enum/risk.enums';

import { ModalEnum } from 'core/enums/modal.enums';

import { EditRiskSelects } from './components/EditRiskSelects';
import { useAddRisk } from './hooks/useAddRisk';

export const ModalAddRisk = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    riskData,
    setRiskData,
    control,
    handleSubmit,
  } = useAddRisk();

  const buttons = [
    {},
    {
      text: 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setRiskData({ ...riskData, hasSubmit: true }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.RISK_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8} component="form" onSubmit={handleSubmit(onSubmit)}>
        <SModalHeader
          tag="add"
          onClose={onCloseUnsaved}
          title={'Fator de risco'}
        />
        <Box mt={8}>
          <InputForm
            defaultValue={riskData.name}
            autoFocus
            multiline
            minRows={2}
            maxRows={5}
            label="Descrição do risco"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'descrição do fator de risco...'}
            name="name"
            size="small"
          />
          <SRadioCheckbox
            type="radio"
            error={riskData?.type ? false : riskData.hasSubmit}
            options={Object.keys(RiskEnum)}
            name="type"
            mt={3}
            columns={5}
            inputProps={(option) => ({
              onChange: () => setRiskData({ ...riskData, type: option }),
              checked: option === riskData.type,
            })}
          />
        </Box>
        <EditRiskSelects riskData={riskData} setRiskData={setRiskData} />
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
