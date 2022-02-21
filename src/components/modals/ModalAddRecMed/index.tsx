import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
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
import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutAddChecklist } from 'core/services/hooks/mutations/useMutAddChecklist';
import { IRiskSchema, riskSchema } from 'core/utils/schemas/risk.schema';

import { StatusSelect } from '../../tagSelects/StatusSelect';
import { EditRecMedSelects } from './components/EditRecMedSelects';
import { recMedSchema } from 'core/utils/schemas/recMed.schema';
import { ICurrentModal } from 'store/reducers/modal/modalSlice';

const initialState = {
  status: StatusEnum.ACTIVE,
  recName: '',
  medName: '',
  risk: {} as IRiskFactors,
  riskIds: [],
  hasSubmit: false,
  passDataBack: false,
};

export const ModalAddRecMed = () => {
  const { registerModal, currentModal } = useRegisterModal();
  const { onCloseModal } = useModal();

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(recMedSchema),
  });
  const mutation = useMutAddChecklist();

  const { preventUnwantedChanges } = usePreventAction();

  const [recMedData, setRecMedData] = useState({
    ...initialState,
  });

  useEffect(() => {
    const initialData = currentModal
      .reverse()
      .find((modal) => modal.name === ModalEnum.REC_MED_ADD);

    if (initialData && initialData.data) {
      setRecMedData((oldData) => ({
        ...oldData,
        ...initialData.data,
      }));
    }
  }, [currentModal]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.REC_MED_ADD, data);
    setRecMedData(initialState);
    reset();
  };

  const onSubmit: SubmitHandler<any> = (data) => {
    if (recMedData.passDataBack)
      return onClose({
        status: recMedData.status,
        isRecMed: true,
        ...data,
      });

    const submitData = {
      status: recMedData.status,
      riskId: recMedData.risk.id,
      ...data,
    };

    console.log(submitData);

    // TODO create rec med
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...recMedData, ...values },
        initialState,
        onClose,
      )
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
          tag="add"
          onClose={onCloseUnsaved}
          title={'Recomendação e medida de controle'}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
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
        </SFlex>
        <EditRecMedSelects
          recMedData={recMedData}
          setRecMedData={setRecMedData}
        />
        <SModalButtons
          loading={mutation.isLoading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
