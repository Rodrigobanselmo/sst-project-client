/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useMemo } from 'react';
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
import {
  IProfessional,
  IProfessionalCouncil,
} from 'core/interfaces/api/IProfessional';
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
  inviteId: '',
  name: '',
  cpf: '',
  phone: '',
  email: '',
  userId: 0,
  councilType: '',
  councilUF: '',
  councilId: '',
  simpleAdd: false,
  docOnly: false,
  sendEmail: false,
  companyId: '',
  certifications: [] as string[],
  formation: [] as string[],
  councils: [] as IProfessionalCouncil[],
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

  const companies = useMemo(() => {
    return removeDuplicate([userCompany, company], {
      removeById: 'id',
    });
  }, [userCompany, company]);

  const isManyCompanies = companies.length > 1;

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialProfessionalState>>(
      ModalEnum.PROFESSIONALS_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setProfessionalData((oldData) => {
        const newData = {
          ...oldData,
          inviteId: v4(),
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

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
      professionalData.councils.length === 0
    ) {
      setError('councilType', { message: 'campo obrigatório' });
      setError('councilId', { message: 'obrigatório' });
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
      councils: professionalData.councils,
      certifications: professionalData.certifications,
      formation: professionalData.formation,
      status: professionalData.status,
      inviteId: professionalData.inviteId,
      sendEmail: professionalData.sendEmail,
      ...(!!professionalData.userId && {
        userId: professionalData.userId,
      }),
      ...(data.companyId && {
        companyId: data.companyId,
      }),
      ...(professionalData.companyId && {
        companyId: professionalData.companyId,
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

  const onGetProfessional = async ({
    cpf,
    email,
    councilType,
    councilUF,
    councilId,
  }: any) => {
    const setValues = (data: IProfessional | null) => {
      if (!data?.id) return;
      setValue('name', data?.name);
      setValue('phone', data?.phone);
      setValue('email', data?.email);
      setValue('type', data?.type);
      setValue('cpf', cpfMask.mask(data?.cpf));

      setProfessionalData((oldData) => ({
        ...oldData,
        ...(data?.type && { type: data.type }),
        ...(data.userId && { userId: data.userId }),
        ...(data.councils &&
          data.councils.length && { councils: data.councils }),
      }));
    };

    if (cpf && cpf.length >= 14) {
      const data = await findFirstMutation
        .mutateAsync({ cpf: onlyNumbers(cpf) })
        .catch(() => null);

      return setValues(data);
    }

    if (cpf !== undefined) return;

    if (email && email.length >= 3) {
      const data = await findFirstMutation
        .mutateAsync({ email })
        .catch(() => null);

      return setValues(data);
    }

    if (email !== undefined) return;

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

  const onAddCouncil = (value: Partial<IProfessionalCouncil>) => {
    onGetProfessional(value);

    setProfessionalData({
      ...professionalData,
      councils: [...(professionalData?.councils || []), value as any],
    });
  };

  const onDeleteCouncil = (value: Partial<IProfessionalCouncil>) => {
    setProfessionalData({
      ...professionalData,
      councils: (professionalData?.councils || []).filter(
        (c) =>
          !(
            c.councilId === value.councilId &&
            c.councilType === value.councilType &&
            c.councilUF === value.councilUF
          ),
      ),
    });
  };

  const getUrl = window.location;
  const baseUrl = getUrl.protocol + '//' + getUrl.host;

  const link = `${baseUrl}${RoutesEnum.SIGN_UP}/?token=${professionalData.inviteId}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    enqueueSnackbar('Link copiado com sucesso', { variant: 'success' });
  };

  const getCouncilValue = () => {
    if (professionalData.type === ProfessionalTypeEnum.ENGINEER) return 'CREA';
    else if (professionalData.type === ProfessionalTypeEnum.NURSE)
      return 'COREN';
    else if (professionalData.type === ProfessionalTypeEnum.DOCTOR)
      return 'CRM';
    else if (professionalData.type === ProfessionalTypeEnum.DENTIST)
      return 'CRO';

    return '';
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
    isEdit: professionalData?.id,
    userFound: professionalData?.userId,
    onAddCouncil,
    onDeleteCouncil,
    getCouncilValue,
  };
};

export type IUseEditProfessional = ReturnType<typeof useEditProfessionals>;
