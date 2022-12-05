/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { ICreateCat } from 'core/services/hooks/mutations/manager/cat/useMutCreateCat/useMutCreateCat';

import { IUseAddCat } from '../../../hooks/useAddCat';

export const useDoctorData = (props: IUseAddCat) => {
  const { catData, onCloseUnsaved: onClose, onSubmitData } = props;

  const {
    trigger,
    getValues,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
  } = useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();

  const fields: string[] = [];

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

    const { observacao, diagProvavel, dscCompLesao, durTrat } = getValues();

    let error = false;
    if (!catData.dtAtendimento) {
      setError('dtAtendimento', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.hrAtendimento) {
      setError('hrAtendimento', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.esocialLesao?.code) {
      setError('esocialLesao', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.cid?.cid) {
      setError('cid', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!catData.doc?.id) {
      setError('doc', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!durTrat) {
      setError('durTrat', { message: 'Campo obrigatório' });
      error = true;
    }

    if (error) return;

    const submitData: Partial<ICreateCat> & { id?: number } = {
      ...catData,
      docId: catData?.doc?.id || catData.docId,
      codCID: catData.cid?.cid || catData.codCID,
      dscLesao: catData.esocialLesao?.code,
      observacao,
      diagProvavel,
      dscCompLesao,
      durTrat,
    };

    onSubmitData(submitData, nextStep, { save: true });
  };

  return {
    ...props,
    onSubmit,
    control,
    setValue,
    onCloseUnsaved,
    lastStep,
    previousStep,
  };
};

export type IUseDoctorData = ReturnType<typeof useDoctorData>;
