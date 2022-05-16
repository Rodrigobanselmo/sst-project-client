/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useMutCreateCompany } from 'core/services/hooks/mutations/company/useMutCreateCompany';

import { IUseAddCompany } from '../../../hooks/useAddCompany';

export const useGetCNPJ = ({ setCompanyData }: IUseAddCompany) => {
  const { trigger, getValues, control } = useFormContext();
  const { nextStep } = useWizard();

  const createCompany = useMutCreateCompany();
  const updateCompany = useMutCreateCompany();

  const fields = ['cnpj'];

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { cnpj } = getValues();
      nextStep();
      setCompanyData((state) => ({
        ...state,
        cnpj,
      }));
    }
  };

  return {
    onSubmit,
    loading: createCompany.isLoading || updateCompany.isLoading,
    control,
  };
};
