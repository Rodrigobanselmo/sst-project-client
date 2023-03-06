/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useMutationCNPJ } from 'core/services/hooks/mutations/general/useMutationCnpj';
import { GetCNPJResponse } from 'core/services/hooks/mutations/general/useMutationCnpj/types';
import {
  IUpdateCompany,
  useMutUpdateCompany,
} from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';
import { workspaceSchema } from 'core/utils/schemas/workspace.schema';

export const initialWorkspaceState = {
  id: '',
  status: StatusEnum.ACTIVE,
  name: '',
  description: '',
  neighborhood: '',
  number: '',
  city: '',
  street: '',
  cep: '',
  complement: '',
  state: '',
  isFromOtherCnpj: false,
  cnpj: '',
  companyJson: {} as GetCNPJResponse,
};

interface ISubmit {
  name: string;
  description: string;
  neighborhood: string;
  number: string;
  city: string;
  street: string;
  cep: string;
  complement: string;
  state: string;
}

export const useEditWorkspace = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialWorkspaceState);
  const cnpjMutation = useMutationCNPJ();

  const { handleSubmit, control, reset, getValues, setValue } = useForm({
    resolver: yupResolver(workspaceSchema),
  });

  const updateMutation = useMutUpdateCompany();
  const cepMutation = useMutationCEP();

  const { preventUnwantedChanges } = usePreventAction();

  const [companyData, setCompanyData] = useState({
    ...initialWorkspaceState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialWorkspaceState>>(
      ModalEnum.WORKSPACE_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setCompanyData((oldData) => {
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
    onCloseModal(ModalEnum.WORKSPACE_ADD, data);
    setCompanyData(initialWorkspaceState);
    reset();
  };

  const onChangeCep = async (value: string) => {
    if (value.replace(/\D/g, '').length === 8) {
      try {
        const data = await cepMutation.mutateAsync(value).catch(() => {});
        if (data)
          Object.entries(data).forEach(([key, value]) => {
            setValue(key, value);
          });

        setCompanyData((oldData) => {
          const newData = {
            ...oldData,
            ...data,
          };

          return newData;
        });
      } catch (error) {
        //
      }
    }
  };

  const onChangeCnpj = async (value: string) => {
    if (value.replace(/\D/g, '').length === 14) {
      try {
        const data = await cnpjMutation.mutateAsync(value);

        const reset = [
          'neighborhood',
          'number',
          'city',
          'street',
          'cep',
          'complement',
          'state',
        ];

        reset.forEach((key) => setValue(key, ''));
        setCompanyData((oldData) => {
          const newData = {
            ...oldData,
            ...data?.address,
            cnpj: value,
            companyJson: data || {},
          };

          return newData;
        });
      } catch (error) {
        console.error(error);
        //
      }
    }
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...companyData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    const workspace: Partial<IWorkspace> = {
      name: data.name,
      description: data.description,
      status: companyData.status,
      companyJson: companyData.companyJson || undefined,
      isOwner: !companyData.isFromOtherCnpj,
      cnpj: companyData.cnpj,
      address: {
        neighborhood: data.neighborhood,
        number: data.number,
        city: data.city,
        street: data.street,
        cep: data.cep,
        complement: data.complement,
        state: data.state,
      },
    };

    if (companyData.id) workspace.id = companyData.id;
    if (companyData.status) workspace.status = companyData.status;

    const submitData: IUpdateCompany = {
      workspace: [workspace],
    };

    await updateMutation.mutateAsync(submitData).catch(() => {});

    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    companyData,
    onSubmit,
    setValue,
    loading: updateMutation.isLoading || cnpjMutation.isLoading,
    loadingCep: cepMutation.isLoading,
    loadingCnpj: cnpjMutation.isLoading,
    control,
    handleSubmit,
    setCompanyData,
    onChangeCep,
    onChangeCnpj,
  };
};

export type IUseEditWorkspace = ReturnType<typeof useEditWorkspace>;
