/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { SexTypeEnum } from 'project/enum/risk.enums copy';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutCreateEmployee } from 'core/services/hooks/mutations/manager/useMutCreateEmployee';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';

import { IEmployee } from './../../../../../core/interfaces/api/IEmployee';

export const initialEmployeeState = {
  id: undefined as number | undefined,
  status: StatusEnum.ACTIVE,
  name: undefined as string | undefined,
  cpf: undefined as string | undefined,
  companyId: undefined as string | undefined,
  hierarchy: {} as IHierarchy | ITreeMapObject,
  esocialCode: undefined as string | undefined,
  socialName: undefined as string | undefined,
  nickname: undefined as string | undefined,
  phone: undefined as string | undefined,
  email: undefined as string | undefined,
  isComorbidity: false,
  sex: undefined as SexTypeEnum | undefined,
  cidId: undefined,
  shiftId: undefined as number | undefined,
  birthday: undefined as Date | undefined,
  subOffices: undefined as IHierarchy[] | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (employee: IEmployee | null) => {},
};

const modalName = ModalEnum.EMPLOYEES_ADD;

export const useEditEmployee = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEmployeeState);

  const updateEmployee = useMutUpdateEmployee();
  const createEmployee = useMutCreateEmployee();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialEmployeeState,
  });

  const isEdit = !!data.id;

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEmployeeState>>(modalName);

    if (initialData) {
      setData((oldData) => {
        const replaceData = {} as any;

        Object.keys(oldData).map((key) => {
          if (key in initialData) {
            replaceData[key] =
              (initialData as any)[key] || (initialEmployeeState as any)[key];
          }
        });

        const newData = {
          ...oldData,
          ...replaceData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialEmployeeState);
  };

  const onCloseUnsaved = (action?: () => void) => {
    if (preventUnwantedChanges(data, initialDataRef.current, onClose)) return;
    onClose();
    action?.();
  };

  const onSubmitData = async (
    submitData: any,
    nextStep: () => void,
    { save }: { save?: boolean } = { save: true },
  ) => {
    if (!isEdit && save) {
      await createEmployee
        .mutateAsync(submitData)
        .then((employee) => {
          nextStep();
          setData((data) => ({
            ...data,
            ...submitData,
            ...employee,
          }));
        })
        .catch(() => {});
    } else if (!isEdit) {
      nextStep();
      setData((data) => ({
        ...data,
        ...submitData,
      }));
    } else {
      await updateEmployee
        .mutateAsync(submitData)
        .then(() => {
          onClose();
        })
        .catch(() => {});
    }
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    createEmployee,
    updateEmployee,
    isEdit,
    onSubmitData,
    loading: updateEmployee.isLoading || createEmployee.isLoading,
    modalName,
  };
};

export type IUseEditEmployee = ReturnType<typeof useEditEmployee>;
