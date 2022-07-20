/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import {
  ICreateEmployee,
  useMutCreateEmployee,
} from 'core/services/hooks/mutations/manager/useMutCreateEmployee';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { employeeSchema } from 'core/utils/schemas/employee.schema';

import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { initialWorkspaceSelectState } from '../../ModalSelectWorkspace';

export const initialEmployeeState = {
  id: 0,
  status: StatusEnum.ACTIVE,
  name: '',
  cpf: '',
  companyId: '',
  hierarchy: {} as IHierarchy | ITreeMapObject,
  workspaces: [] as IWorkspace[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: (employee: IEmployee | null) => {},
};

interface ISubmit {
  name: string;
  cpf: string;
}

export const useEditEmployees = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { enqueueSnackbar } = useSnackbar();
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialEmployeeState);
  const switchRef = useRef<HTMLInputElement>(null);
  const { data: company } = useQueryCompany();

  const { handleSubmit, control, reset, getValues } = useForm({
    resolver: yupResolver(employeeSchema),
  });

  const createMutation = useMutCreateEmployee();
  const updateMutation = useMutUpdateEmployee();

  const { preventUnwantedChanges } = usePreventAction();

  const [employeeData, setEmployeeData] = useState({
    ...initialEmployeeState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialEmployeeState>>(
      ModalEnum.EMPLOYEES_ADD,
    );

    if (initialData) {
      setEmployeeData((oldData) => {
        let newData = {
          ...oldData,
          ...initialData,
        };

        if (company.workspace && company.workspace?.length == 1) {
          newData = {
            ...newData,
            workspaces: removeDuplicate(
              [...oldData.workspaces, ...(company as any).workspace],
              { removeById: 'id' },
            ),
          };
        }

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [company, getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.EMPLOYEES_ADD, data);
    setEmployeeData(initialEmployeeState);
    reset();
  };

  const onCloseUnsaved = () => {
    const values = getValues();
    if (
      preventUnwantedChanges(
        { ...employeeData, ...values },
        initialDataRef.current,
        onClose,
      )
    )
      return;
    onClose();
  };

  const onSubmit: SubmitHandler<ISubmit> = async (data) => {
    if (employeeData.workspaces.length === 0)
      return enqueueSnackbar(
        'Selecione um estabelecimento para adicionar um empregado',
        {
          variant: 'error',
        },
      );

    if (!employeeData.hierarchy?.id)
      return enqueueSnackbar('Selecione um cargo', {
        variant: 'error',
      });

    const submitData: ICreateEmployee & { id?: number } = {
      id: employeeData.id,
      name: data.name,
      cpf: data.cpf,
      status: employeeData.status,
      hierarchyId: String(employeeData.hierarchy?.id).split('//')[0],
    };

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation
          .mutateAsync(submitData)
          .then((employee) => employeeData.callback(employee));
      } else {
        await updateMutation
          .mutateAsync(submitData)
          .then((employee) => employeeData.callback(employee));
      }

      if (!switchRef.current?.checked) {
        onClose();
      } else {
        setEmployeeData({
          ...initialEmployeeState,
          hierarchy: employeeData.hierarchy,
          workspaces: employeeData.workspaces,
        });
        reset();
      }
    } catch (error) {}
  };

  const onAddWorkspace = () => {
    const initialWorkspaceState = {
      title: 'Selecione os Estabelecimentos que o empregado faz parte',
      multiple: true,
      selected: employeeData.workspaces,
      onSelect(workspaces: IWorkspace[]) {
        if (workspaces.length === 0) return;
        setEmployeeData({ ...employeeData, workspaces: workspaces });
      },
    } as typeof initialWorkspaceSelectState;

    onStackOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
  };

  const onAddHierarchy = () => {
    onStackOpenModal(ModalEnum.HIERARCHY_SELECT, {
      singleSelect: true,
      selectionHierarchy: [HierarchyEnum.SUB_OFFICE, HierarchyEnum.OFFICE],
      lockWorkspace: false,
      onSingleSelect: (hierarchy: ITreeMapObject) =>
        setEmployeeData({ ...employeeData, hierarchy: hierarchy }),
    } as typeof initialHierarchySelectState);
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    employeeData,
    onSubmit,
    loading: updateMutation.isLoading || createMutation.isLoading,
    control,
    handleSubmit,
    setEmployeeData,
    switchRef,
    onAddWorkspace,
    onAddHierarchy,
  };
};

export type IUseEditEmployee = ReturnType<typeof useEditEmployees>;
