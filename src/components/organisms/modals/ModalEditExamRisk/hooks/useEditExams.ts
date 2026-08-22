/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';

import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IExam, IExamRiskData, IExamToRisk } from 'core/interfaces/api/IExam';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  ICreateExamRisk,
  useMutCreateExamRisk,
} from 'core/services/hooks/mutations/checklist/exams/useMutCreateExamRisk/useMutCreateExamRisk';
import { useMutUpdateExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutUpdateExamRisk/useMutUpdateExamRisk';
import { resolveExamRiskMinDegreesOnSubmit } from 'core/utils/helpers/examRiskDegreeSubmit.util';
import { examRiskSchema } from 'core/utils/schemas/exam.schema';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';
import { refetchExamRiskLinkStatusQueries } from '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { RiskEnum } from 'project/enum/risk.enums';
import { useSnackbar } from 'notistack';
import { useMutDeleteExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutDeleteExamRisk/useMutDeleteExamRisk';
import type {
  RiskFactorEquivalencePayload,
  SystemRiskSearchItem,
} from '@v2/services/risk-factor-equivalence/risk-factor-equivalence.types';
import {
  enrichRiskWithSystemFlag,
  requiresEquivalenceForPublish,
} from '../utils/risk-system-flag.util';
import {
  getExamRiskEditorSnapshot,
  isExamRiskEditorDirty,
} from './exam-risk-editor-dirty';

export const initialExamRiskState = {
  id: 0,
  examId: 0 as number,
  minRiskDegree: 0 as number,
  minRiskDegreeQuantity: 1 as number,
  riskId: '' as string,
  isAll: false,
  isMale: true,
  isFemale: true,
  isPeriodic: true,
  isChange: true,
  isAdmission: true,
  isReturn: false,
  isDismissal: true,
  validityInMonths: undefined as number | undefined,
  lowValidityInMonths: undefined as number | undefined,
  considerBetweenDays: undefined as number | undefined,
  fromAge: undefined as number | undefined,
  toAge: undefined as number | undefined,
  risk: {} as IRiskFactors,
  exam: {} as IExam,
  error: {
    risk: false,
    exam: false,
  },
  publishAsSystemRule: true,
  equivalenceType: 'SEMANTIC_ALIAS' as RiskFactorEquivalencePayload['equivalenceType'],
  selectedCanonicalRisk: null as SystemRiskSearchItem | null,
  existingEquivalence: null as {
    canonicalRiskId: string;
    canonicalLabel: string;
  } | null,
  riskIsCatalogForPublish: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (exam: Partial<IExamToRisk> | null) => {},
};

interface ISubmit {
  validityInMonths: string;
  lowValidityInMonths: string;
  considerBetweenDays: string;
  fromAge: string;
  toAge: string;
  minRiskDegree: string;
  minRiskDegreeQuantity: string;
}

export const useEditExams = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(
    getExamRiskEditorSnapshot(initialExamRiskState as any),
  );
  const hydratedExamKeyRef = useRef('');
  const switchRef = useRef<HTMLInputElement>(null);
  const { companyId, userCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const { isMasterAdmin } = usePermissionsAccess();

  const { handleSubmit, control, setValue, reset, getValues, clearErrors, trigger, watch } =
    useForm<any>({
      resolver: yupResolver(examRiskSchema),
      defaultValues: { isPeriodic: initialExamRiskState.isPeriodic },
    });

  const { preventDiscardIf, preventDelete } = usePreventAction();
  const saveIntentRef = useRef<'stay' | 'exit'>('exit');

  const [examData, setExamData] = useState({
    ...initialExamRiskState,
  });

  const createMutation = useMutCreateExamRisk();
  const updateMutation = useMutUpdateExamRisk();
  const deleteMutation = useMutDeleteExamRisk();

  const loading =
    createMutation.isLoading ||
    updateMutation.isLoading ||
    deleteMutation.isLoading;

  const refetchExamsRiskList = async () => {
    await queryClient.refetchQueries([QueryEnum.EXAMS_RISK]);
    await refetchExamRiskLinkStatusQueries();
  };

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialExamRiskState>>(
      ModalEnum.EXAM_RISK,
    );

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      const hydrateKey = `${initialData.id ?? 0}:${initialData.examId ?? ''}:${
        initialData.riskId ?? ''
      }`;
      if (hydratedExamKeyRef.current === hydrateKey) return;
      hydratedExamKeyRef.current = hydrateKey;

      setExamData((oldData) => {
        const mergedRisk = initialData.risk
          ? enrichRiskWithSystemFlag(initialData.risk as IRiskFactors)
          : oldData.risk;

        const newData = {
          ...oldData,
          ...initialData,
          ...(mergedRisk ? { risk: mergedRisk } : {}),
          publishAsSystemRule: initialData.id
            ? false
            : initialData.publishAsSystemRule ?? true,
          ...(initialData.id
            ? {
                selectedCanonicalRisk: null,
                existingEquivalence: null,
                equivalenceType: 'SEMANTIC_ALIAS' as const,
                riskIsCatalogForPublish: false,
              }
            : {}),
        };

        initialDataRef.current = getExamRiskEditorSnapshot(newData as any, {
          isPeriodic: newData.isPeriodic,
          validityInMonths: newData.validityInMonths,
          lowValidityInMonths: newData.lowValidityInMonths,
          considerBetweenDays: newData.considerBetweenDays,
          fromAge: newData.fromAge,
          toAge: newData.toAge,
          minRiskDegree: newData.minRiskDegree,
          minRiskDegreeQuantity: newData.minRiskDegreeQuantity,
        });

        return newData;
      });
    }
  }, [getModalData]);

  useEffect(() => {
    setValue('isPeriodic', examData.isPeriodic);
  }, [examData.isPeriodic, setValue]);

  const onClose = (data?: any) => {
    saveIntentRef.current = 'exit';
    onCloseModal(ModalEnum.EXAM_RISK, data);
    setExamData(initialExamRiskState);
    reset();
    hydratedExamKeyRef.current = '';
    initialDataRef.current = getExamRiskEditorSnapshot(
      initialExamRiskState as any,
    );
  };

  const formValues = watch();
  const isDirty = isExamRiskEditorDirty(
    examData as any,
    formValues,
    initialDataRef.current,
  );

  const setSaveIntent = (intent: 'stay' | 'exit') => {
    saveIntentRef.current = intent;
  };

  const onCloseUnsaved = () => {
    if (loading) return;

    const values = getValues();
    const dirty = isExamRiskEditorDirty(
      examData as any,
      values,
      initialDataRef.current,
    );
    if (preventDiscardIf(dirty, onClose)) return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async ({
    fromAge,
    toAge,
    validityInMonths,
    lowValidityInMonths,
    minRiskDegree,
    minRiskDegreeQuantity,
    considerBetweenDays,
  }) => {
    let riskId = examData.riskId;
    if (!examData.riskId) {
      if (!examData.isAll) {
        setExamData((oldData) => ({
          ...oldData,
          error: { ...oldData.error, risk: true },
        }));
        return;
      }

      const risks =
        queryClient.getQueryData<IRiskFactors[]>([
          QueryEnum.RISK,
          userCompanyId,
        ]) ||
        queryClient.getQueryData<IRiskFactors[]>([QueryEnum.RISK, companyId]) ||
        [];

      const riskAllId =
        risks.find((risk) => risk.representAll && risk.type == RiskEnum.OUTROS)
          ?.id || '';

      if (!riskAllId) {
        enqueueSnackbar('Não foi possível encontrar o risco', {
          variant: 'error',
        });
        return;
      }

      riskId = riskAllId;
    }

    if (!examData.examId) {
      setExamData((oldData) => ({
        ...oldData,
        error: { ...oldData.error, exam: true },
      }));
      return;
    }

    const requiresCanonicalForPublish =
      isMasterAdmin &&
      examData.publishAsSystemRule &&
      examData.riskId &&
      !examData.isAll &&
      requiresEquivalenceForPublish({
        risk: examData.risk,
        riskIsCatalogForPublish: examData.riskIsCatalogForPublish,
        existingEquivalence: examData.existingEquivalence,
      });

    if (requiresCanonicalForPublish && !examData.selectedCanonicalRisk?.id) {
      enqueueSnackbar(
        'Selecione um fator de risco do catálogo SimpleSST para publicar na Biblioteca, ou desmarque a publicação da regra padrão.',
        { variant: 'warning' },
      );
      return;
    }

    const submitData: ICreateExamRisk & { id?: number } = {
      ...examData,
      riskId,
      realCompanyId: companyId,
      ...(isMasterAdmin &&
      examData.publishAsSystemRule &&
      examData.riskId &&
      !examData.isAll
        ? {
            publishAsSystemRule: true,
            ...(requiresEquivalenceForPublish({
              risk: examData.risk,
              riskIsCatalogForPublish: examData.riskIsCatalogForPublish,
              existingEquivalence: examData.existingEquivalence,
            }) &&
            examData.selectedCanonicalRisk?.id
              ? {
                  riskFactorEquivalence: {
                    canonicalRiskId: examData.selectedCanonicalRisk.id,
                    equivalenceType: examData.equivalenceType,
                  },
                }
              : {}),
          }
        : {}),
      fromAge: fromAge ? parseInt(fromAge, 10) : null,
      toAge: toAge ? parseInt(toAge, 10) : null,
      validityInMonths: validityInMonths
        ? parseInt(validityInMonths, 10)
        : null,
      lowValidityInMonths: lowValidityInMonths
        ? parseInt(lowValidityInMonths, 10)
        : null,
      considerBetweenDays: considerBetweenDays
        ? parseInt(considerBetweenDays, 10)
        : null,
      ...resolveExamRiskMinDegreesOnSubmit({
        minRiskDegree,
        minRiskDegreeQuantity,
        storedMinRiskDegree: examData.minRiskDegree,
        storedMinRiskDegreeQuantity: examData.minRiskDegreeQuantity,
        risk: examData.risk,
      }),
    };

    try {
      let savedExam: Partial<IExamToRisk> | null = null;
      if (!submitData.id) {
        delete submitData.id;
        const exam = await createMutation.mutateAsync(submitData);
        if ((exam as any)?.systemRule) {
          const systemRule = (exam as any).systemRule;
          if (systemRule.action === 'created') {
            enqueueSnackbar('Regra padrão publicada na Biblioteca Risco × Exame.', {
              variant: 'info',
            });
          } else if (systemRule.action === 'alreadyExists') {
            enqueueSnackbar(
              systemRule.reason ||
                'Regra padrão já existente na Biblioteca para este agente e exame.',
              { variant: 'info' },
            );
          } else if (systemRule.action === 'skipped' && systemRule.reason) {
            enqueueSnackbar(systemRule.reason, { variant: 'warning' });
          } else if (systemRule.reason) {
            enqueueSnackbar(systemRule.reason, { variant: 'warning' });
          }
        } else if (
          isMasterAdmin &&
          examData.publishAsSystemRule &&
          requiresEquivalenceForPublish({
            risk: examData.risk,
            riskIsCatalogForPublish: examData.riskIsCatalogForPublish,
            existingEquivalence: examData.existingEquivalence,
          }) &&
          !examData.selectedCanonicalRisk?.id
        ) {
          enqueueSnackbar(
            'Vínculo salvo. Regra padrão da Biblioteca não foi publicada.',
            { variant: 'info' },
          );
        }
        examData.callback(exam);
        savedExam = exam;
      } else {
        const exam = await updateMutation.mutateAsync(submitData);
        if ((exam as any)?.systemRule) {
          const systemRule = (exam as any).systemRule;
          if (systemRule.action === 'created') {
            enqueueSnackbar('Regra padrão publicada na Biblioteca Risco × Exame.', {
              variant: 'info',
            });
          } else if (systemRule.action === 'alreadyExists') {
            enqueueSnackbar(
              systemRule.reason ||
                'Regra padrão já existente na Biblioteca para este agente e exame.',
              { variant: 'info' },
            );
          } else if (systemRule.action === 'skipped' && systemRule.reason) {
            enqueueSnackbar(systemRule.reason, { variant: 'warning' });
          } else if (systemRule.reason) {
            enqueueSnackbar(systemRule.reason, { variant: 'warning' });
          }
        } else if (
          isMasterAdmin &&
          examData.publishAsSystemRule &&
          requiresEquivalenceForPublish({
            risk: examData.risk,
            riskIsCatalogForPublish: examData.riskIsCatalogForPublish,
            existingEquivalence: examData.existingEquivalence,
          }) &&
          !examData.selectedCanonicalRisk?.id
        ) {
          enqueueSnackbar(
            'Vínculo salvo. Regra padrão da Biblioteca não foi publicada.',
            { variant: 'info' },
          );
        }
        examData.callback(exam);
        savedExam = exam;
      }

      await refetchExamsRiskList();
      if (saveIntentRef.current === 'stay') {
        const next = {
          ...examData,
          ...submitData,
          ...(savedExam?.id ? { id: savedExam.id } : {}),
          error: { risk: false, exam: false },
        };
        initialDataRef.current = getExamRiskEditorSnapshot(
          next as any,
          getValues(),
        );
        setExamData(next as any);
        reset(getValues());
        saveIntentRef.current = 'exit';
        return;
      }
      onClose();
    } catch {
      // Snackbar exibido pelo onError das mutations.
    }
  };

  const onSelectCheck = (isChecked: boolean, type: keyof IExamRiskData) => {
    setExamData((oldData) => ({
      ...oldData,
      [type]: isChecked,
    }));

    if (type === 'isPeriodic') {
      setValue('isPeriodic', isChecked);
      clearErrors('validityInMonths');
      void trigger('validityInMonths');
    }
  };

  const onRemove = () => {
    if (loading) return;

    const remove = async () => {
      try {
        if (examData.id && companyId) {
          await deleteMutation.mutateAsync({
            id: examData.id,
            companyId: companyId,
          });
          await refetchExamsRiskList();
        }

        onClose();
      } catch {
        // Snackbar exibido pelo onError da mutation.
      }
    };

    preventDelete(remove);
  };

  const isEdit = !!examData?.id;

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    examData,
    onSubmit,
    loading,
    control,
    handleSubmit,
    setExamData,
    switchRef,
    isEdit,
    onSelectCheck,
    onRemove,
    setValue,
    isMasterAdmin,
    companyId,
    isDirty,
    setSaveIntent,
  };
};

export type IUseEditExam = ReturnType<typeof useEditExams>;
