/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { RiskEnum } from 'project/enum/risk.enums';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/useMutUpdateCompany';
import { useMutationCEP } from 'core/services/hooks/mutations/useMutationCep';

export const initialQuantityState = {
  id: '',
  risk: {
    stel: '',
    twa: '',
    nr15lt: '',
  } as IRiskFactors,

  stelValue: '',
  twaValue: '',
  nr15ltValue: '',

  ltcatq3: '',
  ltcatq5: '',
  nr15q3: '',

  type: '',

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate: (value: any) => {},
};

interface ISubmit {
  stel?: string;
  twa?: string;
  nr15lt?: string;
  stelValue?: string;
  twaValue?: string;
  nr15ltValue?: string;

  ltcatq3?: string;
  ltcatq5?: string;
  nr15q3?: string;

  type: QuantityTypeEnum;
}

const modalName = ModalEnum.QUANTITY_ADD;

export const useModalAddQuantity = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialQuantityState);

  const { handleSubmit, control, reset, getValues, setValue } = useForm();

  const updateMutation = useMutUpdateCompany();
  const cepMutation = useMutationCEP();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialQuantityState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialQuantityState>>(modalName);

    if (initialData) {
      setData((oldData) => {
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
        stel: (dataFrom.stel || '').replaceAll('.', '').replace(',', '.'),
        twa: (dataFrom.twa || '').replaceAll('.', '').replace(',', '.'),
        nr15lt: (dataFrom.nr15lt || '').replaceAll('.', '').replace(',', '.'),
        type: QuantityTypeEnum.QUI,
      };

    // console.log(data);
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
