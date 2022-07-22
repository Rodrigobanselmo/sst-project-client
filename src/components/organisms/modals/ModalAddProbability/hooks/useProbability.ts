/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { RiskEnum } from 'project/enum/risk.enums';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/useMutUpdateCompany';
import { useQueryHierarchy } from 'core/services/hooks/queries/useQueryHierarchy';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

export const initialProbState = {
  id: '',
  riskFactorDataAfterId: '',
  riskFactorDataId: '',
  riskId: '',
  riskFactorGroupDataId: '',
  riskType: '' as RiskEnum,
  employeeCountGho: 0,
  employeeCountTotal: 0,

  minDurationJT: '',
  minDurationEO: '',
  chancesOfHappening: '',
  frequency: '',
  history: '',
  medsImplemented: '',

  hierarchyId: '',

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate: (value: number) => {},
};

interface ISubmit {
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

  const { data: hierarchy, isLoading: hierarchyLoading } = useQueryHierarchy(
    probabilityData.hierarchyId,
  );

  useEffect(() => {
    if (hierarchy?.employeesCount) {
      setProbabilityData((oldData) => {
        return {
          ...oldData,
          employeeCountGho: hierarchy.employeesCount || 0,
        };
      });

      setValue('employeeCountGho', hierarchy.employeesCount);
    }
  }, [hierarchy, setValue]);

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

    const beforeObject = cleanObjectValues({
      ...probabilityData,
      ...cleanObjectValues(values),
    });
    const afterObject = cleanObjectValues(initialDataRef.current);

    if (preventUnwantedChanges(afterObject, beforeObject, onClose)) return;
    onClose();
  };

  const percentageCheck = (value: number, limit: number) => {
    if (!value || !limit) return 0;

    const stage = value / limit;
    if (stage < 0.1) return 1;
    if (stage < 0.25) return 2;
    if (stage < 0.5) return 3;
    if (stage < 1) return 4;
    return 5;
  };

  const onSubmit: SubmitHandler<ISubmit> = async ({
    frequency,
    history,
    chancesOfHappening,
    medsImplemented,
    minDurationEO,
    minDurationJT,
  }) => {
    // eslint-disable-next-line prettier/prettier
    const probabilities = [frequency, history, chancesOfHappening, medsImplemented];

    if (probabilityData.employeeCountGho && probabilityData.employeeCountTotal)
      // eslint-disable-next-line prettier/prettier
      probabilities.push(percentageCheck(probabilityData.employeeCountGho, probabilityData.employeeCountTotal),
      );

    if (minDurationEO && minDurationJT)
      probabilities.push(percentageCheck(minDurationEO, minDurationJT));

    const finalProbabilities = probabilities.filter((value) => value);

    if (finalProbabilities.length) {
      const result =
        (finalProbabilities as number[]).reduce(
          (acc, curr) => Number(acc) + Number(curr),
          0,
        ) / finalProbabilities.length;

      if (result)
        probabilityData.onCreate && probabilityData.onCreate(Math.ceil(result));
    }

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
    hierarchyLoading,
  };
};

export type IUseProbability = ReturnType<typeof useProbability>;
