/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Divider } from '@mui/material';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
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
      text: riskData?.id ? 'Salvar' : 'Criar',
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
      <SModalPaper
        center
        p={8}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
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
            firstLetterCapitalize
          />
          <RadioFormText
            type="radio"
            control={control}
            defaultValue={riskData.type}
            options={Object.keys(RiskEnum)}
            name="type"
            mt={3}
            columns={5}
          />
          <RadioFormText
            type="radio"
            label="Severidade"
            control={control}
            defaultValue={String(riskData.severity)}
            options={enumToArray(SeverityEnum, 'value')}
            name="severity"
            mt={5}
            mb={15}
            columns={5}
          />
          <InputForm
            defaultValue={riskData.risk}
            multiline
            minRows={2}
            maxRows={5}
            label={
              <>
                Risco{' '}
                <span style={{ fontSize: 11 }}>
                  (Órgãos Alvo ou Maior Parte do Corpo Prejudicada - Resumo de
                  Sintomas)
                </span>
              </>
            }
            control={control}
            sx={{ width: ['100%', 600], mb: 8 }}
            placeholder={'descrião do risco...'}
            name="risk"
            size="small"
            firstLetterCapitalize
          />
          <InputForm
            defaultValue={riskData.symptoms}
            multiline
            minRows={2}
            maxRows={5}
            label="Sintomas, Danos ou Qualquer consequência negativa"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'descrião dos sintomas...'}
            name="symptoms"
            size="small"
            firstLetterCapitalize
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
