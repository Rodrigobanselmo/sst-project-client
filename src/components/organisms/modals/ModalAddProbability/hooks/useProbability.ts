/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { RiskEnum } from 'project/enum/risk.enums';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/useMutUpdateCompany';
import { useMutationCEP } from 'core/services/hooks/mutations/useMutationCep';

export const initialProbState = {
  id: '',
  riskFactorDataAfterId: '',
  riskFactorDataId: '',
  riskId: '',
  riskFactorGroupDataId: '',
  riskType: '' as RiskEnum,
  employeeCountGho: 0,
  employeeCountTotal: 0,

  intensity: '',
  intensityResult: '',
  intensityLt: '',
  minDurationJT: '',
  minDurationEO: '',
  chancesOfHappening: '',
  frequency: '',
  history: '',
  medsImplemented: '',

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate: (value: number) => {},
};

interface ISubmit {
  intensity?: number;
  intensityResult?: number;
  intensityLt?: number;
  minDurationJT?: number;
  minDurationEO?: number;
  chancesOfHappening?: number;
  frequency?: number;
  history?: number;
  medsImplemented?: number;
}

const modalName = ModalEnum.PROBABILITY_ADD;

export const useProbability = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialProbState);

  const { handleSubmit, control, reset, getValues, setValue } = useForm();

  const updateMutation = useMutUpdateCompany();
  const cepMutation = useMutationCEP();

  const { preventUnwantedChanges } = usePreventAction();

  const [probabilityData, setProbabilityData] = useState({
    ...initialProbState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialProbState>>(modalName);

    if (initialData) {
      setProbabilityData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setProbabilityData(initialProbState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...probabilityData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    // console.log(data);
    probabilityData.onCreate && probabilityData.onCreate(3);

    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    probabilityData,
    onSubmit,
    loading: updateMutation.isLoading,
    loadingCep: cepMutation.isLoading,
    control,
    handleSubmit,
    setProbabilityData,
    modalName,
    setValue,
  };
};

export type IUseProbability = ReturnType<typeof useProbability>;
