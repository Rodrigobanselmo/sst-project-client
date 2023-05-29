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
import { useMutDeleteCompany } from 'core/services/hooks/mutations/manager/company/useMutDeleteCompany/useMutDeleteCompany';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useRouter } from 'next/router';

export const initialClinicState = {
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
  paymentType: undefined as CompanyPaymentTypeEnum | undefined,
  observationBank: '',
  operationTime: '',
  legal_nature: '',
  cadastral_situation: '',
  activity_start_date: undefined as Date | undefined,
  cadastral_situation_date: '',
  legal_nature_code: '',
  cadastral_situation_description: '',
  blockResignationExam: true,
  numAsos: 3,
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
  pgr: true,
  pcmso: true,
  esocial: true,
  schedule: true,
  cat: true,
  absenteeism: true,
};

export const useEditCompany = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { push } = useRouter();
  const initialDataRef = useRef(initialClinicState);

  const updateCompany = useMutUpdateCompany();
  const deleteCompany = useMutDeleteCompany();
  const createCompany = useMutCreateCompany({ isClinic: true });
  const cepMutation = useMutationCEP();
  const cnpjMutation = useMutationCNPJ();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [companyData, setCompanyData] = useState({
    ...initialClinicState,
  });

  const isEdit = !!companyData.id && companyData.isSavedCreation === false;

  const onDelete = () => {
    preventDelete(() =>
      deleteCompany
        .mutateAsync({ companyId: companyData.id, isClinic: true })
        .then(() => {
          onClose();
          push(RoutesEnum.CLINICS);
        }),
    );
  };

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialClinicState>>(
      ModalEnum.CLINIC_EDIT,
    );

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setCompanyData((oldData) => {
        const replaceData = {} as any;

        Object.keys(oldData).map((key) => {
          if (key in initialData) {
            replaceData[key] =
              (initialData as any)[key] || (initialClinicState as any)[key];
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
    setCompanyData(initialClinicState);
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
    onDelete,
  };
};

export type IUseAddCompany = ReturnType<typeof useEditCompany>;
