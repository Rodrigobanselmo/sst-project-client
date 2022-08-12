/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

export const initialAutomateSubOfficeState = {
  hierarchyId: '',
  hierarchy: {} as IHierarchy,
  companyId: '',
  selectedEmployees: [] as IEmployee[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (hierarchy: Partial<IHierarchy> | null) => {},
};

const modalName = ModalEnum.AUTOMATE_SUB_OFFICE;

export const useHandleModal = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialAutomateSubOfficeState);
  const { companyId } = useGetCompanyId();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialAutomateSubOfficeState,
  });

  const onClose = useCallback(
    (data?: any) => {
      onCloseModal(modalName, data);
      setData(initialAutomateSubOfficeState);
    },
    [onCloseModal],
  );

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialAutomateSubOfficeState>>(modalName);

    if (initialData) {
      setData((oldData) => {
        const newData = {
          ...initialAutomateSubOfficeState,
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, onClose]);

  const onCloseUnsaved = () => {
    if (preventUnwantedChanges(data, initialDataRef.current, onClose)) return;
    onClose();
  };

  const onAddArray = (
    value: IEmployee,
    type: 'selectedEmployees' = 'selectedEmployees',
  ) => {
    setData({
      ...data,
      [type]: [...(data as any)[type], value],
    });
  };

  const onDeleteArray = (
    value: IEmployee,
    type: 'selectedEmployees' = 'selectedEmployees',
  ) => {
    setData({
      ...data,
      [type]: [
        ...(data as any)[type].filter(
          (item: IEmployee) => item.id !== value.id,
        ),
      ],
    });
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,
    initialDataRef,
    companyId: data.companyId || companyId,
    onAddArray,
    onDeleteArray,
  };
};

export type IUseAutomateSubOffice = ReturnType<typeof useHandleModal>;
