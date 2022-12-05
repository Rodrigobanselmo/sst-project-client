/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { ICreateCat } from 'core/services/hooks/mutations/manager/cat/useMutCreateCat/useMutCreateCat';

import { IUseAddCat } from '../../../hooks/useAddCat';

export const useAccidentData = (props: IUseAddCat) => {
  const {
    catData,
    onCloseUnsaved: onClose,
    onSubmitData,
    isDeath,
    isShowOrigin,
    hrsWorked,
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

  const fields = ['obsCAT'];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    clearErrors();
    const isValid = await trigger(fields);
    if (!isValid) return;

    const { obsCAT } = getValues();

    let error = false;
    if (!catData.tpCat) {
      setError('tpCat', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.iniciatCAT) {
      setError('iniciatCAT', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.dtObito && isDeath) {
      setError('dtObito', { message: 'Campo obrigatório' });
      error = true;
    }
    console.log(isShowOrigin && !isDeath && !catData.catOriginId);
    if (isShowOrigin && !isDeath && !catData.catOriginId) {
      setError('catOriginId', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.dtAcid) {
      setError('dtAcid', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.hrAcid) {
      setError('hrAcid', { message: 'Campo obrigatório' });
      error = true;
    }
    if (hrsWorked && !catData.hrsTrabAntesAcid) {
      setError('hrsTrabAntesAcid', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.ultDiaTrab) {
      setError('ultDiaTrab', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.tpAcid) {
      setError('tpAcid', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.esocialSitGeradora?.code) {
      setError('esocialSitGeradora', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.esocialAgntCausador?.code) {
      setError('esocialAgntCausador', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.codParteAtingEsocial13?.code) {
      setError('codParteAtingEsocial13', { message: 'Campo obrigatório' });
      error = true;
    }
    if (catData.lateralidade == undefined) {
      setError('lateralidade', { message: 'Campo obrigatório' });
      error = true;
    }

    if (error) return;

    const submitData: Partial<ICreateCat> & { id?: number } = {
      ...catData,
      codAgntCausador: catData.esocialAgntCausador?.code,
      codParteAting: catData.codParteAtingEsocial13?.code,
      codSitGeradora: catData.esocialSitGeradora?.code,
      catOriginId: catData.catOrigin?.id,
      obsCAT,
    };

    onSubmitData(submitData, nextStep);
  };

  return {
    ...props,
    onSubmit,
    control,
    setValue,
    onCloseUnsaved,
    lastStep,
    previousStep,
    onSelectEmployee: () => null,
  };
};

export type IUseAccidentData = ReturnType<typeof useAccidentData>;
