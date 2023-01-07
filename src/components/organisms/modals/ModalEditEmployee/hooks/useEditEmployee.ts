import { useEffect, useRef, useCallback, useState } from 'react';

import clone from 'clone';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { SexTypeEnum } from 'project/enum/sex.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICbo } from 'core/interfaces/api/ICbo';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutCreateEmployee } from 'core/services/hooks/mutations/manager/useMutCreateEmployee';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';
import { useFetchQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';

import { IEmployee } from './../../../../../core/interfaces/api/IEmployee';

export const initialEditEmployeeState = {
  id: undefined as number | undefined,
  status: StatusEnum.ACTIVE,
  name: undefined as string | undefined,
  cpf: undefined as string | undefined,
  hierarchyId: undefined as string | undefined,
  companyId: undefined as string | undefined,
  company: undefined as ICompany | undefined,
  hierarchy: {} as IHierarchy | ITreeMapObject,
  esocialCode: undefined as string | undefined,
  socialName: undefined as string | undefined,
  nickname: undefined as string | undefined,
  phone: undefined as string | undefined,
  email: undefined as string | undefined,
  cbo: undefined as string | undefined,
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
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialEditEmployeeState);

  const updateEmployee = useMutUpdateEmployee();
  const createEmployee = useMutCreateEmployee();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialEditEmployeeState,
  });

  const isEdit = !!data.id;

  const { data: employee, isLoading: employeeLoading } = useQueryEmployee({
    id: data.id,
    companyId: data.companyId,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEditEmployeeState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setData((oldData) => {
        const replaceData = {} as any;

        Object.keys(oldData).map((key) => {
          if (key in initialData) {
            replaceData[key] =
              (initialData as any)[key] ||
              (initialEditEmployeeState as any)[key];
          }
        });

        const newData = {
          ...oldData,
          ...replaceData,
          ...employee,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, employee]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialEditEmployeeState);
  };

  const onCloseUnsaved = (action?: () => void, values?: any) => {
    const button = document.getElementById(IdsEnum.CANCEL_BUTTON);
    if (button && values == undefined && action == undefined) {
      return button?.click();
    }
    const before = clone(initialDataRef.current);
    const after = clone({ ...data, ...(values || {}) });

    delete after.company;
    delete before.company;

    if (preventUnwantedChanges(before, after, onClose)) return;
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
    loading:
      updateEmployee.isLoading || createEmployee.isLoading || employeeLoading,
    modalName,
    onStackOpenModal,
  };
};

export type IUseEditEmployee = ReturnType<typeof useEditEmployee>;
