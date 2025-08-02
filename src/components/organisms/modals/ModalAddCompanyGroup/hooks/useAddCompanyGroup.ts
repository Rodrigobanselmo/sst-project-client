/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  IUpsertCompanyGroup,
  useMutUpsertCompanyGroup,
} from 'core/services/hooks/mutations/manager/useMutUpsertCompanyGroups';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';

import { accessGroupSchema } from '../../../../../core/utils/schemas/access-group.schema';
import { initialCompanySelectState } from '../../ModalSelectCompany';

export const initialCompanyGroupState = {
  description: '',
  name: '',
  companyId: '',
  companyGroup: undefined as ICompany | undefined,
  companies: [] as ICompany[],
  id: 0,
  blockResignationExam: true,
  numAsos: 3,
  esocialSend: undefined as boolean | undefined,
  esocialStart: undefined as Date | undefined,
  doctorResponsible: undefined as IProfessional | undefined,
  tecResponsible: undefined as IProfessional | undefined,
};

export const useAddCompanyGroup = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialCompanyGroupState);
  const { push } = useRouter();

  const { handleSubmit, control, setValue, reset, getValues } = useForm<any>({
    resolver: yupResolver(accessGroupSchema),
  });

  const upsertCompanyGroup = useMutUpsertCompanyGroup();

  const { preventUnwantedChanges } = usePreventAction();

  const [companyGroupData, setCompanyGroupData] = useState({
    ...initialCompanyGroupState,
  });

  const isEdit = !!companyGroupData.id && companyGroupData.companyGroup?.id;
  const take = 200;
  const { companies, count } = useQueryCompanies(
    1,
    { groupId: companyGroupData.id },
    take,
  );

  const moreCompanies = companies.length < count;

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialCompanyGroupState>>(
      ModalEnum.COMPANY_GROUP_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setCompanyGroupData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  useEffect(() => {
    if (companies && companies.length > 0)
      setCompanyGroupData((oldData) => {
        const newData = {
          ...oldData,
          companies,
        };

        initialDataRef.current = newData;

        return newData;
      });
  }, [companies, getModalData]);

  useEffect(() => {
    if (companyGroupData.esocialStart)
      setValue('esocialStart', companyGroupData.esocialStart);
  }, [companyGroupData, setValue]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.COMPANY_GROUP_ADD, data);
    setCompanyGroupData(initialCompanyGroupState);
    reset();
  };

  const onSubmit: SubmitHandler<{
    description: string;
    name: string;
  }> = async (data) => {
    // if (!companyGroupData?.doctorResponsible?.id) {
    //   setError('doctorResponsible', { message: 'O campo é obrigatório' });
    //   return;
    // }

    const submitData: IUpsertCompanyGroup = {
      companiesIds: companyGroupData.companies.map((company) => company.id),
      id: companyGroupData.id || undefined,
      esocialSend: companyGroupData.esocialSend,
      doctorResponsibleId: companyGroupData.doctorResponsible?.id,
      tecResponsibleId: companyGroupData.tecResponsible?.id,
      blockResignationExam: companyGroupData.blockResignationExam,
      numAsos: companyGroupData.numAsos,
      ...data,
    };

    await upsertCompanyGroup
      .mutateAsync(submitData)
      .then((data) => {
        setCompanyGroupData((dt) => ({ ...dt, ...data }));
        if (isEdit) onClose();
      })
      .catch(() => {});
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const before = { ...initialDataRef.current } as any;
    const after = { ...companyGroupData, ...values } as any;

    delete after.doctorResponsible;
    delete before.doctorResponsible;
    delete after.tecResponsible;
    delete before.tecResponsible;
    delete after.numAsos;
    delete before.numAsos;

    if (
      preventUnwantedChanges(
        JSON.stringify(before),
        JSON.stringify(after),
        onClose,
      )
    )
      return;
    onClose();
  };

  const handleOpenCompanySelect = () => {
    const onSelect = async (companies: ICompany[]) => {
      if (companyGroupData.id) {
        await upsertCompanyGroup
          .mutateAsync({
            ...companyGroupData,
            companiesIds: companies.map((company) => company.id),
          })
          .then(() => {
            setCompanyGroupData({
              ...companyGroupData,
              companies,
            });
          })
          .catch(() => {});
      } else {
        setCompanyGroupData({
          ...companyGroupData,
          companies,
        });
      }
    };

    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      multiple: true,
      onSelect,
      selected: companyGroupData.companies,
    } as Partial<typeof initialCompanySelectState>);
  };

  const handleRemoveCompany = (company: ICompany) => {
    setCompanyGroupData({
      ...companyGroupData,
      companies: companyGroupData.companies.filter((c) => c.id !== company.id),
    });
  };

  const handleOs = useCallback(() => {
    if (companyGroupData?.companyGroup?.id)
      push(
        RoutesEnum.OS.replace(
          /:companyId/g,
          companyGroupData?.companyGroup?.id,
        ),
      );
  }, [push, companyGroupData?.companyGroup?.id]);

  const handleAlerts = useCallback(() => {
    if (companyGroupData?.companyGroup?.id)
      push(
        RoutesEnum.ALERTS.replace(
          /:companyId/g,
          companyGroupData?.companyGroup?.id,
        ),
      );
  }, [push, companyGroupData?.companyGroup?.id]);

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: upsertCompanyGroup.isLoading,
    companyGroupData,
    setCompanyGroupData,
    control,
    handleSubmit,
    isEdit,
    handleOpenCompanySelect,
    handleRemoveCompany,
    moreCompanies,
    handleOs,
    handleAlerts,
    setValue,
  };
};
