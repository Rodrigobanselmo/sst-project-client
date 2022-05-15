/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { RiskEnum } from 'project/enum/risk.enums';
import { SeverityEnum } from 'project/enum/severity.enums';

import { ModalEnum } from 'core/enums/modal.enums';
import { enumToArray } from 'core/utils/helpers/convertEnum';

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
      text: riskData?.id ? 'Editar' : 'Criar',
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
          tag={riskData?.id ? 'edit' : 'add'}
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
          <RadioForm
            type="radio"
            control={control}
            defaultValue={riskData.type}
            options={Object.keys(RiskEnum)}
            name="type"
            mt={3}
            columns={5}
          />
          <RadioForm
            type="radio"
            label="Severidade"
            control={control}
            defaultValue={String(riskData.severity)}
            options={enumToArray(SeverityEnum, 'value')}
            name="severity"
            mt={5}
            columns={5}
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
