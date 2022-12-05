/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { getStates } from '@brazilian-utils/brazilian-utils';

import { ICities } from 'core/interfaces/api/IUFCities';
import { GetCEPResponse } from 'core/services/hooks/mutations/general/useMutationCep/types';
import { GetCNPJResponse } from 'core/services/hooks/mutations/general/useMutationCnpj/types';
import { ICreateCat } from 'core/services/hooks/mutations/manager/cat/useMutCreateCat/useMutCreateCat';
import { useFetchQueryCities } from 'core/services/hooks/queries/useQueryCities/useQueryCities';
import { cepMask } from 'core/utils/masks/cep.mask';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import { IUseAddCat } from '../../../hooks/useAddCat';

export const useLocationData = (props: IUseAddCat) => {
  const {
    catData,
    onCloseUnsaved: onClose,
    onSubmitData,
    setCatData,
    cepMutation,
    cepRequired,
    cityUfRequired,
    countryRequired,
    cnpjMutation,
    askCompany,
  } = props;

  const {
    trigger,
    getValues,
    control,
    setError,
    reset,
    setValue,
    clearErrors,
  } = useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();
  const { fetchCities } = useFetchQueryCities();

  const fields = ['local'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const setAddress = async (data: Partial<GetCNPJResponse['address']>) => {
    let city: ICities;
    if (data) {
      if (data.neighborhood) setValue('bairro', data.neighborhood);
      if (data.cep) setValue('cep', cepMask.mask(data.cep));
      if (data.complement) setValue('complemento', data.complement);
      if (data.number) setValue('nrLograd', data.number);
      if (data.state) setValue('uf', data.state);
      if (data.street) setValue('dscLograd', data.street);
      if (data.city) {
        const result = await fetchCities({ search: data.city });
        city = result.data[0];
      }

      setCatData((oldData) => {
        const newData = {
          ...oldData,
          city,
          uf: data.state,
        };

        return newData;
      });
    }
  };

  const onChangeCep = async (value: string) => {
    if (value.replace(/\D/g, '').length === 8) {
      try {
        const data = await cepMutation.mutateAsync(value).catch(() => {});
        if (data) setAddress(data);
      } catch (error) {
        //
      }
    }
  };

  const onChangeCnpj = async (value: string) => {
    if (value.replace(/\D/g, '').length === 14) {
      try {
        const data = await cnpjMutation.mutateAsync(value).catch(() => {});
        setValue('ideLocalAcidCnpj', cnpjMask.mask(value));

        if (data) {
          setAddress(data.address);
          if (data.address?.cep) onChangeCep(data.address.cep);
        }
      } catch (error) {
        //
      }
    }
  };

  const onSubmit = async () => {
    clearErrors();
    const isValid = await trigger(fields);
    if (!isValid) return;

    const {
      cep,
      dscLograd,
      bairro,
      complemento,
      nrLograd,
      codPostal,
      dscLocal,
      ideLocalAcidCnpj,
      ideLocalAcidTpInsc,
    } = getValues();

    let error = false;
    if (!catData.tpLocal) {
      setError('tpLocal', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!dscLograd) {
      setError('dscLograd', { message: 'Campo obrigatório' });
      error = true;
    }
    if (cepRequired && !cep) {
      setError('cep', { message: 'Campo obrigatório' });
      error = true;
    }
    if (cityUfRequired && !catData.city) {
      setError('city', { message: 'Campo obrigatório' });
      error = true;
    }
    if (cityUfRequired && !catData.uf) {
      setError('uf', { message: 'Campo obrigatório' });
      error = true;
    }
    if (countryRequired && !catData.countryCodeEsocial6) {
      setError('countryCodeEsocial6', { message: 'Campo obrigatório' });
      error = true;
    }
    if (countryRequired && !codPostal) {
      setError('codPostal', { message: 'Campo obrigatório' });
      error = true;
    }
    if (askCompany && !ideLocalAcidCnpj) {
      setError('ideLocalAcidCnpj', { message: 'Campo obrigatório' });
      error = true;
    }
    if (askCompany && !catData.ideLocalAcidTpInsc) {
      setError('ideLocalAcidTpInsc', { message: 'Campo obrigatório' });
      error = true;
    }

    if (error) return;

    const submitData: Partial<ICreateCat> & { id?: number } = {
      ...catData,
      cep,
      codMunic: catData.city?.code,
      dscLograd,
      dscLocal,
      bairro,
      complemento,
      nrLograd,
      codPostal,
      pais: catData.countryCodeEsocial6?.code,
      tpLograd: catData.esocialLograd?.code,
      ideLocalAcidTpInsc,
      ideLocalAcidCnpj,
    };

    onSubmitData(submitData, nextStep);
  };

  const ufs = useMemo(() => {
    return getStates().map((state) => state.code);
  }, []);

  return {
    ...props,
    onSubmit,
    control,
    setValue,
    onCloseUnsaved,
    lastStep,
    previousStep,
    onChangeCep,
    ufs,
    onChangeCnpj,
  };
};

export type IUseLocationData = ReturnType<typeof useLocationData>;
