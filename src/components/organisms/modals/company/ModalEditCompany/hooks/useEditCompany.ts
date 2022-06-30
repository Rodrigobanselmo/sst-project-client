/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ActivityDto } from 'core/interfaces/api/ICompany';

export const initialCompanyState = {
  status: StatusEnum.ACTIVE,
  type: undefined as unknown as CompanyTypesEnum,
  name: '',
  responsibleName: '',
  cnpj: '',
  fantasy: '',
  logoUrl: '',
  email: '',
  description: '',
  id: '',
  size: '',
  primary_activity: [] as ActivityDto[],
  secondary_activity: [] as ActivityDto[],
  phone: '',
  riskDegree: '',
  operationTime: '',
  legal_nature: '',
  cadastral_situation: '',
  activity_start_date: '',
  cadastral_situation_date: '',
  legal_nature_code: '',
  cadastral_situation_description: '',
  address: {
    neighborhood: '',
    number: '',
    city: '',
    street: '',
    cep: '',
    complement: '',
    state: '',
  },
};

export const useEditCompany = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialCompanyState);

  const { preventUnwantedChanges } = usePreventAction();

  const [companyData, setCompanyData] = useState({
    ...initialCompanyState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialCompanyState>>(
      ModalEnum.COMPANY_EDIT,
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
    onCloseModal(ModalEnum.COMPANY_EDIT, data);
    setCompanyData(initialCompanyState);
  };

  const onCloseUnsaved = () => {
    if (preventUnwantedChanges(companyData, initialDataRef.current, onClose))
      return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    companyData,
    setCompanyData,
  };
};

export type IUseAddCompany = ReturnType<typeof useEditCompany>;
