/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { GrauInsalubridadeEnum, RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';
import * as Yup from 'yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IEsocialTable24 } from 'core/interfaces/api/IEsocial';
import {
  IGenerateSourceCreate,
  IRecMedCreate,
  IRiskFactors,
  RiskFactorActivities,
} from 'core/interfaces/api/IRiskFactors';
import { useMutUpdateGenerateSource } from 'core/services/hooks/mutations/checklist/generate/useMutUpdateGenerateSource';
import { useMutCreateRisk } from 'core/services/hooks/mutations/checklist/risk/useMutCreateRisk';
import { useMutUpdateRisk } from 'core/services/hooks/mutations/checklist/risk/useMutUpdateRisk';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk/useQueryRisk';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { IRiskSchema, riskSchema } from 'core/utils/schemas/risk.schema';
import { useMutDeleteRisk } from 'core/services/hooks/mutations/checklist/risk/useMutDeleteRisk';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { isRiskFactorCatalogReadOnly } from 'core/utils/risk-factor-catalog-scope.util';
import { resolveLinkedRiskSubTypeId } from 'core/utils/risk-subtype-display.util';
import type { RiskFactorAiSuggestionKnownDataPayload } from '@v2/services/security/risk/risk-factor-ai-suggestions/service/risk-factor-ai-suggestions.types';
import type { RiskFactorAiSuggestionSourceContextPayload } from '@v2/services/security/risk/risk-factor-ai-suggestions/service/risk-factor-ai-suggestions.types';

export const initialAddRiskState = {
  status: StatusEnum.ACTIVE,
  severity: 0,
  name: '',
  synonymous: [] as string[],
  type: '',
  recMed: [] as (IRecMedCreate & { generateSourceLocalId?: number })[],
  generateSource: [] as IGenerateSourceCreate[],
  hasSubmit: false,
  isEmergency: false,
  id: '',
  companyId: '',
  risk: undefined as string | undefined,
  symptoms: undefined as string | undefined,
  method: undefined as string | undefined,
  propagation: undefined as string | undefined,
  esocial: undefined as IEsocialTable24 | undefined,
  unit: undefined as undefined | string,
  cas: undefined as undefined | string,
  nr15lt: undefined as undefined | string,
  twa: undefined as undefined | string,
  stel: undefined as undefined | string,
  acgihCeiling: undefined as undefined | string,
  ipvs: undefined as undefined | string,
  nioshRel: undefined as undefined | string,
  nioshStel: undefined as undefined | string,
  nioshCeiling: undefined as undefined | string,
  oshaPel: undefined as undefined | string,
  oshaStel: undefined as undefined | string,
  oshaCeiling: undefined as undefined | string,
  aihaWeel: undefined as undefined | string,
  aihaWeelCeiling: undefined as undefined | string,
  pv: undefined as undefined | string,
  pe: undefined as undefined | string,
  breather: undefined as undefined | string,
  coments: undefined as undefined | string,
  fraction: undefined as undefined | string,
  tlv: undefined as undefined | string,
  otherAppendix: undefined as undefined | string,
  appendix: undefined as undefined | string,
  carnogenicityACGIH: undefined as undefined | string,
  carnogenicityLinach: undefined as undefined | string,
  activities: [] as RiskFactorActivities[],
  subType: undefined as string | undefined,
  grauInsalubridade: undefined as GrauInsalubridadeEnum | undefined,
};

type IUseAddRiskOptions = {
  initialData?: Partial<typeof initialAddRiskState>;
  disableModalClose?: boolean;
  onSubmitSuccess?: (created?: IRiskFactors) => void;
  onCancel?: () => void;
  /** Quando `inline`, o formulário pode expandir campos longos (ex.: página de fatores de risco). */
  riskEditorLayout?: 'modal' | 'inline';
  /** Contexto de origem para sugestão por IA (Etapa B v2). */
  aiSuggestionSourceContext?: RiskFactorAiSuggestionSourceContextPayload;
  /** Dados extras para enriquecer payload da IA (ex.: parse do PDF no fluxo HO). */
  aiSuggestionKnownDataExtras?: Partial<RiskFactorAiSuggestionKnownDataPayload>;
};

export const useAddRisk = (options?: IUseAddRiskOptions) => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddRiskState);

  const { handleSubmit, control, reset, getValues, setValue, watch, getFieldState } =
    useForm<any>({
      resolver: yupResolver(Yup.object().shape(riskSchema)),
    });

  const type = watch('type');

  const createRiskMut = useMutCreateRisk();
  const updateRiskMut = useMutUpdateRisk();
  const deleteRiskMut = useMutDeleteRisk();
  const updateGenerateSourceMut = useMutUpdateGenerateSource();
  const { isMaster } = useAccess();
  const { user } = useGetCompanyId(true);

  const { preventUnwantedChanges } = usePreventAction();

  const [riskData, setRiskData] = useState(initialAddRiskState);

  const { data: risk, isLoading: riskLoading } = useQueryRisk(
    {
      id: riskData.id,
      companyId: riskData.companyId,
    },
    options?.riskEditorLayout === 'inline'
      ? { refetchOnMount: 'always' }
      : undefined,
  );

  const catalogRiskSource = risk ?? riskData;

  const isCatalogReadOnly = useMemo(
    () =>
      isRiskFactorCatalogReadOnly({
        risk: catalogRiskSource,
        isMaster,
        userCompanyId: user?.companyId,
      }),
    [catalogRiskSource, isMaster, user?.companyId],
  );

  useEffect(() => {
    const subTypeId =
      resolveLinkedRiskSubTypeId(risk) ??
      resolveLinkedRiskSubTypeId(
        options?.initialData as {
          subTypes?: IRiskFactors['subTypes'];
          subType?: string | number | null;
        },
      );
    const modalData = getModalData<any>(ModalEnum.RISK_ADD) || {};
    const initialDataProps = {
      ...modalData,
      ...(options?.initialData || {}),
    };
    const {
      isAddRecMed,
      isAddGenerateSource,
      remove,
      edit: editPass,
      ...initialData
    } = initialDataProps;

    setRiskData((oldData) => {
      const severityDirty = getFieldState('severity').isDirty;
      const riskDirty = getFieldState('risk').isDirty;
      const symptomsDirty = getFieldState('symptoms').isDirty;

      const newData = {
        ...oldData,
        ...(initialData && initialData),
        ...risk,
        subType: subTypeId,
      };

      if (severityDirty) {
        newData.severity = oldData.severity;
      }

      if (riskDirty) {
        newData.risk = oldData.risk;
      }

      if (symptomsDirty) {
        newData.symptoms = oldData.symptoms;
      }

      initialDataRef.current = newData;

      return newData;
    });

    setValue(
      'activities',
      risk?.activities ||
        initialData.activities ||
        initialAddRiskState.activities ||
        [],
    );

    setValue('otherAppendix', risk?.otherAppendix);

    if (!getFieldState('subType').isDirty) {
      setValue('subType', subTypeId ?? '');
    }

    setValue('grauInsalubridade', risk?.grauInsalubridade ?? null);

    if (risk?.severity && !getFieldState('severity').isDirty) {
      setValue('severity', String(risk.severity));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risk, options?.initialData]);

  useEffect(() => {
    const modalData = getModalData<any>(ModalEnum.RISK_ADD) || {};
    const initialDataProps = {
      ...modalData,
      ...(!Object.keys(modalData).length ? options?.initialData : {}),
    };

    const {
      isAddRecMed,
      isAddGenerateSource,
      remove,
      edit: editPass,
      ...initialData
    } = initialDataProps;

    const edit = !!initialData.id || editPass;

    if (isAddRecMed) {
      return setRiskData((oldData) => {
        if (remove) {
          return {
            ...oldData,
            recMed: oldData.recMed.filter(
              (item) => item.localId !== initialData.localId,
            ),
          };
        }

        if (edit) {
          const data = [...oldData.recMed];
          const indexItem = oldData.recMed.findIndex(
            (item) => item.localId === initialData.localId,
          );

          data[indexItem] = { ...data[indexItem], ...initialData };

          return {
            ...oldData,
            recMed: data,
          };
        }

        const result = removeDuplicate(
          [
            ...oldData.recMed,
            { ...initialData, localId: oldData.recMed.length },
          ],
          { removeFields: ['status'] },
        );

        return {
          ...oldData,
          recMed: result,
        };
      });
    }

    if (isAddGenerateSource) {
      return setRiskData((oldData) => {
        if (remove) {
          return {
            ...oldData,
            generateSource: oldData.generateSource.filter(
              (item) => item.localId !== initialData.localId,
            ),
          };
        }

        if (edit) {
          const data = [...oldData.generateSource];
          const indexItem = oldData.generateSource.findIndex(
            (item) => item.localId === initialData.localId,
          );

          data[indexItem] = { ...data[indexItem], ...initialData };

          return {
            ...oldData,
            generateSource: data,
          };
        }

        const result = removeDuplicate(
          [
            ...oldData.generateSource,
            { ...initialData, localId: oldData.generateSource.length },
          ],
          { removeFields: ['status'] },
        );

        const resultRecMedFromSource = removeDuplicate(
          [
            ...oldData.recMed,
            {
              ...initialData.recMeds[0],
              localId: oldData.recMed.length,
              generateSourceLocalId: oldData.generateSource.length,
            },
          ],
          { removeFields: ['status'] },
        ).filter((i) => i.recName || i.medName);

        return {
          ...oldData,
          generateSource: result,
          recMed: resultRecMedFromSource,
        };
      });
    }

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setRiskData((oldData) => {
        const severityDirty = getFieldState('severity').isDirty;
        const riskDirty = getFieldState('risk').isDirty;
        const symptomsDirty = getFieldState('symptoms').isDirty;

        const newData = {
          ...oldData,
          ...initialData,
        };

        if (severityDirty) {
          newData.severity = oldData.severity;
        }

        if (riskDirty) {
          newData.risk = oldData.risk;
        }

        if (symptomsDirty) {
          newData.symptoms = oldData.symptoms;
        }

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, getFieldState, options?.initialData]);

  useEffect(() => {
    const initialData = options?.initialData;
    if (!initialData) return;

    const syncField = (name: string, value?: string | number | null) => {
      if (value == null || value === '') return;
      if (getFieldState(name).isDirty) return;
      setValue(name, value);
    };

    syncField('type', initialData.type);
    syncField('unit', initialData.unit);
    syncField('propagation', initialData.propagation);
    syncField('method', initialData.method);
    syncField('cas', initialData.cas);
    syncField('name', initialData.name);
    syncField('oshaPel', initialData.oshaPel);
    syncField('oshaStel', initialData.oshaStel);
    syncField('oshaCeiling', initialData.oshaCeiling);
    syncField('nioshRel', initialData.nioshRel);
    syncField('nioshStel', initialData.nioshStel);
    syncField('nioshCeiling', initialData.nioshCeiling);
    syncField('ipvs', initialData.ipvs);
    syncField('twa', initialData.twa);
    syncField('stel', initialData.stel);
    syncField('acgihCeiling', initialData.acgihCeiling);
    syncField('aihaWeel', initialData.aihaWeel);
    syncField('aihaWeelCeiling', initialData.aihaWeelCeiling);
    syncField('coments', initialData.coments);
  }, [options?.initialData, getFieldState, setValue]);

  const onSubmit: SubmitHandler<
    IRiskSchema & Partial<typeof initialAddRiskState> & { synonymous?: string }
  > = async ({
    name,
    type,
    severity,
    risk: riskHealth,
    symptoms,
    method,
    propagation,
    unit,
    cas,
    nr15lt,
    twa,
    stel,
    acgihCeiling,
    ipvs,
    nioshRel,
    nioshStel,
    nioshCeiling,
    oshaPel,
    oshaStel,
    oshaCeiling,
    aihaWeel,
    aihaWeelCeiling,
    pv,
    pe,
    breather,
    coments,
    fraction,
    tlv,
    appendix,
    otherAppendix,
    carnogenicityACGIH,
    carnogenicityLinach,
    activities,
    subType,
    grauInsalubridade,
    synonymous,
  }) => {
    if (isCatalogReadOnly) return;

    const {
      esocial,
      id,
      companyId,
      recMed,
      generateSource,
      status,
      isEmergency,
    } = riskData;
    const typeValue = type as RiskEnum;
    const synonymousArray =
      synonymous
        ?.split(';')
        .map((s: string) => s.trim())
        .filter(Boolean) || [];
    const risk = {
      activities: activities?.filter((a) => a.description),
      id,
      companyId,
      recMed,
      generateSource,
      status,
      name,
      type: typeValue,
      severity,
      risk: riskHealth,
      symptoms,
      subTypesIds: [subType].filter(Boolean),
      isEmergency,
      ...(esocial?.id && { esocialCode: esocial?.id }),
      method,
      propagation: Array.isArray(propagation)
        ? propagation
        : propagation?.split(', ') || [],
      synonymous: synonymousArray,
      esocial,
      unit,
      cas,
      nr15lt,
      twa,
      stel,
      acgihCeiling,
      ipvs,
      nioshRel,
      nioshStel,
      nioshCeiling,
      oshaPel,
      oshaStel,
      oshaCeiling,
      aihaWeel,
      aihaWeelCeiling,
      pv,
      pe,
      breather,
      coments,
      fraction,
      tlv,
      carnogenicityACGIH,
      carnogenicityLinach,
      appendix,
      otherAppendix,
      grauInsalubridade: grauInsalubridade || null,
    };

    if (riskData.companyId) risk.companyId = riskData.companyId;

    let createdRisk: IRiskFactors | undefined;

    //  add risk then connect generate source with recMed
    if (risk.id == '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...riskData } = risk;
      createdRisk =
        (await createRiskMut.mutateAsync(riskData).catch(() => undefined)) ??
        undefined;
      recMed.map(async (rm) => {
        if (rm.generateSourceLocalId != undefined) {
          const gsLocal = generateSource.find(
            (gs) => gs.localId === rm.generateSourceLocalId,
          );
          if (gsLocal && createdRisk?.id) {
            const gsServer = createdRisk.generateSource.find(
              (gs) => gs.name === gsLocal.name,
            );

            const rmServer = createdRisk.recMed.find(
              (rmServer) =>
                rmServer.recName === rm.recName &&
                rmServer.medName === rm.medName,
            );
            if (gsServer && rmServer)
              updateGenerateSourceMut.mutate({
                id: gsServer.id,
                riskId: createdRisk.id,
                recMeds: [{ id: rmServer.id }],
              });
          }
        }
      });
    } else {
      if (risk.status === StatusEnum.INACTIVE) {
        await deleteRiskMut.mutateAsync(risk.id).catch(() => {});
      } else {
        await updateRiskMut.mutateAsync(risk).catch(() => {});
        createdRisk = risk as unknown as IRiskFactors;
      }
    }

    options?.onSubmitSuccess?.(createdRisk);
    onClose();
  };

  const onClose = () => {
    if (!options?.disableModalClose) {
      onCloseModal(ModalEnum.RISK_ADD);
    }
    setRiskData(initialAddRiskState);
    reset();
    options?.onCancel?.();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...riskData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: createRiskMut.isLoading || updateRiskMut.isLoading || riskLoading,
    riskData,
    setRiskData,
    control,
    handleSubmit,
    setValue,
    getValues,
    type,
    watch,
    riskEditorLayout: options?.riskEditorLayout ?? 'modal',
    aiSuggestionSourceContext: options?.aiSuggestionSourceContext,
    aiSuggestionKnownDataExtras: options?.aiSuggestionKnownDataExtras,
    isCatalogReadOnly,
  };
};

export type IUseAddRisk = ReturnType<typeof useAddRisk>;
