/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { RiskEnum } from 'project/enum/risk.enums';
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
} from 'core/interfaces/api/IRiskFactors';
import { useMutUpdateGenerateSource } from 'core/services/hooks/mutations/checklist/generate/useMutUpdateGenerateSource';
import { useMutCreateRisk } from 'core/services/hooks/mutations/checklist/risk/useMutCreateRisk';
import { useMutUpdateRisk } from 'core/services/hooks/mutations/checklist/risk/useMutUpdateRisk';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk/useQueryRisk';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { IRiskSchema, riskSchema } from 'core/utils/schemas/risk.schema';

export const initialAddRiskState = {
  status: StatusEnum.ACTIVE,
  severity: 0,
  name: '',
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
  ipvs: undefined as undefined | string,
  pv: undefined as undefined | string,
  pe: undefined as undefined | string,
  breather: undefined as undefined | string,
  coments: undefined as undefined | string,
  fraction: undefined as undefined | string,
  tlv: undefined as undefined | string,
  carnogenicityACGIH: undefined as undefined | string,
  carnogenicityLinach: undefined as undefined | string,
};

export const useAddRisk = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAddRiskState);

  const { handleSubmit, control, reset, getValues, setValue, watch } = useForm({
    resolver: yupResolver(Yup.object().shape(riskSchema)),
  });

  const type = watch('type');

  const createRiskMut = useMutCreateRisk();
  const updateRiskMut = useMutUpdateRisk();
  const updateGenerateSourceMut = useMutUpdateGenerateSource();

  const { preventUnwantedChanges } = usePreventAction();

  const [riskData, setRiskData] = useState(initialAddRiskState);

  const { data: risk, isLoading: riskLoading } = useQueryRisk({
    id: riskData.id,
    companyId: riskData.companyId,
  });

  useEffect(() => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isAddRecMed,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isAddGenerateSource,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      remove,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      edit: editPass,
      ...initialData
    } = getModalData<any>(ModalEnum.RISK_ADD);

    setRiskData((oldData) => {
      const newData = {
        ...oldData,
        ...(initialData && initialData),
        ...risk,
      };

      initialDataRef.current = newData;

      return newData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risk]);

  useEffect(() => {
    const {
      isAddRecMed,
      isAddGenerateSource,
      remove,
      edit: editPass,
      ...initialData
    } = getModalData<any>(ModalEnum.RISK_ADD);

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
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setRiskData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onSubmit: SubmitHandler<
    IRiskSchema & Partial<typeof initialAddRiskState>
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
    ipvs,
    pv,
    pe,
    breather,
    coments,
    fraction,
    tlv,
    carnogenicityACGIH,
    carnogenicityLinach,
  }) => {
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

    const risk = {
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
      isEmergency,
      ...(esocial?.id && { esocialCode: esocial?.id }),
      method,
      propagation,
      esocial,
      unit,
      cas,
      nr15lt,
      twa,
      stel,
      ipvs,
      pv,
      pe,
      breather,
      coments,
      fraction,
      tlv,
      carnogenicityACGIH,
      carnogenicityLinach,
    };

    if (riskData.companyId) risk.companyId = riskData.companyId;

    //  add risk then connect generate source with recMed
    if (risk.id == '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...riskData } = risk;
      const create = await createRiskMut.mutateAsync(riskData).catch(() => {});
      recMed.map(async (rm) => {
        if (rm.generateSourceLocalId != undefined) {
          const gsLocal = generateSource.find(
            (gs) => gs.localId === rm.generateSourceLocalId,
          );
          if (gsLocal && create?.id) {
            const gsServer = create.generateSource.find(
              (gs) => gs.name === gsLocal.name,
            );

            const rmServer = create.recMed.find(
              (rmServer) =>
                rmServer.recName === rm.recName &&
                rmServer.medName === rm.medName,
            );
            if (gsServer && rmServer)
              updateGenerateSourceMut.mutate({
                id: gsServer.id,
                riskId: create.id,
                recMeds: [{ id: rmServer.id }],
              });
          }
        }
      });
    } else {
      await updateRiskMut.mutateAsync(risk).catch(() => {});
    }

    onClose();
  };

  const onClose = () => {
    onCloseModal(ModalEnum.RISK_ADD);
    setRiskData(initialAddRiskState);
    reset();
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
    type,
  };
};

export type IUseAddRisk = ReturnType<typeof useAddRisk>;
