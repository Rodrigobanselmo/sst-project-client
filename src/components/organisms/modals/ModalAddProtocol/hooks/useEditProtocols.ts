/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProtocol } from 'core/interfaces/api/IProtocol';
import {
  ICreateProtocol,
  useMutCreateProtocol,
} from 'core/services/hooks/mutations/checklist/protocols/useMutCreateProtocol/useMutCreateProtocol';
import { useMutUpdateProtocol } from 'core/services/hooks/mutations/checklist/protocols/useMutUpdateProtocol/useMutUpdateProtocol';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  cleanObjectNullValues,
  cleanObjectValues,
} from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { protocolSchema } from 'core/utils/schemas/protocol.schema';

export const initialProtocolState = {
  id: 0,
  name: '',
  companyId: '',
  status: StatusEnum.ACTIVE,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (protocol: IProtocol | null) => {},
};

interface ISubmit {
  name: string;
}

const modalName = ModalEnum.PROTOCOLS_ADD;

export const useEditProtocols = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const { user } = useGetCompanyId();

  const { data: company } = useQueryCompany();
  const { data: userCompany } = useQueryCompany(user?.companyId);

  const { handleSubmit, setValue, setError, control, reset, getValues } =
    useForm({
      resolver: yupResolver(protocolSchema),
    });

  const createMutation = useMutCreateProtocol();
  const updateMutation = useMutUpdateProtocol();

  const { preventUnwantedChanges } = usePreventAction();

  const initialDataRef = useRef(initialProtocolState);
  const [protocolData, setProtocolData] = useState({
    ...initialProtocolState,
  });

  const companies = removeDuplicate([userCompany, company], {
    removeById: 'id',
  });

  const isManyCompanies = companies.length > 1;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialProtocolState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setProtocolData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [company, getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setProtocolData(initialProtocolState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        cleanObjectValues({ ...protocolData, ...values }),
        cleanObjectValues(initialDataRef.current),
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const submitData: ICreateProtocol & { id?: number } = {
      ...data,
      companyId: protocolData.companyId,
      id: protocolData.id,
      status: protocolData.status,
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

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    protocolData,
    onSubmit,
    loading: updateMutation.isLoading || createMutation.isLoading,
    control,
    handleSubmit,
    setProtocolData,
    setValue,
    companies,
    isManyCompanies,
    modalName,
  };
};

export type IUseEditProtocol = ReturnType<typeof useEditProtocols>;
