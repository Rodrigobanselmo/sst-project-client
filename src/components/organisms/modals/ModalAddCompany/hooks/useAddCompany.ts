/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutCreateCompany } from 'core/services/hooks/mutations/company/useMutCreateCompany';
import { companySchema } from 'core/utils/schemas/company.schema';

export const initialCompanyState = {
  status: StatusEnum.ACTIVE,
  type: undefined as unknown as CompanyTypesEnum,
  name: '',
  cnpj: '',
  fantasy: '',
  description: '',
  id: '',
};

export const useAddCompany = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialCompanyState);

  const createCompany = useMutCreateCompany();
  const updateCompany = useMutCreateCompany();

  const { preventUnwantedChanges } = usePreventAction();

  const [companyData, setCompanyData] = useState({
    ...initialCompanyState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialCompanyState>>(
      ModalEnum.COMPANY_ADD,
    );

    if (initialData) {
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
    onCloseModal(ModalEnum.COMPANY_ADD, data);
    setCompanyData(initialCompanyState);
    // reset();
  };

  const onSubmit: SubmitHandler<{
    name: string;
    description: string;
    fantasy: string;
    cnpj: string;
    type: CompanyTypesEnum;
  }> = async (data) => {
    const submitData = {
      status: companyData.status,
      ...data,
    };

    if (companyData.id == '') {
      await createCompany.mutateAsync(submitData);
    } else {
      await updateCompany.mutateAsync(submitData);
    }

    onClose();
  };

  const onCloseUnsaved = () => {
    if (preventUnwantedChanges(companyData, initialDataRef.current, onClose))
      return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: createCompany.isLoading || updateCompany.isLoading,
    companyData,
    setCompanyData,
  };
};

export type IUseAddCompany = ReturnType<typeof useAddCompany>;
