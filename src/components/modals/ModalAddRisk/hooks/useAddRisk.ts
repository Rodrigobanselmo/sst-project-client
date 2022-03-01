/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';
import * as Yup from 'yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRecMedCreate } from 'core/interfaces/api/IRiskFactors';
import { useMutCreateRisk } from 'core/services/hooks/mutations/useMutCreateRisk';
import { useMutUpdateRisk } from 'core/services/hooks/mutations/useMutUpdateRisk';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { IRiskSchema, riskSchema } from 'core/utils/schemas/risk.schema';

export const initialAddRiskState = {
  status: StatusEnum.ACTIVE,
  name: '',
  type: '',
  recMed: [] as IRecMedCreate[],
  hasSubmit: false,
  id: 0,
  companyId: '',
};

export const useAddRisk = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddRiskState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(Yup.object().shape(riskSchema)),
  });

  const createRiskMut = useMutCreateRisk();
  const updateRiskMut = useMutUpdateRisk();

  const { preventUnwantedChanges } = usePreventAction();

  const [riskData, setRiskData] = useState(initialAddRiskState);

  useEffect(() => {
    const { isAddRecMed, remove, edit, ...initialData } = getModalData<any>(
      ModalEnum.RISK_ADD,
    );

    if (isAddRecMed) {
      return setRiskData((oldData) => {
        if (remove) {
          return {
            ...oldData,
            recMed: oldData.recMed.filter(
              (item) => item.localId !== initialData.localId,
            ),
          };
        }

        if (edit) {
          const data = [...oldData.recMed];
          const indexItem = oldData.recMed.findIndex(
            (item) => item.localId === initialData.localId,
          );

          data[indexItem] = { ...data[indexItem], ...initialData };

          return {
            ...oldData,
            recMed: data,
          };
        }

        const result = removeDuplicate(
          [
            ...oldData.recMed,
            { ...initialData, localId: oldData.recMed.length },
          ],
          { removeFields: ['status'] },
        );

        return {
          ...oldData,
          recMed: result,
        };
      });
    }

    if (initialData) {
      setRiskData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onSubmit: SubmitHandler<IRiskSchema> = async ({ name, type }) => {
    const { id, companyId, recMed, status } = riskData;
    const typeValue = type as RiskEnum;

    const risk = { id, companyId, recMed, status, name, type: typeValue };

    if (riskData.companyId) risk.companyId = riskData.companyId;

    if (risk.id == 0) {
      await createRiskMut.mutateAsync(risk);
    } else {
      await updateRiskMut.mutateAsync(risk);
    }

    onClose();
  };

  const onClose = () => {
    onCloseModal(ModalEnum.RISK_ADD);
    setRiskData(initialAddRiskState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...riskData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: createRiskMut.isLoading || updateRiskMut.isLoading,
    riskData,
    setRiskData,
    control,
    handleSubmit,
  };
};
