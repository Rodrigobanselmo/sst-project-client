/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';

import { heatSchema } from './../../../../../core/utils/schemas/heat.schema';

export const initialQuantityState = {
  id: '',
  risk: {
    stel: '',
    twa: '',
    nr15lt: '',
    vmp: '',
  } as IRiskFactors,

  shortDuration: false,
  longDuration: false,

  stelValue: '',
  twaValue: '',
  vmpValue: '',
  nr15ltValue: '',

  ltcatq3: '',
  ltcatq5: '',
  nr15q5: '',

  aren: '',
  vdvr: '',

  doseFB: '',
  doseEye: '',
  doseSkin: '',
  doseHand: '',
  doseFBPublic: '',
  doseEyePublic: '',
  doseSkinPublic: '',

  ibtug: '',
  mw: '',
  isAcclimatized: false,
  clothesType: '' as number | '',

  type: '',

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate: (value: any) => {},
};

interface ISubmit {
  stel?: string;
  vmp?: string;
  twa?: string;
  nr15lt?: string;
  stelValue?: string;
  twaValue?: string;
  vmpValue?: string;
  nr15ltValue?: string;
  unit?: string;

  ltcatq3?: string;
  ltcatq5?: string;
  nr15q5?: string;

  aren?: string;
  vdvr?: string;

  doseFB?: string;
  doseEye?: string;
  doseSkin?: string;
  doseHand?: string;
  doseFBPublic?: string;
  doseEyePublic?: string;
  doseSkinPublic?: string;

  ibtug?: string;
  mw?: string;
  clothesType?: number;

  type: QuantityTypeEnum;
}

const modalName = ModalEnum.QUANTITY_ADD;

export const useModalAddQuantity = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialQuantityState);

  const updateMutation = useMutUpdateCompany();
  const cepMutation = useMutationCEP();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialQuantityState,
  });

  const { handleSubmit, control, reset, getValues, setValue } = useForm<any>({
    resolver: yupResolver(heatSchema),
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialQuantityState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };
        newData.longDuration = !!newData.twaValue || !!newData.nr15ltValue;
        newData.shortDuration = !!newData.stelValue || !!newData.vmpValue;

        if (typeof newData.clothesType === 'number')
          setValue('clothesType', newData.clothesType);
        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, setValue]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialQuantityState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...data, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (dataFrom) => {
    let submit = {} as any;

    if (data.type == QuantityTypeEnum.QUI)
      submit = {
        // eslint-disable-next-line prettier/prettier
        stelValue: (dataFrom.stelValue || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        twaValue: (dataFrom.twaValue || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        nr15ltValue: (dataFrom.nr15ltValue || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        vmpValue: (dataFrom.vmpValue || '').replaceAll('.', '').replace(',', '.'),
        stel: (dataFrom.stel || '').replaceAll('.', '').replace(',', '.'),
        twa: (dataFrom.twa || '').replaceAll('.', '').replace(',', '.'),
        nr15lt: (dataFrom.nr15lt || '').replaceAll('.', '').replace(',', '.'),
        vmp: (dataFrom.vmp || '').replaceAll('.', '').replace(',', '.'),
        type: QuantityTypeEnum.QUI,
        unit: dataFrom?.unit || undefined,
      };

    if (data.type == QuantityTypeEnum.NOISE)
      submit = {
        ltcatq5: (dataFrom.ltcatq5 || '').replaceAll('.', '').replace(',', '.'),
        ltcatq3: (dataFrom.ltcatq3 || '').replaceAll('.', '').replace(',', '.'),
        nr15q5: (dataFrom.nr15q5 || '').replaceAll('.', '').replace(',', '.'),
        type: QuantityTypeEnum.NOISE,
      };

    if (data.type == QuantityTypeEnum.HEAT) {
      submit = {
        ibtug: (dataFrom.ibtug || '').replaceAll('.', '').replace(',', '.'),
        mw: (dataFrom.mw || '').replaceAll('.', '').replace(',', '.'),
        isAcclimatized: data.isAcclimatized,
        clothesType: dataFrom.clothesType,
        type: QuantityTypeEnum.HEAT,
      };
    }

    if (data.type == QuantityTypeEnum.VFB)
      submit = {
        aren: (dataFrom.aren || '').replaceAll('.', '').replace(',', '.'),
        vdvr: (dataFrom.vdvr || '').replaceAll('.', '').replace(',', '.'),
        type: QuantityTypeEnum.VFB,
      };

    if (data.type == QuantityTypeEnum.VL)
      submit = {
        aren: (dataFrom.aren || '').replaceAll('.', '').replace(',', '.'),
        type: QuantityTypeEnum.VL,
      };

    if (data.type == QuantityTypeEnum.RADIATION)
      submit = {
        doseFB: (dataFrom.doseFB || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        doseFBPublic: (dataFrom.doseFBPublic || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        doseEye: (dataFrom.doseEye || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        doseEyePublic: (dataFrom.doseEyePublic || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        doseSkin: (dataFrom.doseSkin || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        doseSkinPublic: (dataFrom.doseSkinPublic || '').replaceAll('.', '').replace(',', '.'),
        // eslint-disable-next-line prettier/prettier
        doseHand: (dataFrom.doseHand || '').replaceAll('.', '').replace(',', '.'),
        type: QuantityTypeEnum.RADIATION,
      };

    data.onCreate && data.onCreate(submit);

    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    onSubmit,
    loading: updateMutation.isLoading,
    loadingCep: cepMutation.isLoading,
    control,
    handleSubmit,
    data,
    setData,
    modalName,
    setValue,
  };
};

export type IUseModalQuantity = ReturnType<typeof useModalAddQuantity>;
