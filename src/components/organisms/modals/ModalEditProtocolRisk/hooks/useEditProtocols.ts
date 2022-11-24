/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProtocol, IProtocolToRisk } from 'core/interfaces/api/IProtocol';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  ICreateProtocolRisk,
  useMutCreateProtocolRisk,
} from 'core/services/hooks/mutations/checklist/protocols/useMutCreateProtocolRisk/useMutCreateProtocolRisk';
import { useMutUpdateProtocolRisk } from 'core/services/hooks/mutations/checklist/protocols/useMutUpdateProtocolRisk/useMutUpdateProtocolRisk';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { protocolRiskSchema } from 'core/utils/schemas/protocol.schema';

export const initialProtocolRiskState = {
  id: 0,
  protocolId: 0 as number,
  minRiskDegree: 0 as number,
  minRiskDegreeQuantity: 1 as number,
  riskId: '' as string,
  risk: {} as IRiskFactors,
  protocol: {} as IProtocol,
  error: {
    risk: false,
    protocol: false,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (protocol: Partial<IProtocolToRisk> | null) => {},
};

interface ISubmit {
  validityInMonths: string;
  lowValidityInMonths: string;
  considerBetweenDays: string;
  fromAge: string;
  toAge: string;
  minRiskDegree: string;
  minRiskDegreeQuantity: string;
}

export const useEditProtocols = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialProtocolRiskState);

  const { handleSubmit, control, setValue, reset, getValues } = useForm({
    resolver: yupResolver(protocolRiskSchema),
  });

  const { preventUnwantedChanges } = usePreventAction();

  const [protocolData, setProtocolData] = useState({
    ...initialProtocolRiskState,
  });

  const createMutation = useMutCreateProtocolRisk();
  const updateMutation = useMutUpdateProtocolRisk();

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialProtocolRiskState>>(
      ModalEnum.PROTOCOL_RISK,
    );

    if (initialData) {
      setProtocolData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.PROTOCOL_RISK, data);
    setProtocolData(initialProtocolRiskState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const beforeObject = cleanObjectValues({
      ...protocolData,
      ...cleanObjectValues(values),
    });
    const afterObject = cleanObjectValues(initialDataRef.current);

    if (preventUnwantedChanges(afterObject, beforeObject, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async ({
    minRiskDegree,
    // minRiskDegreeQuantity,
  }) => {
    if (!protocolData.riskId) {
      setProtocolData((oldData) => ({
        ...oldData,
        error: { ...oldData.error, risk: true },
      }));
      return;
    }

    if (!protocolData.protocolId) {
      setProtocolData((oldData) => ({
        ...oldData,
        error: { ...oldData.error, protocol: true },
      }));
      return;
    }

    const submitData: ICreateProtocolRisk & { id?: number } = {
      ...protocolData,
      minRiskDegree: minRiskDegree ? parseInt(minRiskDegree, 10) : 1,
      // minRiskDegreeQuantity: minRiskDegreeQuantity
      //   ? parseInt(minRiskDegreeQuantity, 10)
      //   : 1,
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation
          .mutateAsync(submitData)
          .then((protocol) => protocolData.callback(protocol));
      } else {
        await updateMutation
          .mutateAsync(submitData)
          .then((protocol) => protocolData.callback(protocol));
      }

      onClose();
    } catch (error) {}
  };

  const isEdit = !!protocolData?.id;

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    protocolData,
    onSubmit,
    loading: false,
    control,
    handleSubmit,
    setProtocolData,
    isEdit,
    setValue,
  };
};

export type IUseEditProtocol = ReturnType<typeof useEditProtocols>;
