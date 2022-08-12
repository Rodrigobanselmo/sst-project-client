/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { onlyNumbers } from '@brazilian-utils/brazilian-utils';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { useSnackbar } from 'notistack';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';
import { v4 } from 'uuid';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  ICreateProfessional,
  useMutCreateProfessional,
} from 'core/services/hooks/mutations/user/professionals/useMutCreateProfessional';
import { useMutFindFirstProfessional } from 'core/services/hooks/mutations/user/professionals/useMutGetProfessionals';
import { useMutUpdateProfessional } from 'core/services/hooks/mutations/user/professionals/useMutUpdateProfessional';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { professionalSchema } from 'core/utils/schemas/professional.schema';

export const initialProfessionalState = {
  id: 0,
  token: '',
  name: '',
  cpf: '',
  phone: '',
  email: '',
  userId: 0,
  councilType: '',
  councilUF: '',
  councilId: '',
  sendEmail: false,
  crm: '',
  crea: '',
  companyId: '',
  certifications: [] as string[],
  formation: [] as string[],
  type: '' as ProfessionalTypeEnum,
  status: StatusEnum.ACTIVE,
  isClinic: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (professional: IProfessional | null) => {},
};

interface ISubmit {
  name: string;
  companyId: string;
  cpf: string;
  phone: string;
  email: string;
  type: ProfessionalTypeEnum;
  councilType: string;
  councilUF: string;
  councilId: string;
  crm: string;
  crea: string;
}

export const useEditProfessionals = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal } = useModal();
  const { user } = useGetCompanyId();

  const { data: company } = useQueryCompany();
  const { data: userCompany } = useQueryCompany(user?.companyId);

  const { handleSubmit, setValue, setError, control, reset, getValues } =
    useForm({
      resolver: yupResolver(professionalSchema),
    });

  const createMutation = useMutCreateProfessional();
  const updateMutation = useMutUpdateProfessional();
  const findFirstMutation = useMutFindFirstProfessional();

  const { preventUnwantedChanges } = usePreventAction();

  const initialDataRef = useRef(initialProfessionalState);
  const [professionalData, setProfessionalData] = useState({
    ...initialProfessionalState,
  });

  const companies = removeDuplicate([userCompany, company], {
    removeById: 'id',
  });

  const isManyCompanies = companies.length > 1;

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialProfessionalState>>(
      ModalEnum.PROFESSIONALS_ADD,
    );

    if (initialData) {
      setProfessionalData((oldData) => {
        const newData = {
          ...oldData,
          token: v4(),
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [company, getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.PROFESSIONALS_ADD, data);
    setProfessionalData(initialProfessionalState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        cleanObjectValues({ ...professionalData, ...values }),
        cleanObjectValues(initialDataRef.current),
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    if (
      [ProfessionalTypeEnum.DOCTOR, ProfessionalTypeEnum.ENGINEER].includes(
        professionalData.type,
      ) &&
      (!data.councilType || !data.councilId || !professionalData.councilUF)
    ) {
      if (!data.councilType)
        setError('councilType', { message: 'campo obrigatório' });
      if (!data.councilId) setError('councilId', { message: 'obrigatório' });
      if (!professionalData.councilUF)
        setError('councilUF', { message: 'campo obrigatório' });
      return;
    }

    //? select company
    // if (!professionalData.id && isManyCompanies && !data.companyId) {
    //   setError('companyId', { message: 'Selecione uma empresa' });
    //   enqueueSnackbar('Selecione uma empresa', { variant: 'error' });
    //   return;
    // }

    const submitData: ICreateProfessional & { id?: number } = {
      ...data,
      id: professionalData.id,
      certifications: professionalData.certifications,
      formation: professionalData.formation,
      status: professionalData.status,
      councilUF: professionalData.councilUF,
      ...(data.companyId && {
        companyId: data.companyId,
      }),
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation
          .mutateAsync(submitData)
          .then((professional) => professionalData.callback(professional));
      } else {
        await updateMutation
          .mutateAsync(submitData)
          .then((professional) => professionalData.callback(professional));
      }

      onClose();
    } catch (error) {}
  };

  const onGetProfessional = async ({ cpf }: any) => {
    const setValues = (data: IProfessional | null) => {
      if (!data) return;
      console.log(data);
      setValue('name', data?.name);
      setValue('phone', data?.phone);
      setValue('email', data?.email);
      setValue('councilType', data?.councilType);
      setValue('councilUF', data?.councilUF);
      setValue('councilId', data?.councilId);
      setValue('type', data?.type);
      setValue('cpf', cpfMask.mask(data?.cpf));

      setProfessionalData((oldData) => ({
        ...oldData,
        ...(councilUF && { councilUF: data.councilUF }),
        ...(data.userId && { userId: data.userId }),
      }));
    };

    if (cpf && cpf.length >= 14) {
      const data = await findFirstMutation
        .mutateAsync({ cpf: onlyNumbers(cpf) })
        .catch(() => null);

      return setValues(data);
    }

    if (cpf) return;

    const councilType = getValues('councilType');
    const councilUF = professionalData.councilUF;
    const councilId = getValues('councilId');

    if (councilType && councilUF && councilId) {
      const data = await findFirstMutation
        .mutateAsync({
          councilId,
          councilUF,
          councilType,
        })
        .catch(() => null);

      if (data?.id) return setValues(data);
    }
  };

  const getUrl = window.location;
  const baseUrl = getUrl.protocol + '//' + getUrl.host;

  const link = `${baseUrl}${RoutesEnum.SIGN_UP}/?token=${professionalData.token}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    enqueueSnackbar('Link copiado com sucesso', { variant: 'success' });
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    professionalData,
    onSubmit,
    loading: updateMutation.isLoading || createMutation.isLoading,
    control,
    handleSubmit,
    setProfessionalData,
    setValue,
    companies,
    isManyCompanies,
    onGetProfessional,
    handleCopy,
    link,
  };
};

export type IUseEditProfessional = ReturnType<typeof useEditProfessionals>;
