/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
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
  companies: [] as ICompany[],
  id: 0,
};

export const useAddCompanyGroup = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialCompanyGroupState);

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(accessGroupSchema),
  });

  const upsertCompanyGroup = useMutUpsertCompanyGroup();

  const { preventUnwantedChanges } = usePreventAction();

  const [companyGroupData, setCompanyGroupData] = useState({
    ...initialCompanyGroupState,
  });

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

    if (initialData) {
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

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.COMPANY_GROUP_ADD, data);
    setCompanyGroupData(initialCompanyGroupState);
    reset();
  };

  const onSubmit: SubmitHandler<{ description: string; name: string }> = async (
    data,
  ) => {
    const submitData: IUpsertCompanyGroup = {
      companiesIds: companyGroupData.companies.map((company) => company.id),
      id: companyGroupData.id || undefined,
      ...data,
    };

    await upsertCompanyGroup.mutateAsync(submitData).catch(() => {});

    onClose();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...companyGroupData, ...values },
        initialDataRef.current,
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
    isEdit: !!companyGroupData.id,
    handleOpenCompanySelect,
    handleRemoveCompany,
    moreCompanies,
  };
};
