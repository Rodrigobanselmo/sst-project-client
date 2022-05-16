/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

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

export type IUseAddCompany = ReturnType<typeof useAddCompany>;
