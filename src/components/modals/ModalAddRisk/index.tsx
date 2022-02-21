import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
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
import { StatusEnum } from 'project/enum/status.enum';
import * as Yup from 'yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRecMedCreate } from 'core/interfaces/api/IRiskFactors';
import { useMutAddChecklist } from 'core/services/hooks/mutations/useMutAddChecklist';
import { IRiskSchema, riskSchema } from 'core/utils/schemas/risk.schema';

import { EditRiskSelects } from './components/EditRiskSelects';

const initialState = {
  status: StatusEnum.PROGRESS,
  name: '',
  type: '',
  recMed: [] as IRecMedCreate[],
  hasSubmit: false,
};

export const ModalAddRisk = () => {
  const { registerModal, currentModal } = useRegisterModal();
  const { onCloseModal } = useModal();

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(Yup.object().shape(riskSchema)),
  });
  const mutation = useMutAddChecklist();

  const { preventUnwantedChanges } = usePreventAction();
  // const { enqueueSnackbar } = useSnackbar();

  const [riskData, setRiskData] = useState(initialState);

  useEffect(() => {
    const initialData = currentModal
      .reverse()
      .find((modal) => modal.name === ModalEnum.RISK_ADD);

    if (initialData && initialData.data && initialData.data.isRecMed) {
      setRiskData((oldData) => {
        const result = [...oldData.recMed, initialData.data].filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                (item.recName && t.recName === item.recName) ||
                (item.medName && t.medName === item.medName),
            ),
        );

        return {
          ...oldData,
          recMed: result,
        };
      });
    }
  }, [currentModal]);

  const onClose = () => {
    onCloseModal(ModalEnum.RISK_ADD);
    setRiskData(initialState);
    reset();
  };

  const onSubmit: SubmitHandler<IRiskSchema> = (data) => {
    console.log('riskData', { ...data, ...riskData });
    // TODO CREATE RISK
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges({ ...riskData, ...values }, initialState, onClose)
    )
      return;
    onClose();
  };

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
            })}
          />
        </Box>
        <EditRiskSelects riskData={riskData} setRiskData={setRiskData} />
        <SModalButtons
          loading={mutation.isLoading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
