/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { GiConsoleController } from 'react-icons/gi';
import { useWizard } from 'react-use-wizard';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  isAbsObservation,
  isAbsTraffic,
} from 'core/interfaces/api/IAbsenteeism';
import {
  ICreateAbsenteeism,
  useMutCreateAbsenteeism,
} from 'core/services/hooks/mutations/manager/absenteeism/useMutCreateAbsenteeism/useMutCreateAbsenteeism';
import { useMutDeleteAbsenteeism } from 'core/services/hooks/mutations/manager/absenteeism/useMutDeleteAbsenteeism/useMutDeleteAbsenteeism';
import { useMutUpdateAbsenteeism } from 'core/services/hooks/mutations/manager/absenteeism/useMutUpdateAbsenteeism/useMutUpdateAbsenteeism';
import { useQueryAbsenteeism } from 'core/services/hooks/queries/useQueryAbsenteeism/useQueryAbsenteeism';
import { useQueryAbsenteeismMotives } from 'core/services/hooks/queries/useQueryAbsenteeismMotives/useQueryAbsenteeismMotives';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';
import { useQueryEsocial18Tables } from 'core/services/hooks/queries/useQueryEsocial18/useQueryEsocial18';

import { IEmployee } from '../../../../../../../core/interfaces/api/IEmployee';
import { absenteeismSchema } from '../../../../../../../core/utils/schemas/absenteeism.schema';
import { IUseAddAbsenteeism } from '../../../hooks/useAddAbsenteeism';
import { SModalSubmitAbsenteeismProps } from '../../../types';

export const useDoctorData = (props: IUseAddAbsenteeism) => {
  const { absenteeismData, onCloseUnsaved: onClose, onSubmitData } = props;

  const { trigger, getValues, control, reset, setValue, clearErrors } =
    useFormContext();
  const { nextStep, stepCount, goToStep, previousStep } = useWizard();

  const fields = ['local'];

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

    const { local } = getValues();

    // let error = false;
    // if (!absenteeismData.startDate) {
    //   setError('startDate', { message: 'Campo obrigatório' });
    //   error = true;
    // }

    // if (error) return;

    const submitData: ICreateAbsenteeism & { id?: number } = {
      ...(absenteeismData as any),
      docId: absenteeismData?.doc?.id || absenteeismData.docId,
      cidId: absenteeismData.cid?.cid || absenteeismData.cidId,
      local,
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
  };
};

export type IUseDoctorData = ReturnType<typeof useDoctorData>;
