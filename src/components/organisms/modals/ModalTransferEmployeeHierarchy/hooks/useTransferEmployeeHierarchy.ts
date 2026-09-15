/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';
import * as yup from 'yup';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useListHierarchyQuery } from 'core/hooks/useListHierarchyQuery';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutTransferEmployeeHisHier } from 'core/services/hooks/mutations/manager/employee-history/useMutTransferEmployeeHisHier/useMutTransferEmployeeHisHier';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';
import { cleanObjectNullValues } from 'core/utils/helpers/cleanObjectValues';

import {
  buildEmployeeHierarchyTransferPayload,
  resolveCurrentEmployeeAllocation,
  suggestDestinationWorkspaceId,
} from '../employee-hierarchy-transfer.util';

export const initialEmployeeHierarchyTransferState = {
  employeeId: undefined as undefined | number,
  companyId: undefined as undefined | string,
  employee: undefined as undefined | IEmployee,
  lastStartDate: undefined as undefined | Date | string | null,
  workspaceId: undefined as undefined | string,
  startDate: new Date() as Date | undefined,
  motive: EmployeeHierarchyMotiveTypeEnum.TRANS as
    | undefined
    | EmployeeHierarchyMotiveTypeEnum,
  hierarchy: undefined as undefined | IHierarchy,
  hierarchyId: undefined as undefined | string,
  sector: undefined as undefined | IHierarchy,
  subOffice: undefined as undefined | IHierarchy,
  errors: {
    workspace: false,
    sector: false,
    hierarchy: false,
  },
};

const modalName = ModalEnum.EMPLOYEE_HIERARCHY_TRANSFER;

const transferSchema = yup.object().shape({
  motive: yup.string().trim().required('Campo obrigatório'),
  startDate: yup.mixed().required('Data obrigatório'),
  workspaceId: yup.string().trim().required('Estabelecimento obrigatório'),
});

export const useTransferEmployeeHierarchy = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialEmployeeHierarchyTransferState);
  const prefilledWorkspaceRef = useRef(false);

  const { handleSubmit, control, reset, getValues, setValue } = useForm<any>({
    resolver: yupResolver(transferSchema),
  });

  const transferMutation = useMutTransferEmployeeHisHier();
  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialEmployeeHierarchyTransferState,
  });

  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(data);
  const { data: company } = useQueryCompany(companyId);
  const { hierarchyTree } = useListHierarchyQuery(companyId);
  const { data: employeeQuery } = useQueryEmployee(
    { id: data.employeeId, companyId },
    { enabled: !!data.employeeId },
  );

  const employee = employeeQuery || data.employee;
  const companyWorkspaces = company?.workspace || [];

  const currentAllocation = useMemo(
    () =>
      resolveCurrentEmployeeAllocation({
        employee,
        hierarchyTree,
        companyWorkspaces,
        lastStartDate: data.lastStartDate,
      }),
    [companyWorkspaces, data.lastStartDate, employee, hierarchyTree],
  );

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEmployeeHierarchyTransferState>>(
        modalName,
      );

    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const newData = {
          ...initialEmployeeHierarchyTransferState,
          ...oldData,
          ...cleanObjectNullValues(initialData),
          startDate: initialData.startDate || new Date(),
          motive:
            initialData.motive || EmployeeHierarchyMotiveTypeEnum.TRANS,
        };

        initialDataRef.current = newData;
        prefilledWorkspaceRef.current = false;
        return newData;
      });
    }
  }, [getModalData]);

  useEffect(() => {
    if (prefilledWorkspaceRef.current || data.workspaceId) return;

    const suggested = suggestDestinationWorkspaceId({
      currentWorkspaces: currentAllocation.workspaces,
      companyWorkspaces,
    });
    if (!suggested) return;

    prefilledWorkspaceRef.current = true;
    setData((old) => ({ ...old, workspaceId: suggested }));
    setValue('workspaceId', suggested);
  }, [companyWorkspaces, currentAllocation.workspaces, data.workspaceId, setValue]);

  const onClose = (closeData?: any) => {
    onCloseModal(modalName, closeData);
    setData(initialEmployeeHierarchyTransferState);
    prefilledWorkspaceRef.current = false;
    reset();
  };

  const onSubmit: SubmitHandler<any> = async (dataForm) => {
    if (!data.workspaceId && !dataForm.workspaceId) {
      setData({
        ...data,
        errors: { ...data.errors, workspace: true },
      });
      return;
    }
    if (!data.sector?.id) {
      setData({
        ...data,
        errors: { ...data.errors, sector: true, hierarchy: true },
      });
      return;
    }
    if (!data.hierarchy?.id) {
      setData({
        ...data,
        errors: { ...data.errors, hierarchy: true },
      });
      return;
    }

    const payload = buildEmployeeHierarchyTransferPayload({
      employeeId: data.employeeId,
      hierarchyId: data.hierarchy?.id,
      subOfficeId: data.subOffice?.id,
      startDate: data.startDate || dataForm.startDate,
      motive: dataForm.motive || data.motive,
      workspaceId: dataForm.workspaceId || data.workspaceId,
    });

    if (!payload) return;

    try {
      await transferMutation.mutateAsync({
        ...payload,
        companyId,
      });
      onClose();
    } catch {
      // keep the modal open and preserve the filled fields
    }
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    const before = { ...initialDataRef.current } as any;
    const after = { ...data, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading: transferMutation.isLoading,
    control,
    handleSubmit,
    modalName,
    data,
    setData,
    setValue,
    companyId,
    companyWorkspaces,
    currentAllocation,
  };
};
