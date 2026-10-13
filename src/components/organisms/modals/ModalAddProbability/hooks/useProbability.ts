/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { RiskEnum } from 'project/enum/risk.enums';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';
import { useQueryHierarchy } from 'core/services/hooks/queries/useQueryHierarchy';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

import { useApplicableJourneys } from '../use-applicable-journeys';
import {
  classifyMedsImplemented,
  criteriaFromForm,
  journeyMinutesForModalOpen,
  ProbabilityEstimateResult,
  probabilityModalOpenState,
  QualitativeProbabilityCriteria,
  qualitativeProbabilityFromCriteria,
  RealControlLists,
} from '../qualitative-probability.util';

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
  homogeneousGroupId: '',
  adoptedCriteria: null as QualitativeProbabilityCriteria | null,
  controls: null as RealControlLists | null,
  probabilityAuthority: null as 'SHARED' | 'WORKSPACE' | null,
  probabilityOrigin: null as 'ESTIMATE' | 'MANUAL' | 'PROMOTION' | null,

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate: (_value: ProbabilityEstimateResult) => {},
};

interface ISubmit {
  employeeCountTotal?: number | string;
  employeeCountGho?: number | string;
  minDurationJT?: number | string;
  minDurationEO?: number | string;
  chancesOfHappening?: number | string;
  frequency?: number | string;
  history?: number | string;
  medsImplemented?: number | string;
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
  const journeys = useApplicableJourneys({
    hierarchyId: probabilityData.hierarchyId || undefined,
    homogeneousGroupId: probabilityData.homogeneousGroupId || undefined,
  });

  useEffect(() => {
    const minutes = journeyMinutesForModalOpen({
      adopted: probabilityData.adoptedCriteria,
      suggestedMinutes: journeys.ready ? journeys.suggestedMinutes : null,
    });
    if (probabilityData.adoptedCriteria || minutes == null) return;
    const current = getValues('minDurationJT');
    if (current !== '' && current != null) return;
    setValue('minDurationJT', minutes);
  }, [
    getValues,
    journeys.ready,
    journeys.suggestedMinutes,
    probabilityData.adoptedCriteria,
    setValue,
  ]);

  useEffect(() => {
    if (probabilityData.adoptedCriteria) return;
    if (hierarchy?.employeesCount) {
      setProbabilityData((oldData) => {
        return {
          ...oldData,
          employeeCountGho: hierarchy.employeesCount || 0,
        };
      });

      setValue('employeeCountGho', hierarchy.employeesCount);
    }
  }, [hierarchy, probabilityData.adoptedCriteria, setValue]);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialProbState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      const openState = probabilityModalOpenState({
        adoptedCriteria: initialData.adoptedCriteria,
        controls: initialData.controls,
        employeeCountTotal: initialData.employeeCountTotal,
        employeeCountGho: initialData.employeeCountGho,
      });
      if (Object.keys(openState.formValues).length) {
        reset(openState.formValues);
      }

      setProbabilityData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
          ...openState.dataPatch,
          adoptedCriteria: openState.adoptedCriteria,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, reset]);

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

  const onSubmit: SubmitHandler<ISubmit> = async (values) => {
    const criteria = criteriaFromForm(values);
    const result = qualitativeProbabilityFromCriteria(criteria);

    if (result) {
      probabilityData.onCreate?.({ probability: result, criteria });
    }

    onClose();
  };

  const suggestedMedsImplemented = probabilityData.controls
    ? classifyMedsImplemented(probabilityData.controls)
    : null;

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
    journeyStatus: journeys.ready ? journeys.status : 'DESCONHECIDO',
    journeyOptions: journeys.ready ? journeys.options : [],
    knownJourneyCount: journeys.ready ? journeys.knownJourneyCount : 0,
    coveredEmployeeCount: journeys.ready ? journeys.coveredEmployeeCount : 0,
    suggestedMedsImplemented,
  };
};

export type IUseProbability = ReturnType<typeof useProbability>;
