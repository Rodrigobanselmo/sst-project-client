/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';
import { ObjectSchema } from 'yup';

import { CompanyPaymentTypeEnum } from 'core/enums/company-payment-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICnae } from 'core/interfaces/api/ICompany';
import { IContact } from 'core/interfaces/api/IContact';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useMutationCNPJ } from 'core/services/hooks/mutations/general/useMutationCnpj';
import { useMutCreateCompany } from 'core/services/hooks/mutations/manager/company/useMutCreateCompany';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';

export const initialCompanyState = {
  status: StatusEnum.ACTIVE,
  type: CompanyTypesEnum.CLINIC,
  name: '',
  responsibleName: '',
  cnpj: '',
  isConsulting: false,
  isClinic: true,
  license: {
    status: StatusEnum.ACTIVE as StatusEnum,
  },
  fantasy: '',
  logoUrl: '',
  email: '',
  description: '',
  id: '',
  size: '',
  primary_activity: [] as ICnae[],
  secondary_activity: [] as ICnae[],
  phone: '',
  riskDegree: '',
  isTaxNote: false,
  paymentDay: undefined as number | undefined,
  paymentType: '' as CompanyPaymentTypeEnum,
  observationBank: '',
  operationTime: '',
  legal_nature: '',
  cadastral_situation: '',
  activityStartDate: undefined as Date | undefined,
  cadastral_situation_date: '',
  legal_nature_code: '',
  cadastral_situation_description: '',
  blockResignationExam: true,
  numAsos: 2,
  esocialStart: undefined as Date | undefined,
  doctorResponsible: undefined as IProfessional | undefined,
  tecResponsible: undefined as IProfessional | undefined,
  responsibleNit: '',
  responsibleCpf: '',
  initials: '',
  unit: '',
  obs: '',
  stateRegistration: '',
  isSavedCreation: false,
  contacts: [] as IContact[],
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

  const updateCompany = useMutUpdateCompany();
  const createCompany = useMutCreateCompany();
  const cepMutation = useMutationCEP();
  const cnpjMutation = useMutationCNPJ();

  const { preventUnwantedChanges } = usePreventAction();

  const [companyData, setCompanyData] = useState({
    ...initialCompanyState,
  });

  const isEdit = !!companyData.id && companyData.isSavedCreation === false;

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialCompanyState>>(
      ModalEnum.CLINIC_EDIT,
    );

    if (initialData) {
      setCompanyData((oldData) => {
        const replaceData = {} as any;

        Object.keys(oldData).map((key) => {
          if (key in initialData) {
            replaceData[key] =
              (initialData as any)[key] || (initialCompanyState as any)[key];
          }
        });

        const newData = {
          ...oldData,
          ...replaceData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.CLINIC_EDIT, data);
    setCompanyData(initialCompanyState);
  };

  const onCloseUnsaved = (action?: () => void) => {
    if (preventUnwantedChanges(companyData, initialDataRef.current, onClose))
      return;
    onClose();
    action?.();
  };

  const onSubmitData = async (
    submitData: any,
    nextStep: () => void,
    { save }: { save?: boolean } = {},
  ) => {
    if (!isEdit && save && !companyData.id) {
      await createCompany
        .mutateAsync(submitData)
        .then((company) => {
          nextStep();
          setCompanyData((companyData) => ({
            ...companyData,
            ...submitData,
            ...company,
          }));
        })
        .catch(() => {});
    } else if (!isEdit) {
      nextStep();
      setCompanyData((companyData) => ({
        ...companyData,
        ...submitData,
      }));
    } else {
      await updateCompany
        .mutateAsync(submitData)
        .then(() => {
          onClose();
        })
        .catch(() => {});
    }
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    companyData,
    setCompanyData,
    createCompany,
    updateCompany,
    cepMutation,
    isEdit,
    onSubmitData,
    cnpjMutation,
    loading:
      updateCompany.isLoading ||
      createCompany.isLoading ||
      cepMutation.isLoading,
  };
};

export type IUseAddCompany = ReturnType<typeof useEditCompany>;
